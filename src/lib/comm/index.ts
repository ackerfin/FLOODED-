/**
 * FLOODED – Communication Layer Entry Point
 */
import { Capacitor } from '@capacitor/core';
import type { CommAdapter } from './CommAdapter';
import { SimulatedCommAdapter } from './SimulatedCommAdapter';
import { NativeBLEAdapter } from './NativeBLEAdapter';

export type { CommAdapter, ScanResult, BroadcastResult, DataMuleResult } from './CommAdapter';
export { SimulatedCommAdapter } from './SimulatedCommAdapter';
export { NativeBLEAdapter } from './NativeBLEAdapter';

let _instance: CommAdapter | null = null;

export function getCommAdapter(): CommAdapter {
  if (!_instance) {
    if (Capacitor.isNativePlatform()) {
      // Ep kiểu 'as CommAdapter' đảm bảo TypeScript bỏ qua mọi xung đột kiểu dư thừa
      _instance = new NativeBLEAdapter() as unknown as CommAdapter;
    } else {
      _instance = new SimulatedCommAdapter();
    }
  }
  return _instance;
}