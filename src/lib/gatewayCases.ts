// FLOODED - Gateway data layer (Dexie/IndexedDB + SoftAP polling)
// Replaces the static mock array as the source of truth for SOS cases.
// - Polls the local SoftAP Gateway every 4s (no Internet required)
// - Persists cases in IndexedDB via Dexie
// - Command-owned fields (verifyStatus, assignedTeam, auditLog) survive every poll
// - messageId is the duplicate key: existing messageId => update, never duplicate
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

/** Normalize a raw Gateway payload item into a CommandCase shape (gateway-owned fields only). */
function normalizeGatewayItem(raw: Record<string, unknown>): Partial<CommandCase> & { messageId: string } {
  const num = (v: unknown) => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' ? Number(v) : undefined);
  const sev = String(raw.severity ?? raw.level ?? 'ORANGE').toUpperCase();
  const severity: CaseSeverity = sev === 'RED' || sev === 'GREEN' ? (sev as CaseSeverity) : 'ORANGE';
  const messageId = String(raw.messageId ?? raw.message_id ?? raw.id ?? uuidv4());
  return {
    messageId,
    sourceType: (raw.sourceType === 'relative' ? 'relative' : 'citizen'),
    reporterName: String(raw.reporterName ?? raw.name ?? 'Không rõ'),
    reporterPhone: String(raw.reporterPhone ?? raw.phone ?? '—'),
    victimName: raw.victimName ? String(raw.victimName) : undefined,
    locationText: String(raw.locationText ?? raw.address ?? 'Chưa rõ vị trí'),
    lat: num(raw.lat),
    lng: num(raw.lng),
    severity,
    peopleCount: num(raw.peopleCount) ?? 1,
    vulnerableGroups: raw.vulnerableGroups ? String(raw.vulnerableGroups) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    needTags: Array.isArray(raw.needTags) ? (raw.needTags as string[]) : undefined,
    createdAt: num(raw.createdAt) ?? Date.now(),
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