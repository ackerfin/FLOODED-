// FLOODED - Mesh / Relay bridge
import { v4 as uuidv4 } from 'uuid';
import { setNearbyDevices, getNearbyDevices, markReportsPickedUp, getPendingSOSReports, addSyncLog, markReportsSynced } from './db';
import type { NearbyDevice, SOSReport, HealthStatus } from '@/types';
import { encodePacket, generateMessageId, PayloadType, Priority, type FloodedPacket } from './flooded/protocol';
import { sendPacketViaBle } from './flooded/bleRelay';

// Simulated nearby devices
const mockDeviceNames = [
  'Hàng xóm - Nhà số 12',
  'Cứu hộ viên - Thuyền 3',
  'Trạm y tế lưu động',
  'Nhà số 8 - Bà Lan',
  'Xe cứu thương',
  'Đội phản ứng nhanh',
];

export async function simulateNearbyDevices(): Promise<NearbyDevice[]> {
  // Simulate discovering 2-4 nearby devices
  const count = 2 + Math.floor(Math.random() * 3);
  const devices: NearbyDevice[] = [];

  for (let i = 0; i < count; i++) {
    devices.push({
      id: uuidv4(),
      name: mockDeviceNames[Math.floor(Math.random() * mockDeviceNames.length)],
      distance: Math.floor(10 + Math.random() * 200), // 10-200 meters
      lastSeen: Date.now() - Math.floor(Math.random() * 60000), // 0-60 seconds ago
      sosCount: Math.floor(Math.random() * 5),
      status: Math.random() > 0.2 ? 'active' : 'inactive',
    });
  }

  await setNearbyDevices(devices);
  return devices;
}

export async function refreshNearbyDevices(): Promise<NearbyDevice[]> {
  return simulateNearbyDevices();
}

// Data Mule simulation
export async function simulateDataMulePickup(): Promise<{
  success: boolean;
  pickedUpCount: number;
  dataMuleId: string;
}> {
  const dataMuleId = `rescue-boat-${uuidv4().slice(0, 8)}`;
  const pendingReports = await getPendingSOSReports();

  if (pendingReports.length === 0) {
    return { success: true, pickedUpCount: 0, dataMuleId };
  }

  const reportIds = pendingReports.map(r => r.id);
  await markReportsPickedUp(reportIds, dataMuleId);

  await addSyncLog({
    timestamp: Date.now(),
    action: 'pickup',
    reportIds,
    success: true,
  });

  return { success: true, pickedUpCount: reportIds.length, dataMuleId };
}

// Export getNearbyDevices for external use
export { getNearbyDevices } from './db';

// ============================================================
// GỬI SOS THẬT QUA BLE TỚI ACCESS RELAY
// Thay cho mô phỏng "broadcast tới nhiều thiết bị lân cận" ban đầu.
// Giữ NGUYÊN tên hàm + kiểu trả về để SOSFlow.tsx không cần sửa gì cả.
// reachedCount giờ chỉ là 0 hoặc 1 (gửi thẳng 1 Access Relay, không phải
// broadcast nhiều thiết bị như tên hàm gợi ý - cân nhắc đổi tên sau).
// ============================================================

// Suy ra sourceId 32-bit ỔN ĐỊNH từ deviceId (uuid) đã có sẵn qua getOrCreateDevice()
// trong db.ts - không hardcode như bản đầu mình giao, tái dùng đúng danh tính thiết bị
// đã tồn tại trong app.
function deviceIdToSourceId(deviceId: string): number {
  let hash = 0;
  for (let i = 0; i < deviceId.length; i++) {
    hash = (hash * 31 + deviceId.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// Map HealthStatus của app -> Priority của giao thức LoRa. Quyết định chủ quan,
// điều chỉnh lại sau khi có phản hồi thực tế từ Command.
function healthStatusToPriority(status: HealthStatus): Priority {
  switch (status) {
    case 'unconscious':
    case 'critical':
      return Priority.HIGH;
    case 'injured':
      return Priority.MEDIUM;
    case 'ok':
    default:
      return Priority.LOW;
  }
}

// Đóng gói SOSReport thành FloodedPacket 74 byte. LƯU Ý: payload chỉ có 40 byte -
// scenarioType + peopleCount + healthStatus đã chiếm phần lớn, description/needTags
// thường bị cắt ngắn đáng kể (đã test thật, ví dụ 70+ ký tự có dấu chỉ còn ~10 ký tự
// sau khi mã hóa). Cân nhắc rút gọn cách đóng gói nếu cần giữ description dài hơn.
function reportToPacket(report: SOSReport): FloodedPacket {
  const sourceId = deviceIdToSourceId(report.deviceId);
  const hasLocation = !!report.location;

  const payloadParts = [
    report.scenarioType ?? '',
    String(report.peopleCount),
    report.healthStatus,
    report.description ?? (report.needTags ?? []).join(','),
  ];

  return {
    protocolVersion: 1,
    messageId: generateMessageId(sourceId),
    caseId: 0,
    sourceId,
    createdAt: Math.floor(report.timestamp / 1000),
    timestampReliable: true,
    originLat1e6: hasLocation ? Math.round(report.location!.latitude * 1_000_000) : 0,
    originLon1e6: hasLocation ? Math.round(report.location!.longitude * 1_000_000) : 0,
    locationUnknown: !hasLocation,
    payloadType: PayloadType.SOS_NEW,
    priority: healthStatusToPriority(report.healthStatus),
    ttl: 5,
    hopCount: 0,
    payload: payloadParts.join('|'),
  };
}

export async function broadcastSOSToNearby(report: SOSReport): Promise<{
  success: boolean;
  reachedCount: number;
}> {
  const pkt = reportToPacket(report);
  const result = await sendPacketViaBle(pkt);

  if (result.ok) {
    // report đã được createSOSReport() lưu vào IndexedDB TRƯỚC KHI hàm này được gọi
    // (đúng thứ tự Store-before-ACK) - giờ chỉ cần đánh dấu đã đồng bộ thành công.
    await markReportsSynced([report.id]);
    return { success: true, reachedCount: 1 };
  }

  // KHÔNG gọi markReportsSynced - report giữ nguyên syncStatus 'pending' trong
  // IndexedDB, sẵn sàng cho cơ chế tự động thử lại sau này (chưa làm trong phạm vi này).
  console.warn('[BLE] Gửi SOS thất bại:', result);
  return { success: false, reachedCount: 0 };
}