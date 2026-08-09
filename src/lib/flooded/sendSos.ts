// FLOODED - Diem vao chinh cho luong "bam khan cap" (Citizen App)
// Tao 1 FloodedPacket SOS_NEW tu du lieu nguoi dung nhap, LUU VAO OUTBOX
// CUC BO NGAY (khong cho BLE), roi moi thu gui qua Access Relay gan nhat.

import { type FloodedPacket, PayloadType, Priority, generateMessageId } from "./protocol";
import { saveToOutbox, updateOutboxStatus } from "./outbox";
import { sendPacketViaBle, type RelaySendResult } from "./bleRelay";

// TODO: gan dinh danh gia danh hoa RIENG cho tung thiet bi khi cai dat app
// lan dau (vd sinh ngau nhien 1 lan, luu lai bang Preferences), khong phai
// hardcode nhu ben duoi - hien tai moi may cai app se dung CHUNG 1 sourceId,
// se gay nham lan neu co nhieu thiet bi that.
const THIS_DEVICE_SOURCE_ID = 0x1001;

export interface CreateSosInput {
  dangerType: string; // vd "ngap", "sat lo", "chay"...
  peopleCount: number;
  priority: Priority;
  note: string; // ngan gon - xem ghi chu gioi han do dai ben duoi
  location: { lat: number; lon: number } | "unknown";
}

export interface SendSosResult {
  packet: FloodedPacket;
  bleResult: RelaySendResult;
}

// Ham chinh goi tu nut "bam khan cap" trong UI.
export async function sendSos(input: CreateSosInput): Promise<SendSosResult> {
  // Payload la 1 chuoi ghep dangerType|peopleCount|note, GIOI HAN 40 BYTE
  // (FLOODED_PAYLOAD_MAX_LEN). Command Dashboard se can parse dung dinh
  // dang nay khi hien thi case (tach theo dau "|") - ghi chu de dong bo khi
  // noi /api/cases that vao dashboard.
  const payload = `${input.dangerType}|${input.peopleCount}|${input.note}`.slice(0, 40);

  const pkt: FloodedPacket = {
    protocolVersion: 1,
    messageId: generateMessageId(THIS_DEVICE_SOURCE_ID),
    caseId: 0,
    sourceId: THIS_DEVICE_SOURCE_ID,
    createdAt: Math.floor(Date.now() / 1000),
    timestampReliable: true, // dong ho dien thoai thuong dang tin hon node nhung, gia dinh co dong bo NTP truoc do
    originLat1e6: input.location === "unknown" ? 0 : Math.round(input.location.lat * 1_000_000),
    originLon1e6: input.location === "unknown" ? 0 : Math.round(input.location.lon * 1_000_000),
    locationUnknown: input.location === "unknown",
    payloadType: PayloadType.SOS_NEW,
    priority: input.priority,
    // ttl=5: cao hon HEARTBEAT cua Relay (3) vi SOS quan trong hon, can toi
    // duoc Gateway qua nhieu hop hon neu can - GIA TRI UOC LUONG BAN DAU,
    // chua qua do dac thuc dia, can dieu chinh sau khi test airtime/pham vi that.
    ttl: 5,
    hopCount: 0,
    payload,
  };

  // Store before ACK (muc 1.2) - LUU CUC BO TRUOC, khong cho ket qua BLE.
  await saveToOutbox(pkt);

  const bleResult = await sendPacketViaBle(pkt);

  if (bleResult.ok) {
    await updateOutboxStatus(pkt.messageId, "RELAY_STORED");
  } else {
    await updateOutboxStatus(pkt.messageId, "ERROR", (bleResult as any).reason || "Unknown error");
  }

  return { packet: pkt, bleResult };
}
