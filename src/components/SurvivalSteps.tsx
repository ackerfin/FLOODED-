 import { motion } from 'framer-motion';
 import { AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
 import { useApp } from '@/contexts/AppContext';
 import type { SurvivalScenario } from '@/types';
 
 interface SurvivalStepsProps {
   scenario: SurvivalScenario;
   onBack: () => void;
 }
 
 export function SurvivalSteps({ scenario, onBack }: SurvivalStepsProps) {
   const { language } = useApp();
 
   return (
     <div className="min-h-screen bg-background pb-24">
       {/* Header */}
       <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
         <div className="flex items-center gap-4 p-4">
           <button
             onClick={onBack}
             className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
           >
             <ArrowLeft className="w-5 h-5" />
           </button>
           <div>
             <h1 className="font-bold text-lg">
               {language === 'vi' ? scenario.titleVi : scenario.titleEn}
             </h1>
             <p className="text-sm text-muted-foreground">
               {language === 'vi' ? 'Làm theo từng bước' : 'Follow each step'}
             </p>
           </div>
         </div>
       </div>
 
       <div className="p-4 space-y-4">
         {/* Steps */}
         {scenario.steps.map((step, index) => (
           <motion.div
             key={index}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.1 }}
             className={`tactical-card ${step.critical ? 'border-primary/50 bg-primary/5' : ''}`}
           >
             <div className="flex items-start gap-3">
               <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                 step.critical ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
               }`}>
                 {index + 1}
               </div>
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-mono text-muted-foreground uppercase">
                     {step.timeframe}
                   </span>
                   {step.critical && (
                     <span className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" />
                       {language === 'vi' ? 'Quan trọng' : 'Critical'}
                     </span>
                   )}
                 </div>
                 <p className="text-foreground font-medium">
                   {language === 'vi' ? step.actionVi : step.actionEn}
                 </p>
               </div>
             </div>
           </motion.div>
         ))}
 
         {/* Do Not */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: scenario.steps.length * 0.1 }}
           className="tactical-card border-destructive/30 bg-destructive/5"
         >
           <h3 className="font-bold text-destructive mb-3 flex items-center gap-2">
             <XCircle className="w-5 h-5" />
             {language === 'vi' ? 'KHÔNG LÀM' : 'DO NOT'}
           </h3>
           <ul className="space-y-2">
             {scenario.doNot.map((item, index) => (
               <li key={index} className="text-sm text-foreground flex items-start gap-2">
                 <span className="text-destructive mt-0.5">•</span>
                 {item}
               </li>
             ))}
           </ul>
         </motion.div>
       </div>
     </div>
   );
 }