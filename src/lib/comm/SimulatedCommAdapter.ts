/**
 * FLOODED – Simulated Communication Adapter (Web/PWA)
 * 
 * Developer Note:
 * This module is designed to be replaced by real BLE in React Native / Flutter version.
 * All "nearby device" data is generated locally for demo/testing purposes.
 * No real Bluetooth or mesh networking occurs.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  setNearbyDevices,
  getNearbyDevices,
  markReportsPickedUp,
  getPendingSOSReports,
  addSyncLog,
} from '@/lib/db';
import type { NearbyDevice, SOSReport } from '@/types';
import type { CommAdapter, ScanResult, BroadcastResult, DataMuleResult } from './CommAdapter';

const MOCK_DEVICE_NAMES = [
  'Hàng xóm - Nhà số 12',
  'Cứu hộ viên - Thuyền 3',
  'Trạm y tế lưu động',
  'Nhà số 8 - Bà Lan',
  'Xe cứu thương',
  'Đội phản ứng nhanh',
  'Nhà số 5 - Ông Tùng',
  'Tổ dân phố 7',
];

export class SimulatedCommAdapter implements CommAdapter {
  readonly type = 'simulated' as const;
  readonly label = 'Mô phỏng (Web Demo)';

  async scanNearby(): Promise<ScanResult> {
    // Simulate 2-5 nearby devices
    const count = 2 + Math.floor(Math.random() * 4);
    const devices: NearbyDevice[] = [];

    const usedNames = new Set<string>();
    for (let i = 0; i < count; i++) {
      let name: string;
      do {
        name = MOCK_DEVICE_NAMES[Math.floor(Math.random() * MOCK_DEVICE_NAMES.length)];
      } while (usedNames.has(name) && usedNames.size < MOCK_DEVICE_NAMES.length);
      usedNames.add(name);

      devices.push({
        id: uuidv4(),
        name,
        distance: Math.floor(10 + Math.random() * 200),
        lastSeen: Date.now() - Math.floor(Math.random() * 60000),
        sosCount: Math.floor(Math.random() * 5),
        status: Math.random() > 0.15 ? 'active' : 'inactive',
      });
    }

    // Sort by distance
    devices.sort((a, b) => a.distance - b.distance);

    await setNearbyDevices(devices);

    return { devices, timestamp: Date.now() };
  }

  async broadcastSOS(report: SOSReport): Promise<BroadcastResult> {
    const devices = await getNearbyDevices();
    const activeDevices = devices.filter(d => d.status === 'active');

    // Simulate broadcast delay (300-800ms)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const hopsAdded = 1; // Simulated single hop

    console.log(
      `[SIM-MESH] Broadcast SOS ${report.id.slice(0, 8)} to ${activeDevices.length} devices (+${hopsAdded} hop)`
    );

    return {
      success: true,
      reachedCount: activeDevices.length,
      hopsAdded,
    };
  }

  async dataMulePickup(): Promise<DataMuleResult> {
    const dataMuleId = `rescue-boat-${uuidv4().slice(0, 8)}`;
    const pendingReports = await getPendingSOSReports();

    if (pendingReports.length === 0) {
      return { success: true, pickedUpCount: 0, forwardedCount: 0, dataMuleId };
    }

    const reportIds = pendingReports.map(r => r.id);
    await markReportsPickedUp(reportIds, dataMuleId);

    await addSyncLog({
      timestamp: Date.now(),
      action: 'pickup',
      reportIds,
      success: true,
    });

    // Simulate forwarding some of the picked-up reports
    const forwardedCount = Math.min(
      reportIds.length,
      Math.max(1, Math.floor(reportIds.length * 0.7 + Math.random() * 0.3 * reportIds.length))
    );

    return {
      success: true,
      pickedUpCount: reportIds.length,
      forwardedCount,
      dataMuleId,
    };
  }

  dispose(): void {
    // No resources to clean up in simulation
  }
}
