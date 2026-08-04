import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Compass, ClipboardList, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickToolsProps {
  onQuoteClick?: () => void;
}

export function QuickTools({ onQuoteClick }: QuickToolsProps) {
  const { language } = useApp();
  const [sirenOn, setSirenOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startSiren = useCallback(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 600;
    gain.gain.value = 0.7;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    audioCtxRef.current = ctx;
    oscRef.current = osc;
    let high = false;
    intervalRef.current = window.setInterval(() => {
      osc.frequency.linearRampToValueAtTime(high ? 600 : 1200, ctx.currentTime + 0.5);
      high = !high;
    }, 500);
  }, []);

  const stopSiren = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    try { oscRef.current?.stop(); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    oscRef.current = null;
    audioCtxRef.current = null;
  }, []);

  const toggleSiren = () => {
    if (sirenOn) { stopSiren(); setSirenOn(false); }
    else { startSiren(); setSirenOn(true); }
  };

  const tools = [
    {
      icon: Sparkles,
      labelVi: 'Câu an ủi',
      labelEn: 'Support Quote',
      onClick: onQuoteClick,
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
    },
    {
      icon: ClipboardList,
      labelVi: 'Checklist',
      labelEn: 'Checklist',
      to: '/checklist',
      color: 'text-accent',
      bgColor: 'bg-accent/20',
    },
    {
      icon: Compass,
      labelVi: 'La bàn',
      labelEn: 'Compass',
      to: '/compass',
      color: 'text-success',
      bgColor: 'bg-success/20',
    },
    {
      icon: sirenOn ? Volume2 : VolumeX,
      labelVi: sirenOn ? 'TẮT CÒI' : 'Còi báo động',
      labelEn: sirenOn ? 'STOP SIREN' : 'Alarm',
      onClick: toggleSiren,
      color: sirenOn ? 'text-destructive' : 'text-warning',
      bgColor: sirenOn ? 'bg-destructive/20 animate-pulse' : 'bg-warning/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {tools.map((tool, index) => {
        const content = (
          <motion.div
            className="tactical-card flex flex-col items-center justify-center py-5 cursor-pointer transition-colors min-h-[100px]"
            whileTap={{ scale: 0.95 }}
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2', tool.bgColor)}>
              <tool.icon className={cn('w-6 h-6', tool.color)} />
            </div>
            <span className="text-sm font-medium text-center">
              {language === 'vi' ? tool.labelVi : tool.labelEn}
            </span>
          </motion.div>
        );

        if (tool.to) {
          return <Link key={index} to={tool.to}>{content}</Link>;
        }

        if (tool.onClick) {
          return <div key={index} onClick={tool.onClick}>{content}</div>;
        }

        return <div key={index}>{content}</div>;
      })}
    </div>
  );
}
