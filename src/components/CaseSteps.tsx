import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, ArrowLeft, Info, Volume2, VolumeX, Square } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import type { SurvivalCase } from '@/lib/survivalData';

interface CaseStepsProps {
  survivalCase: SurvivalCase;
  onBack: () => void;
  showSOSButton?: boolean;
  onConfirmSOS?: () => void;
}

export function CaseSteps({ survivalCase, onBack, showSOSButton, onConfirmSOS }: CaseStepsProps) {
  const { language, settings } = useApp();
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);

  const speak = (text: string, index: number) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4 safe-top">
          <button onClick={onBack} className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate">
              {language === 'vi' ? survivalCase.titleVi : survivalCase.titleEn}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === 'vi' ? 'Làm theo từng bước' : 'Follow each step'}
            </p>
          </div>
          {settings?.ttsEnabled && 'speechSynthesis' in window && (
            speakingIndex !== null ? (
              <button onClick={stopSpeaking} className="p-2 rounded-lg bg-destructive/20 text-destructive">
                <Square className="w-5 h-5" />
              </button>
            ) : null
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {survivalCase.steps.map((step, index) => (
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
                  <span className="text-xs font-mono text-muted-foreground uppercase">{step.timeframe}</span>
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
              {/* TTS button per step */}
              {settings?.ttsEnabled && 'speechSynthesis' in window && (
                <button
                  onClick={() => speakingIndex === index ? stopSpeaking() : speak(language === 'vi' ? step.actionVi : step.actionEn, index)}
                  className={`flex-shrink-0 p-1.5 rounded-lg ${speakingIndex === index ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}
                >
                  {speakingIndex === index ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {/* Do Not */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: survivalCase.steps.length * 0.1 }}
          className="tactical-card border-destructive/30 bg-destructive/5">
          <h3 className="font-bold text-destructive mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {language === 'vi' ? 'KHÔNG LÀM' : 'DO NOT'}
          </h3>
          <ul className="space-y-2">
            {survivalCase.donts.map((item, index) => (
              <li key={index} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>{item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* SOS When */}
        {survivalCase.sosWhen && survivalCase.sosWhen.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (survivalCase.steps.length + 1) * 0.1 }}
            className="tactical-card border-accent/30 bg-accent/5">
            <h3 className="font-bold text-accent mb-3 flex items-center gap-2">
              <Info className="w-5 h-5" />
              {language === 'vi' ? 'GỌI CỨU HỘ KHI' : 'CALL FOR RESCUE WHEN'}
            </h3>
            <ul className="space-y-2">
              {survivalCase.sosWhen.map((item, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>{item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (survivalCase.steps.length + 2) * 0.1 }} className="text-center py-4">
          <p className="text-xs text-muted-foreground italic">
            {language === 'vi' 
              ? 'Hướng dẫn chỉ nhằm ổn định tạm thời. Luôn tìm kiếm hỗ trợ y tế chuyên nghiệp.'
              : 'Guide for temporary stabilization only. Always seek professional medical help.'}
          </p>
        </motion.div>
      </div>

      {showSOSButton && onConfirmSOS && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border safe-bottom">
          <motion.button onClick={onConfirmSOS} className="btn-emergency w-full py-5 flex items-center justify-center gap-3" whileTap={{ scale: 0.98 }}>
            <span className="text-lg font-bold">{language === 'vi' ? 'XÁC NHẬN GỬI SOS' : 'CONFIRM SEND SOS'}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
