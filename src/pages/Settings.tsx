import { useState } from 'react';
import { motion } from 'framer-motion';
import { BatteryLow, Globe, RefreshCw, Database, Info, Shield, Volume2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Settings() {
  const { language, settings, updateAppSettings, device, pendingCount, triggerSync, isOnline } = useApp();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await triggerSync();
    if (result.syncedCount > 0) {
      toast.success(language === 'vi' ? `Đã đồng bộ ${result.syncedCount} báo cáo` : `Synced ${result.syncedCount} reports`);
    } else if (!result.success) {
      toast.error(language === 'vi' ? 'Lỗi đồng bộ' : 'Sync failed');
    } else {
      toast.info(language === 'vi' ? 'Không có gì để đồng bộ' : 'Nothing to sync');
    }
    setIsSyncing(false);
  };

  const handleRescueToggle = () => {
    const newVal = !settings?.rescueMode;
    if (newVal) {
      updateAppSettings({ rescueMode: true });
      navigate('/rescue-login');
    } else {
      updateAppSettings({ rescueMode: false });
      toast.info(language === 'vi' ? 'Đã tắt chế độ cứu hộ' : 'Rescue mode disabled');
    }
  };

  const ToggleButton = ({ checked, onToggle, activeColor = 'bg-primary' }: { checked: boolean; onToggle: () => void; activeColor?: string }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${checked ? activeColor : 'bg-muted'}`}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/more" className="p-2 rounded-lg bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{language === 'vi' ? 'Cài đặt' : 'Settings'}</h1>
            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Tùy chỉnh ứng dụng' : 'App preferences'}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Battery Saver */}
        <div className="tactical-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <BatteryLow className="w-5 h-5 text-warning shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">{language === 'vi' ? 'Tiết kiệm pin' : 'Battery Saver'}</p>
                <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Giảm đồng bộ nền, tắt animation, ưu tiên tĩnh' : 'Reduce sync, animations, prioritize static UI'}</p>
              </div>
            </div>
            <ToggleButton checked={!!settings?.lowPowerMode} onToggle={() => updateAppSettings({ lowPowerMode: !settings?.lowPowerMode })} activeColor="bg-warning" />
          </div>
          {settings?.lowPowerMode && (
            <p className="text-xs text-warning mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {language === 'vi' ? 'Đang tiết kiệm pin: giảm refresh, tắt animation' : 'Battery saver active'}
            </p>
          )}
        </div>

        {/* Language */}
        <div className="tactical-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-accent shrink-0" />
              <div>
                <p className="font-medium">{language === 'vi' ? 'Ngôn ngữ' : 'Language'}</p>
                <p className="text-xs text-muted-foreground">Tiếng Việt / English</p>
              </div>
            </div>
            <div className="flex rounded-lg overflow-hidden border border-border">
              <button onClick={() => updateAppSettings({ language: 'vi' })} className={`px-3 py-1.5 text-sm font-medium ${language === 'vi' ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>VI</button>
              <button onClick={() => updateAppSettings({ language: 'en' })} className={`px-3 py-1.5 text-sm font-medium ${language === 'en' ? 'bg-accent text-accent-foreground' : 'bg-secondary'}`}>EN</button>
            </div>
          </div>
        </div>

        {/* TTS */}
        <div className="tactical-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Volume2 className="w-5 h-5 text-success shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">{language === 'vi' ? 'Đọc to hướng dẫn' : 'Read Aloud (TTS)'}</p>
                <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Bật nút đọc từng bước trong hướng dẫn' : 'Show read-aloud button on guide steps'}</p>
              </div>
            </div>
            <ToggleButton checked={!!settings?.ttsEnabled} onToggle={() => updateAppSettings({ ttsEnabled: !settings?.ttsEnabled })} activeColor="bg-success" />
          </div>
          {settings?.ttsEnabled && (
            <p className="text-xs text-success mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {language === 'vi' ? 'Nút 🔊 sẽ hiện ở mỗi bước hướng dẫn' : 'Speaker button will show on each guide step'}
            </p>
          )}
        </div>

        {/* Rescue Mode */}
        <div className="tactical-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="font-medium">{language === 'vi' ? 'Chế độ hỗ trợ cứu hộ' : 'Rescue Support Mode'}</p>
                <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Dashboard dành cho đội cứu hộ đã được duyệt' : 'Dashboard for approved rescue teams'}</p>
              </div>
            </div>
            <ToggleButton checked={!!settings?.rescueMode} onToggle={handleRescueToggle} />
          </div>
          {settings?.rescueMode && (
            <>
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {language === 'vi' ? 'Đang hoạt động' : 'Active'}
              </p>
              <Link to="/rescue-login" className="mt-2 block w-full py-2 bg-primary/20 text-primary rounded-lg text-center text-sm font-bold">
                {language === 'vi' ? 'Vào Dashboard Hỗ trợ cứu hộ →' : 'Go to Rescue Dashboard →'}
              </Link>
              <Link to="/command-login" className="mt-2 block w-full py-2 bg-destructive/20 text-destructive rounded-lg text-center text-sm font-bold">
                {language === 'vi' ? '🔒 Chuyển sang COMMAND MODE →' : '🔒 Switch to COMMAND MODE →'}
              </Link>
            </>
          )}
        </div>

        {/* Sync */}
        <div className="tactical-card">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="w-5 h-5 text-success shrink-0" />
            <div>
              <p className="font-medium">{language === 'vi' ? 'Đồng bộ dữ liệu' : 'Data Sync'}</p>
              <p className="text-xs text-muted-foreground">
                {isOnline ? (language === 'vi' ? '🟢 Có mạng' : '🟢 Online') : (language === 'vi' ? '🔴 Ngoại tuyến' : '🔴 Offline')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div>
              <p className="text-sm">{language === 'vi' ? 'Báo cáo chờ gửi' : 'Pending reports'}</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <button onClick={handleSync} disabled={isSyncing || !isOnline || pendingCount === 0}
              className="px-4 py-2 bg-success text-success-foreground rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {language === 'vi' ? 'Đồng bộ' : 'Sync'}
            </button>
          </div>
          {!isOnline && pendingCount > 0 && (
            <p className="text-xs text-warning mt-2">{language === 'vi' ? 'Sẽ tự đồng bộ khi có mạng trở lại' : 'Will auto-sync when back online'}</p>
          )}
        </div>

        {/* Device Info */}
        <div className="tactical-card">
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 shrink-0" />
            <p className="font-medium">{language === 'vi' ? 'Thông tin thiết bị' : 'Device Info'}</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Device ID</span><span className="font-mono">{device?.id.slice(0, 16)}...</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{language === 'vi' ? 'Tạo lúc' : 'Created'}</span><span className="font-mono">{device ? new Date(device.createdAt).toLocaleDateString() : '-'}</span></div>
          </div>
        </div>

        {/* About */}
        <div className="tactical-card">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-5 h-5 text-accent shrink-0" />
            <p className="font-medium">FLOODED</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'vi' ? 'Hệ thống cứu hộ & sinh tồn ngoại tuyến. Hoạt động khi mất điện, mất mạng.' : 'Offline-first survival & rescue system.'}
          </p>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Version 1.0.0 • PWA Ready</p>
          </div>
        </div>
      </main>
    </div>
  );
}
