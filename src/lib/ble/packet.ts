// src/lib/ble/packet.ts
import { Buffer } from 'buffer';

// Định nghĩa giao diện cho dữ liệu SOS trong App
export interface SosPacketData {
  protocolVersion: number;
  sourceId: string; // 8 ký tự (giả danh)
  hazardType: number;
  severity: number;
  numberOfPeople: number;
  contactInfo: string; // Tối đa 30 ký tự
  latitude: number; // 0 nếu unknown
  longitude: number; // 0 nếu unknown
  locationAccuracy: number; // 0 nếu unknown
}

// Bảng tra cứu CRC16-CCITT (Poly: 0x1021)
const crc16Table = new Uint16Array(256);
for (let i = 0; i < 256; i++) {
  let crc = 0;
  let c = i << 8;
  for (let j = 0; j < 8; j++) {
    if ((crc ^ c) & 0x8000) {
      crc = (crc << 1) ^ 0x1021;
    } else {
      crc = crc << 1;
    }
    c = c << 1;
  }
  crc16Table[i] = crc & 0xFFFF;
}

// Hàm tính CRC16 trên Buffer
export function computeCrc16(data: Buffer): number {
  let crc = 0xFFFF; // Giá trị khởi tạo chuẩn
  for (let i = 0; i < data.length; i++) {
    crc = (crc << 8) ^ crc16Table[((crc >> 8) ^ data[i]) & 0xFF];
  }
  return crc & 0xFFFF;
}

// Hàm mã hóa SOSPacketData thành 74 byte nhị phân
export function encodePacket(data: SosPacketData): Buffer {
  // 1. Khởi tạo Buffer 74 byte, lấp đầy bằng 0x00
  const buffer = Buffer.alloc(74, 0x00);
  let offset = 0;

  // 2. Viết các trường dữ liệu cố định (72 byte đầu)
  buffer.writeUInt8(data.protocolVersion, offset); offset += 1;
  
  // sourceId (8 bytes, padding bằng 0 nếu thiếu)
  const idBuf = Buffer.from(data.sourceId.substring(0, 8), 'ascii');
  idBuf.copy(buffer, offset); offset += 8;
  
  buffer.writeUInt8(data.hazardType, offset); offset += 1;
  buffer.writeUInt8(data.severity, offset); offset += 1;
  buffer.writeUInt8(data.numberOfPeople, offset); offset += 1;
  
  // lat, lon (floatle, 4 bytes each)
  buffer.writeFloatLE(data.latitude, offset); offset += 4;
  buffer.writeFloatLE(data.longitude, offset); offset += 4;
  
  buffer.writeUInt8(data.locationAccuracy, offset); offset += 1;

  // createdAt (UInt32LE, 4 bytes) - Lấy thời gian hiện tại (timestamp giây)
  const createdAt = Math.floor(Date.now() / 1000);
  buffer.writeUInt32LE(createdAt, offset); offset += 4;
  
  // contactInfo (30 bytes, ascii, padding 0x00)
  const contactBuf = Buffer.from(data.contactInfo.substring(0, 30), 'ascii');
  contactBuf.copy(buffer, offset); offset += 30;

  // 3. Xử lý trường hash (2 byte cuối, offset 72)
  // LƯU Ý QUAN TRỌNG: Phải tính CRC trên ĐỦ 74 byte với 2 byte hash khởi tạo = 0
  // thì kết quả mới khớp với decodePacket() và Firmware C++
  const crc = computeCrc16(buffer);
  buffer.writeUInt16LE(crc, 72); // Ghi CRC vào offset 72

  console.log(`Generated Packet 74 bytes. CRC: 0x${crc.toString(16).toUpperCase()}`);
  return buffer;
}