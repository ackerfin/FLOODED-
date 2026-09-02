// FLOODED - Gateway data layer (Dexie/IndexedDB + SoftAP polling)
// Replaces the static mock array as the source of truth for SOS cases.
// - Polls the local SoftAP Gateway every 4s (no Internet required)
// - Persists cases in IndexedDB via Dexie
// - Command-owned fields (verifyStatus, assignedTeam, auditLog) survive every poll
// - messageId is the duplicate key: existing messageId => update, never duplicate
//
// [FIX] Gateway gui createdAt theo epoch GIAY (unix seconds), nhung toan bo
// UI (timeAgo(), new Date(...).toLocaleString(), fallback Date.now()) deu
// gia dinh createdAt la epoch MILI-GIAY. Truoc ban nay, normalizeGatewayItem()
// giu nguyen so giay roi luu thang vao CommandCase.createdAt - dan den UI
// hieu nham 1 con so epoch-giay binh thuong (vd 1788058010) thanh mot moc
// thoi gian chi ~20.7 ngay sau 1/1/1970, hien thi ra "20674d" / nam 1970.
// Fix: nhan 1000 ngay tai diem normalize, de moi noi phia sau (da gia dinh
// dung don vi ms) hoat dong dung ma khong can sua rai rac o nhieu cho.
import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { getCases, saveCases, type SOSCase, type CaseSeverity, type CaseStatus } from './commandCenter';

export const GATEWAY_URL = 'http://192.168.4.1/api/cases';
export const POLL_INTERVAL_MS = 4000;
const REQUEST_TIMEOUT_MS = 3000;

export type CaseOrigin = 'GATEWAY' | 'COMMAND_MANUAL';
export type VerifyStatus = 'UNVERIFIED' | 'VERIFYING' | 'VERIFIED' | 'REJECTED';

export interface AuditEntry {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  note?: string;
}

/** A case as stored locally: Gateway payload + Command-owned management fields. */
export interface CommandCase extends SOSCase {
  messageId: string;
  /** Origin channel of the case (field requested as "sourceType" for the transport layer). */
  origin: CaseOrigin;
  verifyStatus: VerifyStatus;
  assignedTeam?: string;
  auditLog: AuditEntry[];
  gatewayUpdatedAt?: number;
}

// ==================== DEXIE ====================
class FloodedCaseDB extends Dexie {
  cases!: Table<CommandCase, string>;
  constructor() {
    super('flooded_command');
    this.version(1).stores({
      cases: 'id, &messageId, origin, status, severity, verifyStatus, updatedAt',
    });
  }
}

export const caseDb = new FloodedCaseDB();

// ==================== GATEWAY STATUS ====================
export interface GatewayStatus {
  connected: boolean;
  lastSuccessAt: number | null;
  lastErrorAt: number | null;
  lastError?: string;
}

let status: GatewayStatus = { connected: false, lastSuccessAt: null, lastErrorAt: null };
const listeners = new Set<(s: GatewayStatus, cases: CommandCase[]) => void>();

export function getGatewayStatus(): GatewayStatus {
  return status;
}

function emit(cases: CommandCase[]) {
  listeners.forEach(l => l(status, cases));
}

// ==================== HELPERS ====================
function auditEntry(action: string, note?: string, actor = 'System'): AuditEntry {
  return { id: uuidv4(), timestamp: Date.now(), actor, action, note };
}

/** Wrap any legacy/local SOSCase into a CommandCase with defaults. */
export function toCommandCase(c: SOSCase, origin: CaseOrigin = 'COMMAND_MANUAL'): CommandCase {
  const anyC = c as Partial<CommandCase>;
  return {
    ...c,
    messageId: anyC.messageId || `local-${c.id}`,
    origin: anyC.origin || origin,
    verifyStatus: anyC.verifyStatus || 'UNVERIFIED',
    assignedTeam: anyC.assignedTeam ?? c.assignedTeamId,
    auditLog: anyC.auditLog || [],
    gatewayUpdatedAt: anyC.gatewayUpdatedAt,
  };
}

// [FIX] Parser cho payload thô dang "scenarioType|peopleCount|healthStatus|
// description-hoac-needTags" (vi du "electrical_leak_water|1|critical|water")
// - dung KHOP voi reportToPacket() trong lib/mesh.ts ben app di dong (khong
// phai sendSos.ts, file do la ban khong duoc goi trong luong SOS that su).
// Day CHI phuc vu hien thi UI - khong dung ket qua nay de GHI DE truong
// severity chinh thuc cua case (truong do van lay tu raw.severity ma Gateway
// da tinh theo pkt.priority, di qua healthStatusToPriority() ben app).
//
// scenarioType la id lay tu getCasesByCategory() trong survivalData.ts ben
// app (chua co file nay de doi chieu day du danh sach id that) - tam thoi
// hien thi nguyen van id neu khong nam trong bang SCENARIO_LABELS ben duoi,
// thay vi bia ra nhan dich khong chac chan dung.
const SCENARIO_LABELS: Record<string, string> = {
  // Bo sung dan khi co day du danh sach id that tu survivalData.ts.
};

// Khop dung 4 gia tri HealthStatus that trong app (types.ts) va dung cach
// map cua healthStatusToPriority() trong lib/mesh.ts:
//   ok -> LOW -> GREEN | injured -> MEDIUM -> ORANGE
//   critical -> HIGH -> RED | unconscious -> HIGH -> RED
const HEALTH_STATUS_LABELS: Record<string, string> = {
  ok: 'An toàn',
  injured: 'Bị thương',
  critical: 'Nguy kịch',
  unconscious: 'Bất tỉnh',
};

const HEALTH_STATUS_EXPECTED_SEVERITY: Record<string, CaseSeverity> = {
  ok: 'GREEN',
  injured: 'ORANGE',
  critical: 'RED',
  unconscious: 'RED',
};

export interface ParsedSosDescription {
  scenarioLabel: string;
  healthStatusLabel: string | null;
  healthStatusRaw: string | null;
  extraNote: string | null;
  raw: string;
}

/** Parse the pipe-delimited raw payload text into a human-readable shape. */
export function parseSosDescription(raw: string | undefined): ParsedSosDescription | null {
  if (!raw) return null;
  const parts = raw.split('|');
  const [scenarioKey, , healthStatus, ...rest] = parts;
  return {
    scenarioLabel: SCENARIO_LABELS[scenarioKey] ?? scenarioKey ?? raw,
    healthStatusRaw: healthStatus || null,
    healthStatusLabel: healthStatus ? (HEALTH_STATUS_LABELS[healthStatus] ?? healthStatus) : null,
    extraNote: rest.length ? rest.join('|') : null,
    raw,
  };
}

/**
 * True if the healthStatus embedded in the payload text disagrees with the
 * severity Gateway computed from packet.priority. Surface this in the UI
 * instead of silently picking one source - a mismatch here is a real safety
 * concern (wrong triage colour), not just a display quirk. Covers all 4 real
 * HealthStatus values (ok/injured/critical/unconscious), not just 2 guessed
 * earlier before mesh.ts was available.
 */
export function hasSeverityMismatch(parsed: ParsedSosDescription | null, severity: CaseSeverity): boolean {
  if (!parsed?.healthStatusRaw) return false;
  const expected = HEALTH_STATUS_EXPECTED_SEVERITY[parsed.healthStatusRaw];
  if (!expected) return false; // gia tri la, khong nam trong 4 gia tri biet - khong ket luan mismatch
  return expected !== severity;
}

/** Normalize a raw Gateway payload item into a CommandCase shape (gateway-owned fields only). */
function normalizeGatewayItem(raw: Record<string, unknown>): Partial<CommandCase> & { messageId: string } {
  const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : undefined);
  const sev = String(raw.severity ?? raw.level ?? 'ORANGE').toUpperCase();
  const severity: CaseSeverity = sev === 'RED' || sev === 'GREEN' ? (sev as CaseSeverity) : 'ORANGE';
  const messageId = String(raw.messageId ?? raw.message_id ?? raw.id ?? uuidv4());

  // [FIX-CHINH] raw.createdAt tu Gateway la epoch GIAY - nhan 1000 de ra
  // epoch MILI-GIAY, dung don vi voi moi noi khac trong app dang dung
  // Date.now()/new Date(ms). Neu khong co createdAt (hiem, chi khi Gateway
  // gui thieu field), fallback Date.now() da san la ms roi, KHONG nhan 1000.
  const rawCreatedAtSec = num(raw.createdAt);
  const createdAt = rawCreatedAtSec !== undefined ? rawCreatedAtSec * 1000 : Date.now();

  // [FIX-CHINH] Gateway (handleCases() ben C++) KHONG BAO GIO gui field
  // "peopleCount" rieng trong JSON - no chi gui "description" la nguyen
  // van chuoi payload tho "scenarioType|peopleCount|healthStatus|note".
  // Truoc ban nay, num(raw.peopleCount) luon la undefined -> luon fallback
  // ve 1, du nguoi dung chon 2/3/... nguoi. Fix: tu tach lai peopleCount tu
  // chinh chuoi description khi Gateway khong co field rieng.
  const rawDescription = raw.description ? String(raw.description) : undefined;
  const descParts = rawDescription ? rawDescription.split('|') : [];
  const peopleCountFromDescription = descParts[1] !== undefined ? Number(descParts[1]) : undefined;
  const peopleCount =
    num(raw.peopleCount) ??
    (Number.isFinite(peopleCountFromDescription) ? peopleCountFromDescription : undefined) ??
    1;

  // [FIX-CHINH] Gateway khong co reverse-geocoding (dung, vi he thong phai
  // chay offline) nen khong bao gio gui locationText/address - truoc ban
  // nay dong nay LUON fallback "Chua ro vi tri" BAT KE lat/lng co ton tai
  // hay khong, gay hieu lam la chua co GPS trong khi thuc ra van co toa do
  // (chi hien o drawer chi tiet, khong hien o list). Fix: khi co lat/lng
  // that, hien thang toa do lam locationText thay vi nhan tinh gay hieu lam.
  const lat = num(raw.lat);
  const lng = num(raw.lng);
  const hasCoords = lat !== undefined && lng !== undefined;
  const locationText = String(
    raw.locationText ?? raw.address ?? (hasCoords ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}` : 'Chưa rõ vị trí'),
  );

  return {
    messageId,
    sourceType: (raw.sourceType === 'relative' ? 'relative' : 'citizen'),
    reporterName: String(raw.reporterName ?? raw.name ?? 'Không rõ'),
    reporterPhone: String(raw.reporterPhone ?? raw.phone ?? '—'),
    victimName: raw.victimName ? String(raw.victimName) : undefined,
    locationText,
    lat,
    lng,
    severity,
    peopleCount,
    vulnerableGroups: raw.vulnerableGroups ? String(raw.vulnerableGroups) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    needTags: Array.isArray(raw.needTags) ? (raw.needTags as string[]) : undefined,
    createdAt,
    gatewayUpdatedAt: num(raw.updatedAt) ?? Date.now(),
    status: (raw.status ? String(raw.status) : 'NEW') as CaseStatus,
  };
}

// ==================== MIGRATION / BOOTSTRAP ====================
let bootstrapped = false;

/** Seed IndexedDB from any existing localStorage cases (one-off migration). */
export async function bootstrapCaseDb(): Promise<CommandCase[]> {
  const existing = await caseDb.cases.toArray();
  if (!bootstrapped && existing.length === 0) {
    const legacy = getCases().map(c => toCommandCase(c, 'COMMAND_MANUAL'));
    if (legacy.length) await caseDb.cases.bulkPut(legacy);
    bootstrapped = true;
    return legacy;
  }
  bootstrapped = true;
  return existing;
}

/** Mirror IndexedDB into localStorage so existing screens keep working unchanged. */
async function mirrorToLocalStorage(): Promise<CommandCase[]> {
  const all = await caseDb.cases.toArray();
  all.sort((a, b) => b.createdAt - a.createdAt);
  saveCases(all);
  return all;
}

// ==================== UPSERT ====================
/** Insert or update a case keyed by messageId. Command fields are never overwritten. */
export async function upsertCase(
  incoming: Partial<CommandCase> & { messageId: string },
  origin: CaseOrigin,
): Promise<CommandCase> {
  const existing = await caseDb.cases.where('messageId').equals(incoming.messageId).first();

  if (existing) {
    // Preserve Command-owned fields, take fresh operational data from source.
    const merged: CommandCase = {
      ...existing,
      ...incoming,
      id: existing.id,
      messageId: existing.messageId,
      origin: existing.origin,
      // Command-owned — untouched by Gateway
      status: existing.status,
      verifyStatus: existing.verifyStatus,
      assignedTeam: existing.assignedTeam,
      assignedTeamId: existing.assignedTeamId,
      auditLog: existing.auditLog,
      zoneId: existing.zoneId ?? incoming.zoneId,
      createdAt: existing.createdAt,
      updatedAt: Date.now(),
    };
    await caseDb.cases.put(merged);
    return merged;
  }

  const now = Date.now();
  const created: CommandCase = {
    id: uuidv4(),
    sourceType: 'citizen',
    reporterName: 'Không rõ',
    reporterPhone: '—',
    locationText: 'Chưa rõ vị trí',
    severity: 'ORANGE',
    status: 'NEW',
    peopleCount: 1,
    createdAt: now,
    ...incoming,
    origin,
    verifyStatus: 'UNVERIFIED',
    auditLog: [auditEntry(origin === 'GATEWAY' ? 'RECEIVED_FROM_GATEWAY' : 'CREATED_BY_COMMAND')],
    updatedAt: now,
  } as CommandCase;
  await caseDb.cases.put(created);
  return created;
}

/** Create a case from the Command "Báo hộ" flow (always COMMAND_MANUAL). */
export async function createManualCase(base: SOSCase): Promise<CommandCase> {
  const c = await upsertCase(
    { ...toCommandCase(base, 'COMMAND_MANUAL'), messageId: (base as Partial<CommandCase>).messageId || `manual-${base.id}` },
    'COMMAND_MANUAL',
  );
  await mirrorToLocalStorage();
  return c;
}

/** Update Command-owned management fields + append an audit entry. */
export async function updateCommandFields(
  caseId: string,
  patch: Partial<Pick<CommandCase, 'verifyStatus' | 'assignedTeam' | 'assignedTeamId' | 'status'>>,
  action: string,
  note?: string,
  actor = 'Command',
): Promise<void> {
  const existing = await caseDb.cases.get(caseId);
  if (!existing) return;
  await caseDb.cases.put({
    ...existing,
    ...patch,
    auditLog: [...existing.auditLog, auditEntry(action, note, actor)],
    updatedAt: Date.now(),
  });
  await mirrorToLocalStorage();
}

// ==================== POLLING ====================
async function fetchGatewayCases(): Promise<Record<string, unknown>[]> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(GATEWAY_URL, { signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : Array.isArray(data?.cases) ? data.cases : [];
    return list as Record<string, unknown>[];
  } finally {
    clearTimeout(t);
  }
}

/** One poll cycle. On error the local data is kept intact (never emptied). */
export async function pollGatewayOnce(): Promise<CommandCase[]> {
  await bootstrapCaseDb();
  try {
    const raw = await fetchGatewayCases();
    for (const item of raw) {
      await upsertCase(normalizeGatewayItem(item), 'GATEWAY');
    }
    status = { connected: true, lastSuccessAt: Date.now(), lastErrorAt: status.lastErrorAt };
  } catch (e) {
    status = {
      connected: false,
      lastSuccessAt: status.lastSuccessAt,
      lastErrorAt: Date.now(),
      lastError: e instanceof Error ? e.message : 'unknown',
    };
  }
  const all = await mirrorToLocalStorage();
  emit(all);
  return all;
}

let pollTimer: number | null = null;
let refCount = 0;

/** Subscribe to the polling loop. Returns an unsubscribe function. */
export function subscribeGateway(cb: (s: GatewayStatus, cases: CommandCase[]) => void): () => void {
  listeners.add(cb);
  refCount++;
  if (pollTimer === null) {
    void pollGatewayOnce();
    pollTimer = window.setInterval(() => void pollGatewayOnce(), POLL_INTERVAL_MS);
  }
  return () => {
    listeners.delete(cb);
    refCount--;
    if (refCount <= 0 && pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
      refCount = 0;
    }
  };
}

export function formatTime(ts: number | null): string {
  if (!ts) return '--:--';
  return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}