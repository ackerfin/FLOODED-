 // FLOODED - Mock Sync Service
 import { getPendingSOSReports, markReportsSynced, addSyncLog } from './db';
 import type { SOSReport } from '@/types';
 
 const MOCK_API_ENDPOINT = '/api/sos'; // Simulated
 
 export function isOnline(): boolean {
   return navigator.onLine;
 }
 
 // Mock API call
 async function mockPushToServer(reports: SOSReport[]): Promise<boolean> {
   // Simulate network delay
   await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
   
   // Simulate 95% success rate
   if (Math.random() > 0.05) {
     console.log('[SYNC] Mock API received reports:', reports.length);
     return true;
   }
   
   throw new Error('Mock network error');
 }
 
 export async function syncPendingReports(): Promise<{
   success: boolean;
   syncedCount: number;
   error?: string;
 }> {
   if (!isOnline()) {
     return { success: false, syncedCount: 0, error: 'No network connection' };
   }
 
   const pendingReports = await getPendingSOSReports();
   
   if (pendingReports.length === 0) {
     return { success: true, syncedCount: 0 };
   }
 
   try {
     await mockPushToServer(pendingReports);
     
     const reportIds = pendingReports.map(r => r.id);
     await markReportsSynced(reportIds);
     
     await addSyncLog({
       timestamp: Date.now(),
       action: 'push',
       reportIds,
       success: true,
     });
 
     return { success: true, syncedCount: reportIds.length };
   } catch (error) {
     const errorMessage = error instanceof Error ? error.message : 'Unknown error';
     
     await addSyncLog({
       timestamp: Date.now(),
       action: 'push',
       reportIds: pendingReports.map(r => r.id),
       success: false,
       error: errorMessage,
     });
 
     return { success: false, syncedCount: 0, error: errorMessage };
   }
 }
 
 // Auto-sync when online
 let syncInterval: number | null = null;
 
 export function startAutoSync(intervalMs: number = 30000): void {
   if (syncInterval) {
     clearInterval(syncInterval);
   }
 
   syncInterval = window.setInterval(async () => {
     if (isOnline()) {
       const result = await syncPendingReports();
       if (result.syncedCount > 0) {
         console.log(`[SYNC] Auto-synced ${result.syncedCount} reports`);
       }
     }
   }, intervalMs);
 
   // Also sync when coming back online
   window.addEventListener('online', async () => {
     console.log('[SYNC] Network restored, syncing...');
     await syncPendingReports();
   });
 }
 
 export function stopAutoSync(): void {
   if (syncInterval) {
     clearInterval(syncInterval);
     syncInterval = null;
   }
 }