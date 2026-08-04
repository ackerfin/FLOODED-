 import { useState, useEffect } from 'react';
 import { motion } from 'framer-motion';
 import { Compass as CompassIcon, Navigation, ArrowLeft } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { useApp } from '@/contexts/AppContext';
 
 export default function Compass() {
   const { language } = useApp();
   const [heading, setHeading] = useState(0);
   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
 
   useEffect(() => {
     // Check if DeviceOrientation is available
     if ('DeviceOrientationEvent' in window) {
       // For iOS 13+, need to request permission
       if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
         (DeviceOrientationEvent as any).requestPermission()
           .then((response: string) => {
             if (response === 'granted') {
               setHasPermission(true);
               startCompass();
             } else {
               setHasPermission(false);
             }
           })
           .catch(() => setHasPermission(false));
       } else {
         setHasPermission(true);
         startCompass();
       }
     } else {
       setHasPermission(false);
     }
 
     function startCompass() {
       const handleOrientation = (event: DeviceOrientationEvent) => {
         if (event.alpha !== null) {
           setHeading(Math.round(event.alpha));
         }
       };
 
       window.addEventListener('deviceorientation', handleOrientation);
       return () => window.removeEventListener('deviceorientation', handleOrientation);
     }
   }, []);
 
   const getDirection = (deg: number) => {
     if (deg >= 337.5 || deg < 22.5) return language === 'vi' ? 'Bắc' : 'N';
     if (deg >= 22.5 && deg < 67.5) return language === 'vi' ? 'Đông Bắc' : 'NE';
     if (deg >= 67.5 && deg < 112.5) return language === 'vi' ? 'Đông' : 'E';
     if (deg >= 112.5 && deg < 157.5) return language === 'vi' ? 'Đông Nam' : 'SE';
     if (deg >= 157.5 && deg < 202.5) return language === 'vi' ? 'Nam' : 'S';
     if (deg >= 202.5 && deg < 247.5) return language === 'vi' ? 'Tây Nam' : 'SW';
     if (deg >= 247.5 && deg < 292.5) return language === 'vi' ? 'Tây' : 'W';
     if (deg >= 292.5 && deg < 337.5) return language === 'vi' ? 'Tây Bắc' : 'NW';
     return 'N';
   };
 
   return (
     <div className="min-h-screen bg-background flex flex-col">
       {/* Header */}
       <header className="p-4 safe-top">
         <div className="flex items-center gap-4">
           <Link to="/" className="p-2 rounded-lg bg-secondary">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
             <h1 className="font-bold text-lg">
               {language === 'vi' ? 'La bàn' : 'Compass'}
             </h1>
             <p className="text-xs text-muted-foreground">
               {language === 'vi' ? 'Xác định hướng' : 'Find direction'}
             </p>
           </div>
         </div>
       </header>
 
       <main className="flex-1 flex flex-col items-center justify-center p-8">
         {hasPermission === false ? (
           <div className="text-center">
             <CompassIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
             <p className="text-muted-foreground">
               {language === 'vi'
                 ? 'La bàn không khả dụng trên thiết bị này'
                 : 'Compass not available on this device'}
             </p>
           </div>
         ) : (
           <>
             {/* Compass Ring */}
             <div className="relative w-72 h-72">
               <motion.div
                 className="absolute inset-0 rounded-full border-4 border-border"
                 style={{ rotate: -heading }}
                 transition={{ type: 'spring', stiffness: 100, damping: 20 }}
               >
                 {/* Cardinal directions */}
                 {['N', 'E', 'S', 'W'].map((dir, i) => (
                   <div
                     key={dir}
                     className="absolute w-full h-full flex items-start justify-center"
                     style={{ transform: `rotate(${i * 90}deg)` }}
                   >
                     <span className={`mt-4 text-xl font-bold ${dir === 'N' ? 'text-primary' : 'text-foreground'}`}>
                       {dir}
                     </span>
                   </div>
                 ))}
 
                 {/* Degree marks */}
                 {Array.from({ length: 36 }).map((_, i) => (
                   <div
                     key={i}
                     className="absolute w-full h-full flex items-start justify-center"
                     style={{ transform: `rotate(${i * 10}deg)` }}
                   >
                     <div className={`w-0.5 ${i % 9 === 0 ? 'h-4 bg-foreground' : 'h-2 bg-muted-foreground'}`} />
                   </div>
                 ))}
               </motion.div>
 
               {/* Center needle */}
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative">
                   <Navigation className="w-12 h-12 text-primary" style={{ transform: 'rotate(0deg)' }} />
                 </div>
               </div>
             </div>
 
             {/* Heading Display */}
             <div className="mt-8 text-center">
               <p className="text-5xl font-bold font-mono">{heading}°</p>
               <p className="text-xl text-muted-foreground mt-2">
                 {getDirection(heading)}
               </p>
             </div>
           </>
         )}
       </main>
     </div>
   );
 }