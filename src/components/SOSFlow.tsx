import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Users, HeartPulse, Loader2, CheckCircle, Radio, Package, User, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { createSOSReport } from '@/lib/db';
import { broadcastSOSToNearby } from '@/lib/mesh';
import { getCategoriesOrdered, getCasesByCategory, type SurvivalCase } from '@/lib/survivalData';
import { CategorySection } from '@/components/CategorySection';
import { CaseSteps } from '@/components/CaseSteps';
import { HealthStatusSelector } from '@/components/HealthStatusSelector';
import { NeedTags } from '@/components/NeedTags';
import type { HealthStatus, SOSReport, EmergencyProfile } from '@/types';

interface SOSFlowProps {
  onComplete: () => void;
  onCancel: () => void;
}

type FlowStep = 'scenario' | 'guide' | 'details' | 'sending' | 'sent';

export function SOSFlow({ onComplete, onCancel }: SOSFlowProps) {
  const { device, medicalProfile, language, refreshReports } = useApp();
  const { getLocation, isLoading: geoLoading } = useGeolocation();
  
  const [step, setStep] = useState<FlowStep>('scenario');
  const [selectedCase, setSelectedCase] = useState<SurvivalCase | null>(null);
  const [peopleCount, setPeopleCount] = useState(1);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('ok');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [otherNote, setOtherNote] = useState('');
  const [sentReport, setSentReport] = useState<SOSReport | null>(null);
  const [broadcastCount, setBroadcastCount] = useState(0);
  
  // Profile selector
  const [profiles, setProfiles] = useState<EmergencyProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flooded_emergency_profiles');
    if (saved) {
      const parsed: EmergencyProfile[] = JSON.parse(saved);
      setProfiles(parsed);
      // Default to first profile (primary)
      if (parsed.length > 0) setSelectedProfileId(parsed[0].id);
    }
  }, []);

  const categories = getCategoriesOrdered();

  const handleCaseSelect = (survivalCase: SurvivalCase) => {
    setSelectedCase(survivalCase);
    setStep('guide');
  };

  const handleConfirmFromGuide = () => {
    setStep('details');
  };

  const handleSendSOS = async () => {
    if (!device) return;

    setStep('sending');

    try {
      const location = await getLocation();
      
      // Build description from selected needs
      const needsDescription = selectedNeeds.join(', ') + (otherNote ? ` - ${otherNote}` : '');

      const report = await createSOSReport({
        deviceId: device.id,
        location: location || undefined,
        peopleCount,
        healthStatus,
        scenarioType: selectedCase?.id as any,
        description: needsDescription || undefined,
        medicalProfile: medicalProfile || undefined,
      });

      const { reachedCount } = await broadcastSOSToNearby(report);
      setBroadcastCount(reachedCount);

      setSentReport(report);
      await refreshReports();
      setStep('sent');
    } catch (error) {
      console.error('Failed to send SOS:', error);
      setStep('sent');
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-auto">
      <AnimatePresence mode="wait">
        {step === 'scenario' && (
          <motion.div
            key="scenario"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="min-h-screen"
          >
            <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
              <div className="flex items-center gap-4 p-4 safe-top">
                <button onClick={onCancel} className="p-2 rounded-lg bg-secondary">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-bold text-lg text-primary">
                    {language === 'vi' ? 'GỬI TÍN HIỆU SOS' : 'SEND SOS SIGNAL'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Chọn tình huống của bạn' : 'Select your situation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 pb-24">
              {categories.map((category, index) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  cases={getCasesByCategory(category.id)}
                  onSelectCase={handleCaseSelect}
                  defaultExpanded={index === 0}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === 'guide' && selectedCase && (
          <motion.div
            key="guide"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CaseSteps
              survivalCase={selectedCase}
              onBack={() => setStep('scenario')}
              showSOSButton={true}
              onConfirmSOS={handleConfirmFromGuide}
            />
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen"
          >
            <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
              <div className="flex items-center gap-4 p-4 safe-top">
                <button onClick={() => setStep('guide')} className="p-2 rounded-lg bg-secondary">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-bold text-lg text-primary">
                    {language === 'vi' ? 'CHI TIẾT SOS' : 'SOS DETAILS'}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {language === 'vi' ? 'Cung cấp thông tin' : 'Provide information'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-6 pb-32">
              {/* People Count */}
              <div className="tactical-card">
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Users className="w-4 h-4" />
                  {language === 'vi' ? 'Số người cần cứu' : 'Number of people'}
                </label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} 
                    className="w-12 h-12 rounded-xl bg-secondary text-xl font-bold active:scale-95 transition-transform"
                  >
                    -
                  </button>
                  <span className="text-3xl font-bold min-w-[60px] text-center">{peopleCount}</span>
                  <button 
                    onClick={() => setPeopleCount(Math.min(99, peopleCount + 1))} 
                    className="w-12 h-12 rounded-xl bg-secondary text-xl font-bold active:scale-95 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Health Status - Full Fill */}
              <div className="tactical-card">
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <HeartPulse className="w-4 h-4" />
                  {language === 'vi' ? 'Tình trạng sức khỏe' : 'Health status'}
                </label>
                <HealthStatusSelector value={healthStatus} onChange={setHealthStatus} />
              </div>

              {/* Location */}
              <div className="tactical-card">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">
                    {geoLoading 
                      ? (language === 'vi' ? 'Đang lấy vị trí...' : 'Getting location...') 
                      : (language === 'vi' ? 'Vị trí sẽ được gửi kèm' : 'Location will be included')}
                  </span>
                </div>
              </div>

              {/* Profile Selector */}
              {profiles.length > 0 && (
                <div className="tactical-card">
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <User className="w-4 h-4" />
                    {language === 'vi' ? 'Hồ sơ đính kèm' : 'Attached Profile'}
                  </label>
                  <div className="relative">
                    <button onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="w-full px-3 py-2.5 bg-secondary rounded-lg text-sm text-left flex items-center justify-between">
                      <span>{profiles.find(p => p.id === selectedProfileId)?.fullName || (language === 'vi' ? 'Chọn hồ sơ' : 'Select profile')}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showProfileDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-30 overflow-hidden">
                        {profiles.map(p => (
                          <button key={p.id} onClick={() => { setSelectedProfileId(p.id); setShowProfileDropdown(false); }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-secondary flex items-center gap-2 ${selectedProfileId === p.id ? 'bg-primary/10 font-medium' : ''}`}>
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span>{p.fullName}</span>
                            {p.bloodType && <span className="text-xs text-muted-foreground">🩸{p.bloodType}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedProfileId && (
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      {language === 'vi' ? 'Thông tin y tế của hồ sơ này sẽ được gửi kèm SOS' : 'Medical info from this profile will be included with SOS'}
                    </p>
                  )}
                </div>
              )}

              {/* Need Tags */}
              <div className="tactical-card">
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Package className="w-4 h-4" />
                  {language === 'vi' ? 'Nhu cầu cần hỗ trợ' : 'Support needs'}
                </label>
                <NeedTags 
                  selectedTags={selectedNeeds}
                  onTagsChange={setSelectedNeeds}
                  otherNote={otherNote}
                  onOtherNoteChange={setOtherNote}
                />
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border safe-bottom">
              <motion.button 
                onClick={handleSendSOS} 
                className="btn-emergency-glow w-full py-5 text-xl" 
                whileTap={{ scale: 0.98 }}
              >
                {language === 'vi' ? 'GỬI SOS NGAY' : 'SEND SOS NOW'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 'sending' && (
          <motion.div 
            key="sending" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="min-h-screen flex flex-col items-center justify-center p-8"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold mt-6 text-center">
              {language === 'vi' ? 'Đang gửi tín hiệu SOS...' : 'Sending SOS signal...'}
            </h2>
          </motion.div>
        )}

        {step === 'sent' && (
          <motion.div 
            key="sent" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="min-h-screen flex flex-col items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-success" />
            </motion.div>
            <h2 className="text-2xl font-bold mt-6 text-center text-success">
              {language === 'vi' ? 'ĐÃ GỬI SOS' : 'SOS SENT'}
            </h2>
            <p className="text-muted-foreground mt-2 text-center">
              {language === 'vi' ? 'Tín hiệu đã được lưu và phát đi' : 'Signal saved and broadcast'}
            </p>
            {broadcastCount > 0 && (
              <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-accent/10 rounded-full">
                <Radio className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-medium">
                  {language === 'vi' 
                    ? `Đã gửi đến ${broadcastCount} thiết bị lân cận` 
                    : `Sent to ${broadcastCount} nearby devices`}
                </span>
              </div>
            )}
            <motion.button 
              onClick={onComplete} 
              className="mt-8 px-8 py-4 bg-secondary rounded-xl font-bold" 
              whileTap={{ scale: 0.95 }}
            >
              {language === 'vi' ? 'Xong' : 'Done'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
