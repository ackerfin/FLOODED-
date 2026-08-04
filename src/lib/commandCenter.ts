// FLOODED - Command Center Data Layer
// Types, seed data, and localStorage persistence for Rescue Command Center
import { v4 as uuidv4 } from 'uuid';
import { provinces } from './provinces';

// ==================== TYPES ====================

export type CaseSeverity = 'RED' | 'ORANGE' | 'GREEN';

export type CaseStatus =
  | 'NEW'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'WAITING_FOR_ASSIGNMENT'
  | 'ASSIGNED'
  | 'TEAM_ACCEPTED'
  | 'IN_PROGRESS'
  | 'RESCUED'
  | 'CLOSED'
  | 'DUPLICATE'
  | 'FALSE_REPORT'
  | 'WAITING_SAFE_CONDITIONS';

export type TeamStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'RETURNING';
export type ZoneStatus = 'OK' | 'NEED_SUPPORT' | 'NO_TEAM';
export type SourceType = 'citizen' | 'relative';

export interface RescueTeamAccount {
  id: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  membersCount: number;
  vehicleType: string;
  username: string;
  password: string; // plain for demo
  status: TeamStatus;
  currentLocation?: { lat: number; lng: number };
  lastUpdated: number;
  assignedCaseId?: string;
}

export interface Zone {
  id: string;
  name: string;
  province: string;
  status: ZoneStatus;
}

export interface SOSCase {
  id: string;
  sourceType: SourceType;
  reporterName: string;
  reporterPhone: string;
  victimName?: string;
  locationText: string;
  lat?: number;
  lng?: number;
  zoneId?: string;
  severity: CaseSeverity;
  status: CaseStatus;
  assignedTeamId?: string;
  peopleCount: number;
  vulnerableGroups?: string; // children, elderly, disabled
  description?: string;
  needTags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CaseLog {
  id: string;
  caseId: string;
  actorRole: 'operator' | 'system';
  actorName: string;
  action: string;
  note?: string;
  timestamp: number;
}

// ==================== STATUS METADATA ====================

export const caseStatusMeta: Record<CaseStatus, { vi: string; en: string; color: string }> = {
  NEW: { vi: 'Mới', en: 'New', color: 'bg-destructive text-destructive-foreground' },
  VERIFYING: { vi: 'Đang xác minh', en: 'Verifying', color: 'bg-warning text-warning-foreground' },
  VERIFIED: { vi: 'Đã xác minh', en: 'Verified', color: 'bg-accent text-accent-foreground' },
  WAITING_FOR_ASSIGNMENT: { vi: 'Chờ phân công', en: 'Waiting', color: 'bg-warning text-warning-foreground' },
  ASSIGNED: { vi: 'Đã phân công', en: 'Assigned', color: 'bg-accent text-accent-foreground' },
  TEAM_ACCEPTED: { vi: 'Đội đã nhận', en: 'Accepted', color: 'bg-accent text-accent-foreground' },
  IN_PROGRESS: { vi: 'Đang xử lý', en: 'In Progress', color: 'bg-warning text-warning-foreground' },
  RESCUED: { vi: 'Đã cứu', en: 'Rescued', color: 'bg-success text-success-foreground' },
  CLOSED: { vi: 'Đóng', en: 'Closed', color: 'bg-muted text-muted-foreground' },
  DUPLICATE: { vi: 'Trùng', en: 'Duplicate', color: 'bg-muted text-muted-foreground' },
  FALSE_REPORT: { vi: 'Báo giả', en: 'False', color: 'bg-muted text-muted-foreground' },
  WAITING_SAFE_CONDITIONS: { vi: 'Chờ an toàn', en: 'Wait Safe', color: 'bg-secondary text-secondary-foreground' },
};

export const severityMeta: Record<CaseSeverity, { vi: string; en: string; color: string; bgClass: string }> = {
  RED: { vi: 'Đỏ – Nguy hiểm', en: 'RED – Critical', color: 'bg-status-critical', bgClass: 'bg-destructive/20 text-destructive' },
  ORANGE: { vi: 'Cam – Khẩn', en: 'ORANGE – Urgent', color: 'bg-status-injured', bgClass: 'bg-warning/20 text-warning' },
  GREEN: { vi: 'Xanh – Theo dõi', en: 'GREEN – Monitor', color: 'bg-status-ok', bgClass: 'bg-success/20 text-success' },
};

export const teamStatusMeta: Record<TeamStatus, { vi: string; en: string; color: string }> = {
  AVAILABLE: { vi: 'Sẵn sàng', en: 'Available', color: 'bg-success/20 text-success' },
  BUSY: { vi: 'Đang làm', en: 'Busy', color: 'bg-warning/20 text-warning' },
  OFFLINE: { vi: 'Offline', en: 'Offline', color: 'bg-muted text-muted-foreground' },
  RETURNING: { vi: 'Đang về', en: 'Returning', color: 'bg-accent/20 text-accent' },
};

// Pipeline filter groups for COMMAND workflow
export type PipelineFilterKey = 'ALL' | 'VERIFYING_GROUP' | 'IN_PROGRESS' | 'ASSIGNED_GROUP' | 'COMPLETED_GROUP';

export const pipelineFilters: { key: PipelineFilterKey; vi: string; en: string }[] = [
  { key: 'ALL', vi: 'Tất cả', en: 'All' },
  { key: 'VERIFYING_GROUP', vi: 'Đang xác minh', en: 'Verifying' },
  { key: 'IN_PROGRESS', vi: 'Điều hướng', en: 'En Route' },
  { key: 'ASSIGNED_GROUP', vi: 'Đã phân công', en: 'Assigned' },
  { key: 'COMPLETED_GROUP', vi: 'Hoàn thành', en: 'Completed' },
];

// Map pipeline filter keys to actual case statuses
export function filterCasesByPipeline(cases: SOSCase[], filter: PipelineFilterKey): SOSCase[] {
  if (filter === 'ALL') return cases;
  if (filter === 'VERIFYING_GROUP') return cases.filter(c => ['NEW', 'VERIFYING', 'VERIFIED', 'WAITING_FOR_ASSIGNMENT', 'WAITING_SAFE_CONDITIONS'].includes(c.status));
  if (filter === 'IN_PROGRESS') return cases.filter(c => c.status === 'IN_PROGRESS');
  if (filter === 'ASSIGNED_GROUP') return cases.filter(c => ['ASSIGNED', 'TEAM_ACCEPTED'].includes(c.status));
  if (filter === 'COMPLETED_GROUP') return cases.filter(c => ['RESCUED', 'CLOSED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status));
  return cases;
}

// ==================== STORAGE KEYS ====================
const KEYS = {
  cases: 'cc_sos_cases',
  teams: 'cc_rescue_teams',
  zones: 'cc_zones',
  logs: 'cc_case_logs',
  seeded: 'cc_seeded_v3',
};

// ==================== PERSISTENCE ====================
function load<T>(key: string, fallback: T[]): T[] {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
  catch { return fallback; }
}
function save<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

// ==================== ACCESSORS ====================
export function getCases(): SOSCase[] { return load<SOSCase>(KEYS.cases, []); }
export function saveCases(c: SOSCase[]) { save(KEYS.cases, c); }

export function getTeams(): RescueTeamAccount[] { return load<RescueTeamAccount>(KEYS.teams, []); }
export function saveTeams(t: RescueTeamAccount[]) { save(KEYS.teams, t); }

export function getZones(): Zone[] { return load<Zone>(KEYS.zones, []); }
export function saveZones(z: Zone[]) { save(KEYS.zones, z); }

export function getLogs(): CaseLog[] { return load<CaseLog>(KEYS.logs, []); }
export function saveLogs(l: CaseLog[]) { save(KEYS.logs, l); }

export function addLog(caseId: string, action: string, note?: string) {
  const logs = getLogs();
  logs.push({ id: uuidv4(), caseId, actorRole: 'operator', actorName: 'Command', action, note, timestamp: Date.now() });
  saveLogs(logs);
}

export function updateCaseStatus(caseId: string, status: CaseStatus, note?: string) {
  const cases = getCases();
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) return;
  cases[idx].status = status;
  cases[idx].updatedAt = Date.now();
  saveCases(cases);
  addLog(caseId, `Status → ${status}`, note);
}

export function assignTeamToCase(caseId: string, teamId: string) {
  const cases = getCases();
  const teams = getTeams();
  const ci = cases.findIndex(c => c.id === caseId);
  const ti = teams.findIndex(t => t.id === teamId);
  if (ci === -1 || ti === -1) return;
  cases[ci].assignedTeamId = teamId;
  cases[ci].status = 'ASSIGNED';
  cases[ci].updatedAt = Date.now();
  teams[ti].status = 'BUSY';
  teams[ti].assignedCaseId = caseId;
  teams[ti].lastUpdated = Date.now();
  saveCases(cases);
  saveTeams(teams);
  addLog(caseId, `Phân công đội: ${teams[ti].name}`);
}

// Zone stats helper
export function getZoneStats(zoneId: string) {
  const cases = getCases().filter(c => c.zoneId === zoneId);
  const active = cases.filter(c => !['CLOSED', 'RESCUED', 'DUPLICATE', 'FALSE_REPORT'].includes(c.status));
  const unassigned = active.filter(c => !c.assignedTeamId);
  const teams = getTeams().filter(t => {
    const tc = getCases().find(c => c.id === t.assignedCaseId);
    return tc && tc.zoneId === zoneId && t.status === 'BUSY';
  });
  return { total: cases.length, active: active.length, unassigned: unassigned.length, teamsInZone: teams.length };
}

// ==================== SEED DATA ====================
export function seedDemoData() {
  if (localStorage.getItem(KEYS.seeded)) return;

  // Zones
  const zones: Zone[] = [
    { id: 'z1', name: 'Q. Hải Châu', province: 'Đà Nẵng', status: 'NEED_SUPPORT' },
    { id: 'z2', name: 'H. Hòa Vang', province: 'Đà Nẵng', status: 'NO_TEAM' },
    { id: 'z3', name: 'Q. Sơn Trà', province: 'Đà Nẵng', status: 'OK' },
    { id: 'z4', name: 'TX. Điện Bàn', province: 'Quảng Ngãi', status: 'NEED_SUPPORT' },
    { id: 'z5', name: 'TP. Huế', province: 'Huế', status: 'OK' },
    { id: 'z6', name: 'H. Phú Lộc', province: 'Huế', status: 'NO_TEAM' },
  ];

  // Teams
  const teams: RescueTeamAccount[] = [
    { id: 't1', name: 'Đội Rồng Xanh', leaderName: 'Nguyễn Văn Hùng', leaderPhone: '0901234567', membersCount: 6, vehicleType: 'Thuyền máy', username: 'rongxanh', password: 'demo1234', status: 'AVAILABLE', currentLocation: { lat: 16.054, lng: 108.202 }, lastUpdated: Date.now() },
    { id: 't2', name: 'Đội Sấm Sét', leaderName: 'Trần Minh Đức', leaderPhone: '0909876543', membersCount: 5, vehicleType: 'Xe tải + canô', username: 'samset', password: 'demo1234', status: 'BUSY', currentLocation: { lat: 16.060, lng: 108.215 }, lastUpdated: Date.now(), assignedCaseId: 'c3' },
    { id: 't3', name: 'Đội Phượng Hoàng', leaderName: 'Lê Thị Mai', leaderPhone: '0912345678', membersCount: 4, vehicleType: 'Thuyền cao su', username: 'phuonghoang', password: 'demo1234', status: 'AVAILABLE', currentLocation: { lat: 16.048, lng: 108.198 }, lastUpdated: Date.now() },
    { id: 't4', name: 'Đội Bão Táp', leaderName: 'Phạm Quốc Tuấn', leaderPhone: '0923456789', membersCount: 7, vehicleType: 'Xe cứu hộ', username: 'baotap', password: 'demo1234', status: 'RETURNING', currentLocation: { lat: 16.070, lng: 108.220 }, lastUpdated: Date.now() },
    { id: 't5', name: 'Đội Thần Tốc', leaderName: 'Hoàng Anh Kiệt', leaderPhone: '0934567890', membersCount: 5, vehicleType: 'Thuyền máy', username: 'thantoc', password: 'demo1234', status: 'OFFLINE', currentLocation: { lat: 16.045, lng: 108.180 }, lastUpdated: Date.now() - 3600000 },
    { id: 't6', name: 'Đội Lũ Quét', leaderName: 'Vũ Đình Hải', leaderPhone: '0945678901', membersCount: 4, vehicleType: 'Canô', username: 'luquet', password: 'demo1234', status: 'AVAILABLE', currentLocation: { lat: 16.462, lng: 107.590 }, lastUpdated: Date.now() },
    { id: 't7', name: 'Đội Sao Biển', leaderName: 'Đặng Thanh Sơn', leaderPhone: '0956789012', membersCount: 3, vehicleType: 'Thuyền nhỏ', username: 'saobien', password: 'demo1234', status: 'BUSY', currentLocation: { lat: 16.465, lng: 107.595 }, lastUpdated: Date.now(), assignedCaseId: 'c8' },
  ];

  // Cases
  const now = Date.now();
  const cases: SOSCase[] = [
    { id: 'c1', sourceType: 'citizen', reporterName: 'Nguyễn Thị Hoa', reporterPhone: '0911111111', locationText: '45 Trần Phú, Q. Hải Châu', lat: 16.054, lng: 108.202, zoneId: 'z1', severity: 'RED', status: 'NEW', peopleCount: 5, vulnerableGroups: '2 trẻ em, 1 người già', description: 'Nước ngập tầng 1, gia đình mắc kẹt trên tầng 2', needTags: ['Áo phao', 'Thuyền'], createdAt: now - 600000, updatedAt: now - 600000 },
    { id: 'c2', sourceType: 'relative', reporterName: 'Phạm Minh Tuấn', reporterPhone: '0922222222', victimName: 'Phạm Văn Tám', locationText: 'Thôn 3, xã Hòa Phong, H. Hòa Vang', lat: 16.010, lng: 108.140, zoneId: 'z2', severity: 'RED', status: 'VERIFYING', peopleCount: 3, vulnerableGroups: '1 người già bệnh nền', description: 'Mất liên lạc 2 tiếng, vùng ngập sâu', needTags: ['Thuốc', 'Nước sạch', 'Di chuyển'], createdAt: now - 1200000, updatedAt: now - 900000 },
    { id: 'c3', sourceType: 'citizen', reporterName: 'Lê Quang Vinh', reporterPhone: '0933333333', locationText: '12 Ngô Quyền, Q. Sơn Trà', lat: 16.072, lng: 108.225, zoneId: 'z3', severity: 'ORANGE', status: 'IN_PROGRESS', assignedTeamId: 't2', peopleCount: 2, description: 'Xe ô tô chết máy giữa đường ngập, cần kéo ra', needTags: ['Di chuyển'], createdAt: now - 2400000, updatedAt: now - 1800000 },
    { id: 'c4', sourceType: 'citizen', reporterName: 'Trương Thị Lan', reporterPhone: '0944444444', locationText: '78 Lê Duẩn, Q. Hải Châu', lat: 16.056, lng: 108.210, zoneId: 'z1', severity: 'ORANGE', status: 'VERIFIED', peopleCount: 8, vulnerableGroups: '3 trẻ em', description: 'Nhà trọ 8 người, nước ngập gần 1m, cần di tản', needTags: ['Áo phao', 'Đồ ăn', 'Nước sạch'], createdAt: now - 1800000, updatedAt: now - 1200000 },
    { id: 'c5', sourceType: 'citizen', reporterName: 'Hồ Văn Nam', reporterPhone: '0955555555', locationText: '23 Bạch Đằng, Q. Hải Châu', lat: 16.052, lng: 108.200, zoneId: 'z1', severity: 'GREEN', status: 'WAITING_FOR_ASSIGNMENT', peopleCount: 2, description: 'Cần nước sạch và lương thực, nhà ngập nhẹ', needTags: ['Nước sạch', 'Đồ ăn'], createdAt: now - 3600000, updatedAt: now - 3000000 },
    { id: 'c6', sourceType: 'relative', reporterName: 'Đỗ Thị Thanh', reporterPhone: '0966666666', victimName: 'Đỗ Minh Quân', locationText: 'Xã Hòa Nhơn, H. Hòa Vang', lat: 16.020, lng: 108.150, zoneId: 'z2', severity: 'RED', status: 'NEW', peopleCount: 4, vulnerableGroups: '1 phụ nữ mang thai', description: 'Mắc kẹt trong nhà, nước dâng nhanh, có thai phụ', needTags: ['Di chuyển', 'Y tế', 'Áo phao'], createdAt: now - 300000, updatedAt: now - 300000 },
    { id: 'c7', sourceType: 'citizen', reporterName: 'Bùi Xuân Trường', reporterPhone: '0977777777', locationText: '156 Điện Biên Phủ, TX. Điện Bàn', lat: 15.890, lng: 108.260, zoneId: 'z4', severity: 'ORANGE', status: 'WAITING_SAFE_CONDITIONS', peopleCount: 6, description: 'Khu vực nước xiết, chờ nước rút mới tiếp cận được', needTags: ['Đồ ăn', 'Pin/Sạc'], createdAt: now - 5400000, updatedAt: now - 3600000 },
    { id: 'c8', sourceType: 'citizen', reporterName: 'Phan Thị Ngọc', reporterPhone: '0988888888', locationText: '34 Lê Lợi, TP. Huế', lat: 16.463, lng: 107.592, zoneId: 'z5', severity: 'ORANGE', status: 'ASSIGNED', assignedTeamId: 't7', peopleCount: 3, description: 'Ông bà cần thuốc huyết áp, nước ngập không ra ngoài được', needTags: ['Thuốc', 'Nước sạch'], createdAt: now - 4200000, updatedAt: now - 2400000 },
    { id: 'c9', sourceType: 'citizen', reporterName: 'Võ Thanh Hải', reporterPhone: '0999999999', locationText: '89 Hùng Vương, Q. Sơn Trà', lat: 16.068, lng: 108.218, zoneId: 'z3', severity: 'GREEN', status: 'RESCUED', peopleCount: 2, description: 'Đã được đưa lên cao, an toàn', createdAt: now - 7200000, updatedAt: now - 3600000 },
    { id: 'c10', sourceType: 'relative', reporterName: 'Mai Thị Hồng', reporterPhone: '0900000001', victimName: 'Mai Văn Đức', locationText: 'Thôn Phú Lộc, H. Phú Lộc', lat: 16.300, lng: 107.880, zoneId: 'z6', severity: 'RED', status: 'NEW', peopleCount: 7, vulnerableGroups: '2 trẻ em, 1 người già, 1 người khuyết tật', description: 'Mất liên lạc hoàn toàn, vùng sạt lở', needTags: ['Di chuyển', 'Y tế', 'Đèn pin'], createdAt: now - 180000, updatedAt: now - 180000 },
    { id: 'c11', sourceType: 'citizen', reporterName: 'Ngô Văn Thành', reporterPhone: '0900000002', locationText: '67 Phan Châu Trinh, Q. Hải Châu', lat: 16.058, lng: 108.208, zoneId: 'z1', severity: 'GREEN', status: 'CLOSED', peopleCount: 1, description: 'Tự di chuyển được, đã an toàn', createdAt: now - 10800000, updatedAt: now - 7200000 },
    { id: 'c12', sourceType: 'citizen', reporterName: 'Đặng Thị Vân', reporterPhone: '0900000003', locationText: '90 Nguyễn Tri Phương, Q. Hải Châu', lat: 16.050, lng: 108.206, zoneId: 'z1', severity: 'ORANGE', status: 'DUPLICATE', peopleCount: 5, description: 'Trùng với case c4 - cùng khu nhà trọ', createdAt: now - 1500000, updatedAt: now - 1200000 },
  ];

  // Logs
  const logs: CaseLog[] = [
    { id: 'l1', caseId: 'c2', actorRole: 'operator', actorName: 'Command', action: 'Status → VERIFYING', note: 'Đang gọi xác minh', timestamp: now - 900000 },
    { id: 'l2', caseId: 'c3', actorRole: 'operator', actorName: 'Command', action: 'Phân công đội: Đội Sấm Sét', timestamp: now - 1800000 },
    { id: 'l3', caseId: 'c3', actorRole: 'operator', actorName: 'Command', action: 'Status → IN_PROGRESS', timestamp: now - 1800000 },
    { id: 'l4', caseId: 'c9', actorRole: 'operator', actorName: 'Command', action: 'Status → RESCUED', note: 'Đã cứu thành công', timestamp: now - 3600000 },
    { id: 'l5', caseId: 'c12', actorRole: 'operator', actorName: 'Command', action: 'Status → DUPLICATE', note: 'Trùng c4', timestamp: now - 1200000 },
    { id: 'l6', caseId: 'c4', actorRole: 'operator', actorName: 'Command', action: 'Status → VERIFIED', note: 'Đã xác minh, nhà trọ 8 người', timestamp: now - 1200000 },
  ];

  saveZones(zones);
  saveTeams(teams);
  saveCases(cases);
  saveLogs(logs);
  localStorage.setItem(KEYS.seeded, 'true');
}

// Utility: distance between two coords (km)
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ETA estimate (rough: 15 km/h in flood)
export function estimateETA(distKm: number): string {
  const mins = Math.round(distKm / 15 * 60);
  if (mins < 1) return '< 1 phút';
  if (mins < 60) return `~${mins} phút`;
  return `~${Math.round(mins / 60 * 10) / 10}h`;
}

// Simulate team movement toward assigned case
export function simulateTeamMovement() {
  const teams = getTeams();
  const cases = getCases();
  let changed = false;
  teams.forEach(t => {
    if (t.status === 'BUSY' && t.assignedCaseId && t.currentLocation) {
      const c = cases.find(cs => cs.id === t.assignedCaseId);
      if (c && c.lat && c.lng) {
        const dLat = (c.lat - t.currentLocation.lat) * 0.08;
        const dLng = (c.lng - t.currentLocation.lng) * 0.08;
        t.currentLocation.lat += dLat + (Math.random() - 0.5) * 0.001;
        t.currentLocation.lng += dLng + (Math.random() - 0.5) * 0.001;
        t.lastUpdated = Date.now();
        changed = true;
      }
    }
  });
  if (changed) saveTeams(teams);
}
