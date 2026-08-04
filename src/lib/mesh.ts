 // FLOODED - Simulated Mesh Network
 import { v4 as uuidv4 } from 'uuid';
 import { setNearbyDevices, getNearbyDevices, markReportsPickedUp, getPendingSOSReports, addSyncLog } from './db';
 import type { NearbyDevice, SOSReport } from '@/types';
 
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
 
 // Simulate broadcasting SOS to nearby devices
 export async function broadcastSOSToNearby(report: SOSReport): Promise<{
   success: boolean;
   reachedCount: number;
 }> {
   const devices = await getNearbyDevices();
   const activeDevices = devices.filter(d => d.status === 'active');
 
   // Simulate broadcast delay
   await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
 
   console.log(`[MESH] Broadcast SOS to ${activeDevices.length} nearby devices`);
 
   return {
     success: true,
     reachedCount: activeDevices.length,
   };
 }