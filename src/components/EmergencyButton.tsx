import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface EmergencyButtonProps {
  onClick: () => void;
}

export function EmergencyButton({ onClick }: EmergencyButtonProps) {
  const { language } = useApp();

  return (
    <motion.button
      onClick={onClick}
      className="btn-emergency-glow w-full h-36 flex flex-col items-center justify-center gap-2 no-select relative z-10"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <AlertTriangle className="w-14 h-14" />
      </motion.div>
      <span className="text-2xl font-black tracking-widest leading-tight">
        {language === 'vi' ? 'KHẨN CẤP' : 'EMERGENCY'}
      </span>
      <span className="text-sm opacity-80 font-medium -mt-0.5">
        {language === 'vi' ? 'Nhấn để gửi SOS' : 'Tap to send SOS'}
      </span>
    </motion.button>
  );
}
