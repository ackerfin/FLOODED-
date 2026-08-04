 import { motion } from 'framer-motion';
 import { 
   Home, HeartPulse, UserX, Car, Building, Zap, Droplets, Ambulance, HelpCircle,
   LucideIcon
 } from 'lucide-react';
 import { useApp } from '@/contexts/AppContext';
 import type { SurvivalScenario } from '@/types';
 
 const iconMap: Record<string, LucideIcon> = {
   Home,
   HeartPulse,
   UserX,
   Car,
   Building,
   Zap,
   Droplets,
   Ambulance,
 };
 
 interface ScenarioCardProps {
   scenario: SurvivalScenario;
   onClick: () => void;
 }
 
 export function ScenarioCard({ scenario, onClick }: ScenarioCardProps) {
   const { language } = useApp();
   
   const IconComponent = iconMap[scenario.iconName] || HelpCircle;
 
   return (
     <motion.button
       onClick={onClick}
       className="tactical-card w-full text-left flex items-center gap-4 p-4"
       whileTap={{ scale: 0.98 }}
     >
       <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
         <IconComponent className="w-6 h-6 text-primary" />
       </div>
       <div>
         <h3 className="font-bold text-foreground">
           {language === 'vi' ? scenario.titleVi : scenario.titleEn}
         </h3>
         <p className="text-sm text-muted-foreground">
           {scenario.steps.length} {language === 'vi' ? 'bước' : 'steps'}
         </p>
       </div>
     </motion.button>
   );
 }