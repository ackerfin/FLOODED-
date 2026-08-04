/**
 * FLOODED – Communication Layer Entry Point
 * 
 * Developer Note:
 * This module is designed to be replaced by real BLE in React Native / Flutter version.
 * To swap adapter: import NativeBLEAdapter and return it from getCommAdapter().
 */

export type { CommAdapter, ScanResult, BroadcastResult, DataMuleResult } from './CommAdapter';
export { SimulatedCommAdapter } from './SimulatedCommAdapter';

import { SimulatedCommAdapter } from './SimulatedCommAdapter';
import type { CommAdapter } from './CommAdapter';

let _instance: CommAdapter | null = null;

/**
 * Get the singleton CommAdapter instance.
 * In web/PWA mode this always returns SimulatedCommAdapter.
 * In a future native app, this would detect BLE capability and return NativeBLEAdapter.
 */
export function getCommAdapter(): CommAdapter {
  if (!_instance) {
    // Future: check for native BLE capability
    // if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
    //   _instance = new NativeBLEAdapter();
    // } else {
    _instance = new SimulatedCommAdapter();
    // }
  }
  return _instance;
}
