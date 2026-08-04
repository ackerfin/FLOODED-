import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import type { HealthStatus } from '@/types';

interface HealthStatusSelectorProps {
  value: HealthStatus;
  onChange: (status: HealthStatus) => void;
}

const healthOptions: { 
  value: HealthStatus; 
  labelVi: string; 
  labelEn: string; 
  fillClass: string;
  defaultClass: string;
}[] = [
  { 
    value: 'ok', 
    labelVi: 'AN TOÀN', 
    labelEn: 'SAFE',
    fillClass: 'status-ok-fill',
    defaultClass: 'border-[hsl(var(--status-ok))] text-[hsl(var(--status-ok))]',
  },
  { 
    value: 'injured', 
    labelVi: 'BỊ THƯƠNG', 
    labelEn: 'INJURED',
    fillClass: 'status-injured-fill',
    defaultClass: 'border-[hsl(var(--status-injured))] text-[hsl(var(--status-injured))]',
  },
  { 
    value: 'critical', 
    labelVi: 'NGUY KỊCH', 
    labelEn: 'CRITICAL',
    fillClass: 'status-critical-fill',
    defaultClass: 'border-[hsl(var(--status-critical))] text-[hsl(var(--status-critical))]',
  },
  { 
    value: 'unconscious', 
    labelVi: 'BẤT TỈNH', 
    labelEn: 'UNCONSCIOUS',
    fillClass: 'status-unconscious-fill',
    defaultClass: 'border-muted-foreground text-muted-foreground',
  },
];

export function HealthStatusSelector({ value, onChange }: HealthStatusSelectorProps) {
  const { language } = useApp();

  return (
    <div className="grid grid-cols-2 gap-3">
      {healthOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'health-status-btn p-4 text-base border-2',
              isSelected ? option.fillClass : `bg-transparent ${option.defaultClass}`
            )}
          >
            {language === 'vi' ? option.labelVi : option.labelEn}
          </button>
        );
      })}
    </div>
  );
}
