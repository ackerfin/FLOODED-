// FLOODED - Dinh nghia goi tin dung chung phia Citizen App (TypeScript)
// PHAI khop tuyet doi voi lib/flooded_common/packet.h ben firmware (C++,
// #pragma pack(1)) - cung thu tu truong, cung kich thuoc, cung little-endian.
// Neu doi 1 ben ma khong doi ben kia, 2 phia se khong doc duoc goi cua nhau.

export const FLOODED_PROTOCOL_VERSION = 1;
export const FLOODED_PAYLOAD_MAX_LEN = 40;
export const FLOODED_PACKET_SIZE = 74; // == sizeof(FloodedPacket) ben firmware

export enum PayloadType {
  SOS_NEW = 0,
  SOS_UPDATE = 1,
  VOLUNTEER_ACTION = 2,
  ACK = 3,
  HEARTBEAT = 4,
}

export enum Priority {
  UNKNOWN = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export interface FloodedPacket {
  protocolVersion: number;
  messageId: number; // uint32 - JS number du chinh xac (< 2^53)
  caseId: number; // uint32, 0 = chua co
  sourceId: number; // uint32 - dinh danh gia danh hoa cua thiet bi
  createdAt: number; // epoch giay (uint32)
  timestampReliable: boolean;
  originLat1e6: number; // int32 - vi do * 1_000_000
  originLon1e6: number; // int32 - kinh do * 1_000_000
  locationUnknown: boolean;
  payloadType: PayloadType;
  priority: Priority;
  ttl: number;
  hopCount: number;
  payload: string; // toi da FLOODED_PAYLOAD_MAX_LEN ky tu
}

// ---- CRC16-CCITT (init 0xFFFF, poly 0x1021) - PHAI khop dung ham
// computeCrc16() trong lib/flooded_common/packet.cpp ben firmware. ----
function computeCrc16(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= (bytes[i] << 8) & 0xffff;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc & 0xffff;
}

// Sinh messageId gia-duy-nhat, CUNG THUAT TOAN voi generateMessageId() ben
// firmware (packet.cpp): tron 24-bit random voi 8-bit thap cua sourceId.
// Dung khi CHINH DIEN THOAI la nguon tao SOS (khac voi khi Relay/Gateway
// tu sinh messageId cho goi cua rieng no, vd HEARTBEAT/ACK).
export function generateMessageId(sourceId: number): number {
  const randomBytes = new Uint8Array(3);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    // Fallback hiem khi can toi tren WebView hien dai - van chay, kem ngau nhien hon.
    for (let i = 0; i < 3; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  const randomPart = (randomBytes[0] << 16) | (randomBytes[1] << 8) | randomBytes[2];
  const sourceTag = (sourceId & 0xff) << 24;
  return (sourceTag | randomPart) >>> 0; // >>> 0 ep ve unsigned 32-bit
}

// Dong goi FloodedPacket thanh 74 byte nhi phan, dung offset/kieu du lieu
// GIONG HET struct FloodedPacket (#pragma pack(1)) ben firmware. Tu dong
// tinh payloadHash (CRC16) truoc khi tra ve.
export function encodePacket(pkt: FloodedPacket): Uint8Array {
  const buf = new ArrayBuffer(FLOODED_PACKET_SIZE);
  const view = new DataView(buf);
  const LE = true; // little-endian - ESP32 (Xtensa) la little-endian

  let offset = 0;
  view.setUint8(offset, pkt.protocolVersion);
  offset += 1;
  view.setUint32(offset, pkt.messageId >>> 0, LE);
  offset += 4;
  view.setUint32(offset, pkt.caseId >>> 0, LE);
  offset += 4;
  view.setUint32(offset, pkt.sourceId >>> 0, LE);
  offset += 4;
  view.setUint32(offset, pkt.createdAt >>> 0, LE);
  offset += 4;
  view.setUint8(offset, pkt.timestampReliable ? 1 : 0);
  offset += 1;
  view.setInt32(offset, pkt.originLat1e6 | 0, LE);
  offset += 4;
  view.setInt32(offset, pkt.originLon1e6 | 0, LE);
  offset += 4;
  view.setUint8(offset, pkt.locationUnknown ? 1 : 0);
  offset += 1;
  view.setUint8(offset, pkt.payloadType);
  offset += 1;
  view.setUint8(offset, pkt.priority);
  offset += 1;
  view.setUint8(offset, pkt.ttl);
  offset += 1;
  view.setUint8(offset, pkt.hopCount);
  offset += 1;

  const payloadBytes = new TextEncoder().encode(pkt.payload).slice(0, FLOODED_PAYLOAD_MAX_LEN);
  view.setUint8(offset, payloadBytes.length); // payloadLen
  offset += 1;

  const fullBuf = new Uint8Array(buf); // view tren CUNG buffer, khong phai ban sao
  fullBuf.set(payloadBytes, offset);
  // Phan con lai trong 40 byte payload da la 0 san (ArrayBuffer khoi tao = 0),
  // giong char[40] duoc gan {} ben firmware.
  offset += FLOODED_PAYLOAD_MAX_LEN;

  // payloadHash: tinh CRC16 tren TOAN BO 74 byte VOI 2 byte hash dang la 0
  // (chua ghi gi vao offset 72-73, ArrayBuffer khoi tao san = 0) - PHAI
  // giong het cach lam ben firmware (packet.cpp: toSend.payloadHash = 0 roi
  // moi tinh CRC tren sizeof(FloodedPacket) = 74 byte, khong phai 72).
  const crc = computeCrc16(fullBuf);
  view.setUint16(offset, crc, LE);

  return fullBuf;
}

// Giai ma 74 byte nhi phan thanh FloodedPacket. Tra ve null neu do dai/CRC/
// version sai. Chua dung trong luong SOS thong thuong (status tra ve la
// text, khong phai binary) - giu de dung chung neu sau lam Local Feed BLE
// hoac can doc lai goi tu firmware.
export function decodePacket(bytes: Uint8Array): FloodedPacket | null {
  if (bytes.length !== FLOODED_PACKET_SIZE) return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const LE = true;

  const receivedCrc = view.getUint16(72, LE);
  const forCheck = bytes.slice();
  forCheck[72] = 0;
  forCheck[73] = 0;
  const computedCrc = computeCrc16(forCheck);
  if (receivedCrc !== computedCrc) return null;

  let offset = 0;
  const protocolVersion = view.getUint8(offset);
  offset += 1;
  if (protocolVersion !== FLOODED_PROTOCOL_VERSION) return null;

  const messageId = view.getUint32(offset, LE);
  offset += 4;
  const caseId = view.getUint32(offset, LE);
  offset += 4;
  const sourceId = view.getUint32(offset, LE);
  offset += 4;
  const createdAt = view.getUint32(offset, LE);
  offset += 4;
  const timestampReliable = view.getUint8(offset) === 1;
  offset += 1;
  const originLat1e6 = view.getInt32(offset, LE);
  offset += 4;
  const originLon1e6 = view.getInt32(offset, LE);
  offset += 4;
  const locationUnknown = view.getUint8(offset) === 1;
  offset += 1;
  const payloadType = view.getUint8(offset) as PayloadType;
  offset += 1;
  const priority = view.getUint8(offset) as Priority;
  offset += 1;
  const ttl = view.getUint8(offset);
  offset += 1;
  const hopCount = view.getUint8(offset);
  offset += 1;
  const payloadLen = view.getUint8(offset);
  offset += 1;

  const payloadBytes = bytes.slice(offset, offset + Math.min(payloadLen, FLOODED_PAYLOAD_MAX_LEN));
  const payload = new TextDecoder().decode(payloadBytes);

  return {
    protocolVersion,
    messageId,
    caseId,
    sourceId,
    createdAt,
    timestampReliable,
    originLat1e6,
    originLon1e6,
    locationUnknown,
    payloadType,
    priority,
    ttl,
    hopCount,
    payload,
  };
}

// ---- BLE UUID CO DINH - PHAI khop dung 3 UUID trong main_access_relay.cpp ----
export const FLOODED_SERVICE_UUID = "4f4e0001-1b45-4a1e-8f3a-2c1d9e7b5a10";
export const FLOODED_SOS_WRITE_CHARACTERISTIC_UUID = "4f4e0002-1b45-4a1e-8f3a-2c1d9e7b5a10";
export const FLOODED_STATUS_NOTIFY_CHARACTERISTIC_UUID = "4f4e0003-1b45-4a1e-8f3a-2c1d9e7b5a10";
