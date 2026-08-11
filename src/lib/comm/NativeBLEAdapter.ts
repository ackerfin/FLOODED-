// src/lib/comm/NativeBLEAdapter.ts
import type { CommAdapter, BroadcastResult, ScanResult, DataMuleResult } from './CommAdapter';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { broadcastSOSToNearby } from '@/lib/mesh';
import type { SOSReport } from '@/types';

export class NativeBLEAdapter implements CommAdapter {
  readonly type = 'ble_native' as const;
  readonly label = 'BLE thật (Access Relay T-Beam)';

  async broadcastSOS(report: SOSReport): Promise<BroadcastResult> {
    try {
      await BleClient.initialize();
    } catch (e) {
      console.error('[NativeBLEAdapter] initialize() lỗi:', e);
    }
    const result = await broadcastSOSToNearby(report); // gọi ĐÚNG hàm đã viết, dùng sendPacketViaBle bên dưới
    return { success: result.success, reachedCount: result.reachedCount, hopsAdded: 0 };
  }

  async scanNearby(): Promise<ScanResult> {
    return { devices: [], timestamp: Date.now() };
  }

  async dataMulePickup(): Promise<DataMuleResult> {
    return { success: false, pickedUpCount: 0, forwardedCount: 0, dataMuleId: '' };
  }

  dispose(): void {}
}