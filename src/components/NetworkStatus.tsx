 import { motion } from 'framer-motion';
 import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
 import { useApp } from '@/contexts/AppContext';
 
 export function NetworkStatus() {
   const { isOnline, pendingCount, language } = useApp();
 
   return (
     <div className="flex items-center justify-between px-4 py-3 bg-card rounded-xl border border-border">
       <div className="flex items-center gap-3">
         {isOnline ? (
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="flex items-center gap-2"
           >
             <Wifi className="w-5 h-5 text-success" />
             <span className="text-sm font-medium text-success">
               {language === 'vi' ? 'Có mạng' : 'Online'}
             </span>
           </motion.div>
         ) : (
           <motion.div
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="flex items-center gap-2"
           >
             <WifiOff className="w-5 h-5 text-status-injured" />
             <span className="text-sm font-medium text-warning">
               {language === 'vi' ? 'Ngoại tuyến' : 'Offline'}
             </span>
           </motion.div>
         )}
       </div>
 
       {pendingCount > 0 && (
         <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="flex items-center gap-2 px-3 py-1 bg-warning/20 rounded-full"
         >
           <CloudOff className="w-4 h-4 text-warning" />
           <span className="text-xs font-bold text-warning">
             {pendingCount} {language === 'vi' ? 'chờ gửi' : 'pending'}
           </span>
         </motion.div>
       )}
 
       {pendingCount === 0 && isOnline && (
         <div className="flex items-center gap-2 text-muted-foreground">
           <Cloud className="w-4 h-4" />
           <span className="text-xs">
             {language === 'vi' ? 'Đã đồng bộ' : 'Synced'}
           </span>
         </div>
       )}
     </div>
   );
 }