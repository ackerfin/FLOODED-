// Relative (remote) SOS reports submitted from /remote-sos by family members.
// Stored in localStorage under 'flooded_remote_sos'. Command reviews them and
// converts approved ones into official SOS cases.

import { v4 as uuidv4 } from 'uuid';
import { getCases, saveCases, addLog, type SOSCase, type CaseSeverity } from './commandCenter';

const KEY = 'flooded_remote_sos';

export type RelativeReportReview = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface RelativeReport {
  id: string;
  personName: string;
  personPhone?: string;
  address?: string;
  province?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  needs?: string[];
  note?: string;
  createdAt: number;
  location?: { lat: number; lng: number } | null;
  syncStatus?: string;
  // Command review fields
  review?: RelativeReportReview;
  reviewNote?: string;
  reviewedAt?: number;
  linkedCaseId?: string;
  reporterName?: string;
  reporterPhone?: string;
}

export function getRelativeReports(): RelativeReport[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]') as RelativeReport[];
    return Array.isArray(raw) ? raw.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

export function saveRelativeReports(list: RelativeReport[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function patch(id: string, updates: Partial<RelativeReport>) {
  const list = getRelativeReports();
  const i = list.findIndex(r => r.id === id);
  if (i === -1) return null;
  list[i] = { ...list[i], ...updates };
  saveRelativeReports(list);
  return list[i];
}

export function urgencyToSeverity(u: RelativeReport['urgency']): CaseSeverity {
  if (u === 'critical' || u === 'high') return 'RED';
  if (u === 'medium') return 'ORANGE';
  return 'GREEN';
}

export const urgencyLabels: Record<RelativeReport['urgency'], { vi: string; en: string }> = {
  low: { vi: 'Thấp', en: 'Low' },
  medium: { vi: 'Trung bình', en: 'Medium' },
  high: { vi: 'Cao', en: 'High' },
  critical: { vi: 'Nguy kịch', en: 'Critical' },
};

/** Approve a relative report → create an official SOS case (source: relative). */
export function acceptRelativeReport(id: string): SOSCase | null {
  const rep = getRelativeReports().find(r => r.id === id);
  if (!rep || rep.review === 'ACCEPTED') return null;

  const now = Date.now();
  const newCase: SOSCase = {
    id: uuidv4(),
    sourceType: 'relative',
    reporterName: rep.reporterName || (rep.personName ? `Người thân của ${rep.personName}` : 'Người thân'),
    reporterPhone: rep.reporterPhone || rep.personPhone || '—',
    victimName: rep.personName,
    locationText: [rep.address, rep.province].filter(Boolean).join(', ') || 'Chưa rõ',
    lat: rep.location?.lat,
    lng: rep.location?.lng,
    severity: urgencyToSeverity(rep.urgency),
    status: 'VERIFYING',
    peopleCount: 1,
    description: rep.note,
    needTags: rep.needs || [],
    createdAt: rep.createdAt || now,
    updatedAt: now,
  };

  const cases = getCases();
  cases.push(newCase);
  saveCases(cases);
  addLog(newCase.id, 'CREATED_FROM_RELATIVE_REPORT', `Hồ sơ báo hộ ${rep.id.slice(0, 8).toUpperCase()}`);

  patch(id, { review: 'ACCEPTED', reviewedAt: now, linkedCaseId: newCase.id });
  return newCase;
}

export function rejectRelativeReport(id: string, note: string) {
  return patch(id, { review: 'REJECTED', reviewNote: note, reviewedAt: Date.now() });
}

export function resetRelativeReview(id: string) {
  return patch(id, { review: 'PENDING', reviewNote: undefined, reviewedAt: undefined });
}

// ==================== SIMULATION ====================

const SIM_PEOPLE = [
  { name: 'Bà Nguyễn Thị Lan', phone: '0912345678', addr: 'Tổ 4, Phường Vỹ Dạ', province: 'Thừa Thiên Huế' },
  { name: 'Ông Trần Văn Bảy', phone: '0987654321', addr: 'Thôn Đông, Xã Quảng Phú', province: 'Quảng Trị' },
  { name: 'Em Lê Minh Khôi', phone: '0933221144', addr: 'Hẻm 12 Lê Lợi', province: 'Đà Nẵng' },
  { name: 'Chị Phạm Thu Hà', phone: '0977553311', addr: 'Khu tập thể số 3, Phường An Cựu', province: 'Thừa Thiên Huế' },
  { name: 'Gia đình ông Hồ Văn Sáu', phone: '0905112233', addr: 'Xóm Bãi, Xã Hương Toàn', province: 'Thừa Thiên Huế' },
];
const SIM_NEEDS = [['Nước sạch', 'Thực phẩm'], ['Y tế', 'Thuốc'], ['Thuyền cứu hộ'], ['Sơ tán khẩn cấp', 'Y tế']];
const SIM_NOTES = [
  'Nước ngập tới tầng 2, người già không di chuyển được.',
  'Mất liên lạc từ tối qua, nhà ở vùng trũng.',
  'Có trẻ nhỏ và người bệnh nền, cần hỗ trợ gấp.',
  'Nhà bị cô lập, hết lương thực 2 ngày.',
];
const SIM_URGENCY: RelativeReport['urgency'][] = ['medium', 'high', 'critical', 'high'];

const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

/** Create a fake relative report as if a user submitted it from /remote-sos. */
export function simulateRelativeReport(): RelativeReport {
  const p = pick(SIM_PEOPLE);
  const rep: RelativeReport = {
    id: uuidv4(),
    personName: p.name,
    personPhone: p.phone,
    address: p.addr,
    province: p.province,
    urgency: pick(SIM_URGENCY),
    needs: pick(SIM_NEEDS),
    note: pick(SIM_NOTES),
    createdAt: Date.now(),
    location: { lat: 16.35 + Math.random() * 0.6, lng: 107.4 + Math.random() * 0.9 },
    syncStatus: 'pending',
    review: 'PENDING',
    reporterName: 'Người thân (mô phỏng)',
    reporterPhone: '09' + Math.floor(10000000 + Math.random() * 89999999),
  };
  const list = getRelativeReports();
  list.push(rep);
  saveRelativeReports(list);
  return rep;
}
