// FLOODED - Lop giao tiep BLE voi Access Relay (Citizen App)
// Dung @capacitor-community/bluetooth-le. Luong: quet tim Relay quang ba
// FLOODED_SERVICE_UUID -> ket noi -> subscribe status -> ghi packet -> cho
// RELAY_STORED/loi -> ngat ket noi.

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

// Quet tim 1 Access Relay dang quang ba FLOODED_SERVICE_UUID trong tam gan.
// Tra ve deviceId dau tien tim thay, hoac null neu het thoi gian ma khong co.
async function scanForRelay(timeoutMs: number): Promise<string | null> {
  await ensureBleInitialized();

  return new Promise<string | null>((resolve) => {
    let settled = false;

    const finish = (deviceId: string | null) => {
      if (settled) return;
      settled = true;
      BleClient.stopLEScan().catch(() => {
        // bo qua loi stop scan - khong quan trong bang viec tra ket qua
      });
      resolve(deviceId);
    };

    const timer = setTimeout(() => finish(null), timeoutMs);

    BleClient.requestLEScan({ services: [FLOODED_SERVICE_UUID] }, (result: ScanResult) => {
      if (settled) return;
      clearTimeout(timer);
      finish(result.device.deviceId);
    }).catch(() => {
      clearTimeout(timer);
      finish(null);
    });
  });
}

// Gui 1 FloodedPacket toi Access Relay gan nhat qua BLE: quet -> ket noi ->
// subscribe status -> ghi packet -> cho RELAY_STORED/loi -> ngat ket noi.
// GIOI HAN DA BIET: chua co MTU request tuong minh phia Android (getMtu()
// co the doc duoc MTU thuc te sau connect() de log/chan doan, nhung chua
// chu dong xin nang MTU o day). iOS thuong tu dam duong "long write" khi
// goi vuot qua MTU-3, Android CHUA chac chan hanh vi tuong tu tuy version
// plugin - CAN test that tren thiet bi Android truoc khi coi la xong.
export async function sendPacketViaBle(
  pkt: FloodedPacket,
  options?: { scanTimeoutMs?: number; statusTimeoutMs?: number },
): Promise<RelaySendResult> {
  const scanTimeoutMs = options?.scanTimeoutMs ?? 8000;
  // Relay tu cho ACK toi da ACK_TIMEOUT_MS * MAX_SEND_ATTEMPTS (~6-7s) truoc
  // khi tra loi - can cho lau hon the o day, khong thi se timeout som gia.
  const statusTimeoutMs = options?.statusTimeoutMs ?? 9000;

  const deviceId = await scanForRelay(scanTimeoutMs);
  if (!deviceId) {
    return { ok: false, reason: "NO_RELAY_FOUND" };
  }

  try {
    await BleClient.connect(deviceId);
  } catch (err) {
    return { ok: false, reason: "CONNECT_FAILED", detail: String(err) };
  }

  try {
    const statusPromise = new Promise<RelaySendResult>((resolve) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve({ ok: false, reason: "TIMEOUT_NO_STATUS" });
      }, statusTimeoutMs);

      BleClient.startNotifications(
        deviceId,
        FLOODED_SERVICE_UUID,
        FLOODED_STATUS_NOTIFY_CHARACTERISTIC_UUID,
        (value: DataView) => {
          if (settled) return;
          const text = new TextDecoder().decode(
            new Uint8Array(value.buffer, value.byteOffset, value.byteLength),
          );

          if (text.startsWith("RELAY_STORED:")) {
            const messageId = Number(text.split(":")[1]);
            if (messageId === pkt.messageId) {
              settled = true;
              clearTimeout(timer);
              resolve({ ok: true, status: "RELAY_STORED", messageId });
            }
            // messageId khac cua chinh minh (khong nen xay ra khi 1-1 nhu hien
            // tai, nhung an toan bo qua neu co) - tiep tuc cho.
          } else if (text.startsWith("ERROR:")) {
            settled = true;
            clearTimeout(timer);
            resolve({ ok: false, reason: "RELAY_ERROR", detail: text });
          }
        },
      ).catch(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve({ ok: false, reason: "WRITE_FAILED", detail: "khong subscribe duoc notify" });
        }
      });
    });

    const bytes = encodePacket(pkt);
    const dataView = new DataView(bytes.buffer);

    try {
      await BleClient.write(deviceId, FLOODED_SERVICE_UUID, FLOODED_SOS_WRITE_CHARACTERISTIC_UUID, dataView);
    } catch (err) {
      return { ok: false, reason: "WRITE_FAILED", detail: String(err) };
    }

    return await statusPromise;
  } finally {
    BleClient.disconnect(deviceId).catch(() => {
      // bo qua loi disconnect - khong lam hong ket qua da co
    });
  }
}
