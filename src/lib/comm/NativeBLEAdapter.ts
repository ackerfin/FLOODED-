// src/lib/comm/NativeBLEAdapter.ts
import type { CommAdapter, BroadcastResult, ScanResult, DataMuleResult } from './CommAdapter';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { broadcastSOSToNearby } from '@/lib/mesh';
import type { SOSReport } from '@/types';

export class NativeBLEAdapter implements CommAdapter {
  readonly type = 'ble_native' as const;
  readonly label = 'BLE thật (Access Relay T-Beam)';

  async broadcastSOS(report: SOSReport): Promise<BroadcastResult> {
    // Timeout 8 giay - bao ca BleClient.initialize() lan sendPacketViaBle(),
    // tranh treo vinh vien tren iOS neu CBCentralManager ket o trang thai
    // unauthorized/denied (khong co callback, khong co loi).
    const timeoutMs = 8000;
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('BLE_TIMEOUT')), timeoutMs)
    );

    const sendPromise = (async () => {
      await BleClient.initialize();
      const result = await broadcastSOSToNearby(report);
      return { success: result.success, reachedCount: result.reachedCount, hopsAdded: 0 };
    })();

    try {
      // Đua giữa việc gửi BLE (bao gồm cả initialize) và thời gian Timeout
      return await Promise.race([sendPromise, timeoutPromise]);
    } catch (e) {
      console.error('[NativeBLEAdapter] Lỗi hoặc hết thời gian chờ BLE:', e);
      // Trả về false để UI biết và dừng spinner
      return { success: false, reachedCount: 0, hopsAdded: 0 };
    }
  }

  async scanNearby(): Promise<ScanResult> {
    return { devices: [], timestamp: Date.now() };
  }

  async dataMulePickup(): Promise<DataMuleResult> {
    return { success: false, pickedUpCount: 0, forwardedCount: 0, dataMuleId: '' };
  }

  dispose(): void {}
}