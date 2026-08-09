// FLOODED - Outbox SOS cuc bo (Citizen App)
// Dung @capacitor/preferences de luu ben vung, giu qua dong app/khoi dong
// lai thiet bi (muc 3.1: "Luu goi vao local outbox truoc khi phat; van giu
// qua viec dong app hoac khoi dong lai thiet bi").

import { Preferences } from "@capacitor/preferences";
import type { FloodedPacket } from "./protocol";

const OUTBOX_KEY = "flooded_sos_outbox";

export type OutboxStatus = "LOCAL_SAVED" | "RELAY_STORED" | "ERROR";

export interface OutboxEntry {
  packet: FloodedPacket;
  status: OutboxStatus;
  createdAt: number; // Date.now() luc tao, dung cho UI hien thi thoi gian
  lastError?: string;
  attempts: number;
}

async function readOutbox(): Promise<OutboxEntry[]> {
  const { value } = await Preferences.get({ key: OUTBOX_KEY });
  if (!value) return [];
  try {
    return JSON.parse(value) as OutboxEntry[];
  } catch {
    return []; // du lieu hong - tra rong thay vi lam crash app
  }
}

async function writeOutbox(entries: OutboxEntry[]): Promise<void> {
  await Preferences.set({ key: OUTBOX_KEY, value: JSON.stringify(entries) });
}

// Luu 1 SOS vao outbox cuc bo NGAY khi tao, TRUOC khi thu gui qua BLE
// (Offline-first / Store before ACK - muc 1.2, ap dung tu tang Citizen App).
export async function saveToOutbox(pkt: FloodedPacket): Promise<void> {
  const entries = await readOutbox();
  entries.push({ packet: pkt, status: "LOCAL_SAVED", createdAt: Date.now(), attempts: 0 });
  await writeOutbox(entries);
}

// Cap nhat trang thai 1 SOS theo messageId sau khi co ket qua tu BLE.
export async function updateOutboxStatus(
  messageId: number,
  status: OutboxStatus,
  errorDetail?: string,
): Promise<void> {
  const entries = await readOutbox();
  const entry = entries.find((e) => e.packet.messageId === messageId);
  if (!entry) return;
  entry.status = status;
  entry.attempts += 1;
  if (errorDetail) entry.lastError = errorDetail;
  await writeOutbox(entries);
}

// Doc toan bo outbox - dung cho UI hien thi dung cap xac nhan (muc 3.1:
// "Hien thi dung cap xac nhan thay vi mot trang thai 'Da gui' duy nhat").
export async function getOutbox(): Promise<OutboxEntry[]> {
  return readOutbox();
}

// Loc cac SOS CHUA duoc Relay xac nhan - dung khi can tu dong thu gui lai
// luc app mo lai / co BLE tro lai (CHUA noi vao dau, xem sendSos.ts).
export async function getPendingOutbox(): Promise<OutboxEntry[]> {
  const entries = await readOutbox();
  return entries.filter((e) => e.status !== "RELAY_STORED");
}
