import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function AlarmButton() {
  const { language } = useApp();
  const [isOn, setIsOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
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
    gainRef.current = gain;

    // Siren sweep: alternate between 600Hz and 1200Hz
    let high = false;
    intervalRef.current = window.setInterval(() => {
      const now = ctx.currentTime;
      osc.frequency.linearRampToValueAtTime(high ? 600 : 1200, now + 0.5);
      high = !high;
    }, 500);
  }, []);

  const stopSiren = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    try {
      oscRef.current?.stop();
    } catch {}
    try {
      audioCtxRef.current?.close();
    } catch {}
    oscRef.current = null;
    audioCtxRef.current = null;
    gainRef.current = null;
  }, []);

  const toggle = () => {
    if (isOn) {
      stopSiren();
      setIsOn(false);
    } else {
      startSiren();
      setIsOn(true);
    }
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.95 }}
      className={`w-full rounded-2xl py-5 flex flex-col items-center justify-center gap-2 font-black text-xl tracking-wider transition-colors border-4 ${
        isOn
          ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse'
          : 'bg-warning/20 text-warning border-warning/50'
      }`}
    >
      {isOn ? (
        <Volume2 className="w-10 h-10" />
      ) : (
        <VolumeX className="w-10 h-10" />
      )}
      <span>
        {isOn
          ? language === 'vi' ? 'TẮT CÒI' : 'STOP SIREN'
          : language === 'vi' ? 'CÒI BÁO ĐỘNG' : 'ALARM / SIREN'}
      </span>
      <span className="text-xs font-medium opacity-70">
        {isOn
          ? language === 'vi' ? 'Đang phát — nhấn để tắt' : 'Playing — tap to stop'
          : language === 'vi' ? 'Nhấn để bật còi' : 'Tap to activate'}
      </span>
    </motion.button>
  );
}
