// FLOODED - Lớp giao tiếp BLE với Access Relay (ESP32)
// Đã tối ưu quét diện rộng (Unfiltered Scan) giống nRF Connect để fix lỗi CoreBluetooth iOS.

import { BleClient, type ScanResult } from "@capacitor-community/bluetooth-le";
import {
  FLOODED_SERVICE_UUID,
  FLOODED_SOS_WRITE_CHARACTERISTIC_UUID,
  FLOODED_STATUS_NOTIFY_CHARACTERISTIC_UUID,
  type FloodedPacket,
  encodePacket,
} from "./protocol";

export type RelaySendResult =
  | { ok: true; status: "RELAY_STORED"; messageId: number }
  | {
      ok: false;
      reason: "NO_RELAY_FOUND" | "CONNECT_FAILED" | "WRITE_FAILED" | "TIMEOUT_NO_STATUS" | "RELAY_ERROR";
      detail?: string;
    };

let bleInitialized = false;

async function ensureBleInitialized(): Promise<void> {
  if (bleInitialized) return;
  await BleClient.initialize();
  bleInitialized = true;
}

/**
 * Quét tìm Access Relay theo cơ chế Unfiltered Scan (giống nRF Connect)
 * Tự lọc tên "FLOODED" hoặc UUID bằng code JS để tránh bị iOS lờ đi gói Scan Response.
 */
async function scanForRelay(timeoutMs: number): Promise<string | null> {
  await ensureBleInitialized();

  return new Promise<string | null>((resolve) => {
    let settled = false;

    const finish = async (deviceId: string | null) => {
      if (settled) return;
      settled = true;

      try {
        await BleClient.stopLEScan();
      } catch {
        // Bỏ qua lỗi dừng quét nếu đã dừng trước đó
      }

      resolve(deviceId);
    };

    const timer = setTimeout(() => {
      finish(null);
    }, timeoutMs);

    // FIX IOS COREBLUETOOTH:
    // Truyền object rỗng {} thay vì { services: [FLOODED_SERVICE_UUID] }.
    // Việc này ép iOS đẩy toàn bộ quảng bá BLE về cho App tự lọc.
    BleClient.requestLEScan({}, (result: ScanResult) => {
      if (settled) return;

      const devName = (result.device.name || result.localName || "").toUpperCase();
      const targetUuid = FLOODED_SERVICE_UUID.toLowerCase();

      const hasServiceUuid = result.uuids?.some(
        (u) => u.toLowerCase() === targetUuid
      );

      // Lọc thủ công bằng tay: khớp tên "FLOODED" hoặc khớp Service UUID
      if (devName.includes("FLOODED") || hasServiceUuid) {
        clearTimeout(timer);
        finish(result.device.deviceId);
      }
    }).catch((err) => {
      console.error("[bleRelay] Lỗi quét BLE:", err);
      clearTimeout(timer);
      finish(null);
    });
  });
}

/**
 * Hàm gửi gói tin SOS dạng nhị phân sang ESP32
 */
export async function sendPacketViaBle(
  packet: FloodedPacket,
  scanTimeoutMs = 10000,
  statusTimeoutMs = 15000
): Promise<RelaySendResult> {
  let connectedDeviceId: string | null = null;

  try {
    console.log("[bleRelay] Bắt đầu quét rà soát Access Relay gần đây...");
    const deviceId = await scanForRelay(scanTimeoutMs);

    if (!deviceId) {
      console.warn("[bleRelay] Không tìm thấy thiết bị FLOODED nào xung quanh.");
      return { ok: false, reason: "NO_RELAY_FOUND" };
    }

    connectedDeviceId = deviceId;
    console.log(`[bleRelay] Phát hiện thiết bị: ${deviceId}. Đang kết nối...`);

    // BẮT BUỘC: Đảm bảo luồng quét đã dừng hẳn trước khi gọi lệnh connect để không crash iOS
    try {
      await BleClient.stopLEScan();
    } catch {
      // Ignore
    }

    await BleClient.connect(deviceId);
    console.log(`[bleRelay] Đã kết nối thành công tới ${deviceId}`);

    // Đóng gói binary packet (74-byte)
    const rawBytes = encodePacket(packet);
    const dataView = new DataView(
      rawBytes.buffer,
      rawBytes.byteOffset,
      rawBytes.byteLength
    );

    // Lắng nghe Notify kết quả lưu trữ từ ESP32
    let notifyResolver: (res: RelaySendResult) => void;
    const statusPromise = new Promise<RelaySendResult>((resolve) => {
      notifyResolver = resolve;
    });

    const statusTimer = setTimeout(() => {
      notifyResolver({ ok: false, reason: "TIMEOUT_NO_STATUS" });
    }, statusTimeoutMs);

    await BleClient.startNotifications(
      deviceId,
      FLOODED_SERVICE_UUID,
      FLOODED_STATUS_NOTIFY_CHARACTERISTIC_UUID,
      (value: DataView) => {
        try {
          const decoder = new TextDecoder("utf-8");
          const responseText = decoder.decode(value.buffer);
          console.log("[bleRelay] Nhận tín hiệu Notify từ Relay:", responseText);

          if (responseText.startsWith("RELAY_STORED")) {
            clearTimeout(statusTimer);
            const parts = responseText.split(":");
            const msgId = parts[1] ? parseInt(parts[1], 10) : 0;
            notifyResolver({ ok: true, status: "RELAY_STORED", messageId: msgId });
          } else if (responseText.startsWith("ERROR")) {
            clearTimeout(statusTimer);
            notifyResolver({
              ok: false,
              reason: "RELAY_ERROR",
              detail: responseText,
            });
          }
        } catch (err) {
          console.error("[bleRelay] Lỗi giải mã gói tin Notify:", err);
        }
      }
    );

    // Ghi dữ liệu packet sang Characteristic SOS Write
    console.log("[bleRelay] Đang truyền gói tin SOS sang ESP32...");
    await BleClient.write(
      deviceId,
      FLOODED_SERVICE_UUID,
      FLOODED_SOS_WRITE_CHARACTERISTIC_UUID,
      dataView
    );
    console.log("[bleRelay] Đã ghi xong. Chờ ESP32 phản hồi trạng thái...");

    // Chờ phản hồi hoặc timeout
    const result = await statusPromise;
    return result;

  } catch (err: any) {
    console.error("[bleRelay] Gặp lỗi trong luồng giao tiếp BLE:", err);
    return {
      ok: false,
      reason: "CONNECT_FAILED",
      detail: String(err?.message || err),
    };
  } finally {
    // FINALLY: Luôn giải phóng tài nguyên và ngắt kết nối an toàn để vô hiệu hóa xoay UI vô tận
    if (connectedDeviceId) {
      try {
        await BleClient.stopNotifications(
          connectedDeviceId,
          FLOODED_SERVICE_UUID,
          FLOODED_STATUS_NOTIFY_CHARACTERISTIC_UUID
        );
      } catch {
        // Ignore
      }

      try {
        await BleClient.disconnect(connectedDeviceId);
        console.log(`[bleRelay] Đã ngắt kết nối với ${connectedDeviceId}`);
      } catch {
        // Ignore
      }
    }
  }
}