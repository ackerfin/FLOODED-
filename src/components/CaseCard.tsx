import { motion } from 'framer-motion';
import { 
  Home, HeartPulse, UserX, Car, Building, Zap, Droplets, Ambulance, HelpCircle,
  Wind, Waves, Route, Snowflake, Users, Baby, Flame, Cable, PlugZap, CloudOff,
  Bike, Mountain, CircleOff, ArrowDown, Lock, Droplet, Activity, Bone, Cross,
  AlertOctagon, AlertTriangle, Cloud, HeartOff, TreeDeciduous, Thermometer,
  Battery, User, Pill, Heart, Accessibility, AlertCircle, Shirt, Bug, FlaskConical,
  Refrigerator,
  LucideIcon
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { SurvivalCase } from '@/lib/survivalData';

const iconMap: Record<string, LucideIcon> = {
  Home,
  HeartPulse,
  UserX,
  Car,
  Building,
  Zap,
  Droplets,
  Ambulance,
  Wind,
  Waves,
  Route,
  Snowflake,
  Users,
  Baby,
  Flame,
  Cable,
  PlugZap,
  CloudOff,
  Bike,
  Mountain,
  CircleOff,
  ArrowDown,
  Lock,
  Droplet,
  Activity,
  Bone,
  Cross,
  AlertOctagon,
  AlertTriangle,
  Cloud,
  HeartOff,
  TreeDeciduous,
  Thermometer,
  Battery,
  User,
  Pill,
  Heart,
  Accessibility,
  AlertCircle,
  Shirt,
  Bug,
  FlaskConical,
  Refrigerator,
};

interface CaseCardProps {
  survivalCase: SurvivalCase;
  onClick: () => void;
}

export function CaseCard({ survivalCase, onClick }: CaseCardProps) {
  const { language } = useApp();
  
  const IconComponent = iconMap[survivalCase.iconName] || HelpCircle;

  return (
    <motion.button
      onClick={onClick}
      className="tactical-card w-full text-left flex items-center gap-4 p-4"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground truncate">
          {language === 'vi' ? survivalCase.titleVi : survivalCase.titleEn}
        </h3>
        <p className="text-sm text-muted-foreground">
          {survivalCase.steps.length} {language === 'vi' ? 'bước' : 'steps'}
        </p>
      </div>
    </motion.button>
  );
}
