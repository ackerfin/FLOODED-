/**
 * FLOODED – Abstract Communication Adapter
 * 
 * Developer Note:
 * This module is designed to be replaced by real BLE in React Native / Flutter version.
 * The CommAdapter interface defines a contract for nearby device discovery,
 * SOS broadcasting, and data mule (store-and-forward) operations.
 * 
 * Current implementation: SimulatedCommAdapter (web/PWA demo only).
 * Future: NativeBLEAdapter for real Bluetooth Low Energy mesh networking.
 */

import type { NearbyDevice, SOSReport } from '@/types';

export interface ScanResult {
  devices: NearbyDevice[];
  timestamp: number;
}

export interface BroadcastResult {
  success: boolean;
  reachedCount: number;
  hopsAdded: number;
}

export interface DataMuleResult {
  success: boolean;
  pickedUpCount: number;
  forwardedCount: number;
  dataMuleId: string;
}

/**
 * Abstract communication adapter.
 * All implementations must be offline-first.
 */
export interface CommAdapter {
  readonly type: 'simulated' | 'ble_native';
  readonly label: string; // Human-readable label

  /** Discover nearby devices */
  scanNearby(): Promise<ScanResult>;

  /** Broadcast an SOS packet to nearby devices */
  broadcastSOS(report: SOSReport): Promise<BroadcastResult>;

  /** Simulate or trigger a data mule pickup (rescue boat / drone) */
  dataMulePickup(): Promise<DataMuleResult>;

  /** Clean up resources */
  dispose(): void;
}
