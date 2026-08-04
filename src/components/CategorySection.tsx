import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 
  Zap, Route, Building, Droplets, HeartPulse, Wind, Snowflake, Users, HelpCircle,
  LucideIcon
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CaseCard } from './CaseCard';
import type { SurvivalCategory, SurvivalCase } from '@/lib/survivalData';

const categoryIconMap: Record<string, LucideIcon> = {
  Zap,
  Route,
  Building,
  Droplets,
  HeartPulse,
  Wind,
  Snowflake,
  Users,
};

interface CategorySectionProps {
  category: SurvivalCategory;
  cases: SurvivalCase[];
  onSelectCase: (survivalCase: SurvivalCase) => void;
  defaultExpanded?: boolean;
}

export function CategorySection({ 
  category, 
  cases, 
  onSelectCase,
  defaultExpanded = true 
}: CategorySectionProps) {
  const { language } = useApp();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const IconComponent = categoryIconMap[category.iconName] || HelpCircle;

  return (
    <div className="mb-4">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1 text-left">
          <h2 className="font-bold text-foreground">
            {language === 'vi' ? category.titleVi : category.titleEn}
          </h2>
          {category.descriptionVi && (
            <p className="text-xs text-muted-foreground">
              {language === 'vi' ? category.descriptionVi : category.descriptionEn}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {cases.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Cases List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pl-2 space-y-2">
              {cases.map((survivalCase) => (
                <CaseCard
                  key={survivalCase.id}
                  survivalCase={survivalCase}
                  onClick={() => onSelectCase(survivalCase)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
