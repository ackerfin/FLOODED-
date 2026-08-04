// FLOODED - Rescue Team Registration Data Layer
import { v4 as uuidv4 } from 'uuid';

// ========== TYPES ==========

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TeamType = 'OFFICIAL' | 'LOCAL_PCTT' | 'VOLUNTEER_ORG' | 'DONOR_PRIVATE' | 'OTHER';
export type VehicleType = 'BOAT' | 'RAFT' | 'CANOE' | 'TRUCK' | 'MOTORBIKE' | 'ON_FOOT' | 'OTHER';
export type Availability = 'DAY' | 'NIGHT' | 'FLEXIBLE';

export const teamTypeLabels: Record<TeamType, string> = {
  OFFICIAL: 'Lực lượng chính quy',
  LOCAL_PCTT: 'Ban PCTT địa phương',
  VOLUNTEER_ORG: 'Tổ chức tình nguyện',
  DONOR_PRIVATE: 'Nhà hảo tâm / Tư nhân',
  OTHER: 'Khác',
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  BOAT: 'Thuyền máy',
  RAFT: 'Bè',
  CANOE: 'Ca nô',
  TRUCK: 'Xe tải',
  MOTORBIKE: 'Xe máy',
  ON_FOOT: 'Đi bộ',
  OTHER: 'Khác',
};

export const availabilityLabels: Record<Availability, string> = {
  DAY: 'Ban ngày',
  NIGHT: 'Ban đêm',
  FLEXIBLE: 'Linh hoạt',
};

export interface RescueTeamRegistration {
  id: string;
  createdAt: number;
  status: RegistrationStatus;
  teamName: string;
  leaderName: string;
  leaderPhone: string;
  email?: string;
  teamType: TeamType;
  province: string;
  district?: string;
  ward?: string;
  vehicleTypes: VehicleType[];
  vehicleOtherText?: string;
  membersCount: number;
  capacityNote?: string;
  availability: Availability[];
  verificationFileNames: string[]; // file names only (demo)
  licensePlate?: string;
  deviceId?: string;
  consent: boolean;
  adminNote?: string;
  rejectReason?: string;
}

export interface RescueTeamCredential {
  id: string;
  createdAt: number;
  status: 'ACTIVE' | 'DISABLED';
  registrationId: string;
  teamName: string;
  leaderName: string;
  leaderPhone: string;
  province: string;
  username: string;
  password: string; // kept for backward compat
  teamCode: string; // e.g., "ABKD-4821"
  editCount: number;
  lastEditedAt?: number;
  lastLoginAt?: number;
}

// ========== STORAGE ==========
const KEYS = {
  registrations: 'flooded_rescue_registrations',
  credentials: 'flooded_rescue_credentials',
};

function load<T>(key: string): T[] {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; }
  catch { return []; }
}
function save<T>(key: string, data: T[]) { localStorage.setItem(key, JSON.stringify(data)); }

// ========== REGISTRATIONS ==========
export function getRegistrations(): RescueTeamRegistration[] { return load<RescueTeamRegistration>(KEYS.registrations); }
export function saveRegistrations(r: RescueTeamRegistration[]) { save(KEYS.registrations, r); }

export function getRegistrationById(id: string): RescueTeamRegistration | undefined {
  return getRegistrations().find(r => r.id === id);
}

export function createRegistration(data: Omit<RescueTeamRegistration, 'id' | 'createdAt' | 'status'>): { success: boolean; id?: string; error?: string } {
  const regs = getRegistrations();

  // Anti-spam: max 3 registrations per phone per day
  const today = new Date().toDateString();
  const phoneToday = regs.filter(r => r.leaderPhone === data.leaderPhone && new Date(r.createdAt).toDateString() === today);
  if (phoneToday.length >= 3) {
    return { success: false, error: 'Số điện thoại này đã gửi 3 đăng ký hôm nay. Vui lòng thử lại ngày mai.' };
  }

  // Check if phone already has ACTIVE account
  const creds = getCredentials();
  const hasActive = creds.find(c => c.leaderPhone === data.leaderPhone && c.status === 'ACTIVE');
  if (hasActive) {
    return { success: false, error: 'Số điện thoại đã được duyệt. Hãy đăng nhập.' };
  }

  const reg: RescueTeamRegistration = {
    ...data,
    id: uuidv4(),
    createdAt: Date.now(),
    status: 'PENDING',
  };
  regs.push(reg);
  saveRegistrations(regs);
  return { success: true, id: reg.id };
}

// Generate team code: 4 uppercase letters + dash + 4 digits => 24^4 * 10^4 = 3,317,760 combos
function generateTeamCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O to avoid confusion
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += digits[Math.floor(Math.random() * digits.length)];

  // Ensure uniqueness
  const existing = getCredentials().map(c => c.teamCode);
  if (existing.includes(code)) return generateTeamCode();
  return code;
}

export function approveRegistration(id: string): { teamCode: string; teamName: string } | null {
  const regs = getRegistrations();
  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) return null;

  regs[idx].status = 'APPROVED';
  saveRegistrations(regs);

  const teamCode = generateTeamCode();

  const cred: RescueTeamCredential = {
    id: uuidv4(),
    createdAt: Date.now(),
    status: 'ACTIVE',
    registrationId: id,
    teamName: regs[idx].teamName,
    leaderName: regs[idx].leaderName,
    leaderPhone: regs[idx].leaderPhone,
    province: regs[idx].province,
    username: regs[idx].leaderName,
    password: regs[idx].leaderPhone,
    teamCode,
    editCount: 0,
  };

  const creds = getCredentials();
  creds.push(cred);
  saveCredentials(creds);

  return { teamCode, teamName: regs[idx].teamName };
}

export function rejectRegistration(id: string, reason: string) {
  const regs = getRegistrations();
  const idx = regs.findIndex(r => r.id === id);
  if (idx === -1) return;
  regs[idx].status = 'REJECTED';
  regs[idx].rejectReason = reason;
  saveRegistrations(regs);
}

// ========== CREDENTIALS ==========
export function getCredentials(): RescueTeamCredential[] { return load<RescueTeamCredential>(KEYS.credentials); }
export function saveCredentials(c: RescueTeamCredential[]) { save(KEYS.credentials, c); }

// Login by Team Name + Team Code
export function loginRescueTeam(teamName: string, teamCode: string): RescueTeamCredential | null {
  const creds = getCredentials();
  const cred = creds.find(c => c.teamName === teamName && c.teamCode === teamCode && c.status === 'ACTIVE');
  if (cred) {
    cred.lastLoginAt = Date.now();
    saveCredentials(creds);
    return cred;
  }
  return null;
}

// Update team profile (max 3 edits)
export function updateTeamProfile(credId: string, updates: { teamName?: string; leaderName?: string; leaderPhone?: string; province?: string; vehicleType?: string }): { success: boolean; error?: string } {
  const creds = getCredentials();
  const idx = creds.findIndex(c => c.id === credId);
  if (idx === -1) return { success: false, error: 'Không tìm thấy đội' };
  if (creds[idx].editCount >= 3) return { success: false, error: 'Đã đạt giới hạn chỉnh sửa (3 lần)' };

  if (updates.teamName) creds[idx].teamName = updates.teamName;
  if (updates.leaderName) creds[idx].leaderName = updates.leaderName;
  if (updates.leaderPhone) creds[idx].leaderPhone = updates.leaderPhone;
  if (updates.province) creds[idx].province = updates.province;
  creds[idx].editCount += 1;
  creds[idx].lastEditedAt = Date.now();
  saveCredentials(creds);
  return { success: true };
}

// Command hardcoded (demo)
export function loginCommand(username: string, password: string): boolean {
  return username === 'Command 01' && password === '1234';
}

// Ensure demo team exists for judging
export function ensureDemoTeam() {
  const creds = getCredentials();
  if (creds.find(c => c.teamCode === '1111-1234')) return;
  const demoCred: RescueTeamCredential = {
    id: 'demo-team-1',
    createdAt: Date.now(),
    status: 'ACTIVE',
    registrationId: 'demo-reg',
    teamName: 'Đội Demo',
    leaderName: 'Nguyễn Văn A',
    leaderPhone: '0900001111',
    province: 'Đà Nẵng',
    username: 'Nguyễn Văn A',
    password: '0900001111',
    teamCode: '1111-1234',
    editCount: 0,
  };
  creds.push(demoCred);
  saveCredentials(creds);
}
