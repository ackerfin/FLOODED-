 import { cn } from '@/lib/utils';
 import type { HealthStatus, SyncStatus } from '@/types';
 
 interface StatusBadgeProps {
   status: HealthStatus | SyncStatus;
   size?: 'sm' | 'md' | 'lg';
   showLabel?: boolean;
   language?: 'vi' | 'en';
 }
 
 const healthLabels: Record<HealthStatus, { vi: string; en: string }> = {
   ok: { vi: 'An toàn', en: 'Safe' },
   injured: { vi: 'Bị thương', en: 'Injured' },
   critical: { vi: 'Nguy kịch', en: 'Critical' },
   unconscious: { vi: 'Bất tỉnh', en: 'Unconscious' },
 };
 
 const syncLabels: Record<SyncStatus, { vi: string; en: string }> = {
   pending: { vi: 'Chờ gửi', en: 'Pending' },
   synced: { vi: 'Đã gửi', en: 'Synced' },
   failed: { vi: 'Lỗi', en: 'Failed' },
 };
 
 export function StatusBadge({ status, size = 'md', showLabel = true, language = 'vi' }: StatusBadgeProps) {
   const isHealth = ['ok', 'injured', 'critical', 'unconscious'].includes(status);
   const labels = isHealth ? healthLabels : syncLabels;
   const label = (labels as Record<string, { vi: string; en: string }>)[status]?.[language] || status;
 
   const sizeClasses = {
     sm: 'px-2 py-0.5 text-xs',
     md: 'px-3 py-1 text-sm',
     lg: 'px-4 py-2 text-base',
   };
 
   const getStatusClass = () => {
     switch (status) {
       case 'ok':
       case 'synced':
         return 'bg-status-ok text-black';
       case 'injured':
       case 'pending':
         return 'bg-status-injured text-black';
       case 'critical':
       case 'failed':
         return 'bg-status-critical text-white';
       case 'unconscious':
         return 'bg-status-unknown text-white';
       default:
         return 'bg-muted text-muted-foreground';
     }
   };
 
   return (
     <span
       className={cn(
         'inline-flex items-center justify-center font-bold uppercase tracking-wide rounded',
         sizeClasses[size],
         getStatusClass()
       )}
     >
       {showLabel ? label : null}
     </span>
   );
 }