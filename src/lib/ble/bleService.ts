// src/lib/ble/bleService.ts
import { BleClient, type BleDevice } from '@capacitor-community/bluetooth-le';
import { Buffer } from 'buffer';
import { encodePacket, type SosPacketData } from './packet';

// CẤU HÌNH UUID - BẮT BUỘC KHỚP VỚI FIRMWARE ACCESS RELAY
const FLOODED_SERVICE_UUID = '4f4e0001-1b45-4a1e-8f3a-2c1d9e7b5a10';
const SOS_WRITE_CHAR_UUID = '4f4e0002-1b45-4a1e-8f3a-2c1d9e7b5a10';
const NOTIFY_STATUS_CHAR_UUID = '4f4e0003-1b45-4a1e-8f3a-2c1d9e7b5a10';

// Tên thiết bị cần quét
const DEVICE_NAME_PREFIX = 'FLOODED_RELAY_';

// Hàm helper để convert DataView sang Buffer
const dataViewToBuffer = (dataView: DataView): Buffer => {
  return Buffer.from(dataView.buffer, dataView.byteOffset, dataView.byteLength);
};

// Hàm điều khiển luồng gửi SOS qua BLE
export const startSosFlow = async (): Promise<string> => {
  console.log('--- BẮT ĐẦU LUỒNG GỬI SOS BLE ---');

  try {
    // 1. Khởi tạo BleClient (nếu chưa)
    await BleClient.initialize();
    console.log('BLE Client đã khởi tạo');

    // 2. Mock dữ liệu SOS (trong app thật, lấy dữ liệu này từ UI)
    const mockSosData: SosPacketData = {
      protocolVersion: 1,
      sourceId: 'CITZ1234', // Giả danh 8 ký tự
      hazardType: 1, // 1: Flood
      severity: 3, // 3: Khẩn cấp cao
      numberOfPeople: 4,
      contactInfo: '0901234567, Nha 12A', // Tối đa 30 ký tự
      latitude: 20.95, // Vị trí giả lập
      longitude: 107.03,
      locationAccuracy: 10 // 10m accuracy
    };

    // 3. Mã hóa dữ liệu thành packet 74 byte nhị phân
    const payload = encodePacket(mockSosData);
    console.log('Đã mã hóa packet SOS (74 byte)');

    // 4. Quét tìm thiết bị Access Relay gần nhất
    console.log(`Đang quét tìm thiết bị tên: ${DEVICE_NAME_PREFIX}...`);
    let targetDevice: BleDevice | null = null;
    
    // Quét với timeout 10 giây
    await BleClient.requestLEScan(
      {
        services: [FLOODED_SERVICE_UUID], // Chỉ quét thiết bị có Service này
        namePrefix: DEVICE_NAME_PREFIX,
      },
      (result) => {
        if (result.device && result.device.name) {
          console.log(`Tìm thấy thiết bị: ${result.device.name}`);
          targetDevice = result.device;
          // Dừng quét khi tìm thấy thiết bị đầu tiên khớp tên
          BleClient.stopLEScan();
        }
      }
    );

    // Chờ quét hoàn tất (timeout 10s)
    await new Promise(resolve => setTimeout(resolve, 10000));

    if (!targetDevice) {
      throw new Error('Không tìm thấy thiết bị Access Relay nào gần đây.');
    }

    const deviceId = (targetDevice as BleDevice).deviceId;
    console.log(`Đang kết nối tới ${deviceId}...`);

    // 5. Kết nối tới thiết bị
    await BleClient.connect(deviceId, (disconnectResult) => {
      console.log(`Đã mất kết nối tới device: ${disconnectResult}`);
    });
    console.log(`Đã kết nối thành công tới Access Relay.`);

    // 6. Đăng ký nhận thông báo (Notify) từ Relay
    console.log('Đang đăng ký nhận Notify phản hồi trạng thái...');
    let relayAckId: string | null = null;
    let relayError: string | null = null;

    await BleClient.startNotifications(
      deviceId,
      FLOODED_SERVICE_UUID,
      NOTIFY_STATUS_CHAR_UUID,
      (value: DataView) => {
        // Chuyển DataView nhận được sang chuỗi ASCII
        const response = dataViewToBuffer(value).toString('ascii');
        console.log(`NHẬN ĐƯỢC NOTIFY PHẢN HỒI: "${response}"`);

        // Phân tích phản hồi
        if (response.startsWith('RELAY_STORED:')) {
          relayAckId = response.split(':')[1]; // Lấy MessageId từ chuỗi "RELAY_STORED:<messageId>"
          console.log(`🆘 SOS ĐÃ ĐƯỢC RELAY LƯU THÀNH CÔNG. Mã gói: ${relayAckId}`);
        } else if (response === 'CRC_FAIL') {
          relayError = 'Gói tin bị lỗi CRC khi chuyển tới Relay.';
          console.error('Lỗi CRC: Relay báo gói tin bị hỏng.');
        } else {
          relayError = 'Relay phản hồi không xác định.';
          console.error(`Phản hồi lạ: ${response}`);
        }
      }
    );

    // 7. Ghi packet SOS vào Relay (Ghi nhị phân)
    console.log('Đang ghi packet SOS (74 byte nhị phân)...');
    // Plugin yêu cầu truyền vào kiểu DataView
    await BleClient.write(
      deviceId,
      FLOODED_SERVICE_UUID,
      SOS_WRITE_CHAR_UUID,
      new DataView(payload.buffer)
    );
    console.log('Đã ghi dữ liệu xong. Chờ Notify phản hồi (Store-before-ACK)...');

    // 8. Chờ phản hồi Notify (timeout 15 giây)
    const startTime = Date.now();
    while (Date.now() - startTime < 15000) {
      if (relayAckId) {
        // Thành công: Nhận được ACK mã gói
        console.log(`Hoàn tất luồng gửi. MessageId: ${relayAckId}`);
        return relayAckId; 
      }
      if (relayError) {
        // Thất bại do lỗi xác thực ở Relay
        throw new Error(relayError);
      }
      // Chờ một chút trước khi check tiếp (tránh loop quá nhanh)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 9. Ngắt kết nối và dọn dẹp
    console.log('--- GỬI SOS HOÀN TẤT ---');
    
    // Xử lý Timeout: Không nhận được ACK cũng không nhận được Error
    throw new Error('Timeout: Không nhận được phản hồi Notify từ Access Relay trong 15s.');

  } catch (error: any) {
    console.error('⚠️ LỖI TRONG LUỒNG GỬI BLE:', error);
    throw error;
  } finally {
    // Luôn cố gắng ngắt kết nối khi hoàn tất (dù thành công hay lỗi)
    // Để Relay sẵn sàng cho người khác kết nối
    // console.log('Đang ngắt kết nối...');
    // await BleClient.disconnect(deviceId); // Cần giữ ID để ngắt
  }
};