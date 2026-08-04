 // FLOODED - IndexedDB Offline Database Service
 import { openDB, DBSchema, IDBPDatabase } from 'idb';
 import { v4 as uuidv4 } from 'uuid';
 import type { 
   Device, 
   SOSReport, 
   MedicalProfile, 
   SyncLog, 
   AppSettings,
   NearbyDevice 
 } from '@/types';
 
 interface FloodedDB extends DBSchema {
   device: {
     key: string;
     value: Device;
   };
   sosReports: {
     key: string;
     value: SOSReport;
     indexes: {
       'by-sync': string;
       'by-timestamp': number;
     };
   };
   medicalProfile: {
     key: string;
     value: MedicalProfile & { id: string };
   };
   syncLogs: {
     key: string;
     value: SyncLog;
     indexes: {
       'by-timestamp': number;
     };
   };
   settings: {
     key: string;
     value: AppSettings & { id: string };
   };
   nearbyDevices: {
     key: string;
     value: NearbyDevice;
   };
 }
 
 const DB_NAME = 'flooded-db';
 const DB_VERSION = 1;
 
 let dbInstance: IDBPDatabase<FloodedDB> | null = null;
 
 export async function getDB(): Promise<IDBPDatabase<FloodedDB>> {
   if (dbInstance) return dbInstance;
 
   dbInstance = await openDB<FloodedDB>(DB_NAME, DB_VERSION, {
     upgrade(db) {
       // Device store
       if (!db.objectStoreNames.contains('device')) {
         db.createObjectStore('device', { keyPath: 'id' });
       }
 
       // SOS Reports store
       if (!db.objectStoreNames.contains('sosReports')) {
         const sosStore = db.createObjectStore('sosReports', { keyPath: 'id' });
         sosStore.createIndex('by-sync', 'syncStatus');
         sosStore.createIndex('by-timestamp', 'timestamp');
       }
 
       // Medical Profile store
       if (!db.objectStoreNames.contains('medicalProfile')) {
         db.createObjectStore('medicalProfile', { keyPath: 'id' });
       }
 
       // Sync Logs store
       if (!db.objectStoreNames.contains('syncLogs')) {
         const logsStore = db.createObjectStore('syncLogs', { keyPath: 'id' });
         logsStore.createIndex('by-timestamp', 'timestamp');
       }
 
       // Settings store
       if (!db.objectStoreNames.contains('settings')) {
         db.createObjectStore('settings', { keyPath: 'id' });
       }
 
       // Nearby Devices store (simulated mesh)
       if (!db.objectStoreNames.contains('nearbyDevices')) {
         db.createObjectStore('nearbyDevices', { keyPath: 'id' });
       }
     },
   });
 
   return dbInstance;
 }
 
 // Device Management
 export async function getOrCreateDevice(): Promise<Device> {
   const db = await getDB();
   const devices = await db.getAll('device');
   
   if (devices.length > 0) {
     const device = devices[0];
     device.lastSeen = Date.now();
     await db.put('device', device);
     return device;
   }
 
   const newDevice: Device = {
     id: uuidv4(),
     createdAt: Date.now(),
     lastSeen: Date.now(),
   };
 
   await db.add('device', newDevice);
   return newDevice;
 }
 
 // SOS Reports
 export async function createSOSReport(
   report: Omit<SOSReport, 'id' | 'syncStatus' | 'timestamp'>
 ): Promise<SOSReport> {
   const db = await getDB();
   const fullReport: SOSReport = {
     ...report,
     id: uuidv4(),
     timestamp: Date.now(),
     syncStatus: 'pending',
   };
 
   await db.add('sosReports', fullReport);
   return fullReport;
 }
 
 export async function getAllSOSReports(): Promise<SOSReport[]> {
   const db = await getDB();
   return db.getAllFromIndex('sosReports', 'by-timestamp');
 }
 
 export async function getPendingSOSReports(): Promise<SOSReport[]> {
   const db = await getDB();
   return db.getAllFromIndex('sosReports', 'by-sync', 'pending');
 }
 
 export async function markReportsSynced(reportIds: string[]): Promise<void> {
   const db = await getDB();
   const tx = db.transaction('sosReports', 'readwrite');
   
   for (const id of reportIds) {
     const report = await tx.store.get(id);
     if (report) {
       report.syncStatus = 'synced';
       report.syncedAt = Date.now();
       await tx.store.put(report);
     }
   }
   
   await tx.done;
 }
 
 export async function markReportsPickedUp(
   reportIds: string[], 
   dataMuleId: string
 ): Promise<void> {
   const db = await getDB();
   const tx = db.transaction('sosReports', 'readwrite');
   
   for (const id of reportIds) {
     const report = await tx.store.get(id);
     if (report) {
       report.pickedUpBy = dataMuleId;
       report.pickedUpAt = Date.now();
       await tx.store.put(report);
     }
   }
   
   await tx.done;
 }
 
 // Medical Profile
 export async function getMedicalProfile(): Promise<MedicalProfile | null> {
   const db = await getDB();
   const profiles = await db.getAll('medicalProfile');
   return profiles.length > 0 ? profiles[0] : null;
 }
 
 export async function saveMedicalProfile(profile: MedicalProfile): Promise<void> {
   const db = await getDB();
   const profiles = await db.getAll('medicalProfile');
   const id = profiles.length > 0 ? profiles[0].id : uuidv4();
   await db.put('medicalProfile', { ...profile, id });
 }
 
 // Settings
 export async function getSettings(): Promise<AppSettings> {
   const db = await getDB();
   const settings = await db.getAll('settings');
   
   if (settings.length > 0) {
     return settings[0];
   }
 
   const defaultSettings: AppSettings & { id: string } = {
     id: 'main',
     lowPowerMode: false,
     language: 'vi',
     syncIntervalMs: 30000,
   };
 
   await db.add('settings', defaultSettings);
   return defaultSettings;
 }
 
 export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
   const db = await getDB();
   const current = await getSettings();
   await db.put('settings', { ...current, ...updates, id: 'main' });
 }
 
 // Sync Logs
 export async function addSyncLog(log: Omit<SyncLog, 'id'>): Promise<void> {
   const db = await getDB();
   await db.add('syncLogs', { ...log, id: uuidv4() });
 }
 
 export async function getSyncLogs(): Promise<SyncLog[]> {
   const db = await getDB();
   return db.getAllFromIndex('syncLogs', 'by-timestamp');
 }
 
 // Simulated Nearby Devices
 export async function setNearbyDevices(devices: NearbyDevice[]): Promise<void> {
   const db = await getDB();
   const tx = db.transaction('nearbyDevices', 'readwrite');
   await tx.store.clear();
   for (const device of devices) {
     await tx.store.add(device);
   }
   await tx.done;
 }
 
 export async function getNearbyDevices(): Promise<NearbyDevice[]> {
   const db = await getDB();
   return db.getAll('nearbyDevices');
 }