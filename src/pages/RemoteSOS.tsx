import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Phone, MapPin, Send, User, AlertTriangle,
  Copy, Info, Loader2, CheckCircle, Home
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Link } from 'react-router-dom';
import { NeedTags } from '@/components/NeedTags';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { provinces } from '@/lib/provinces';

const urgencyLevels = [
  { id: 'low', labelVi: 'Thấp', labelEn: 'Low', color: 'bg-accent' },
  { id: 'medium', labelVi: 'Trung bình', labelEn: 'Medium', color: 'bg-warning' },
  { id: 'high', labelVi: 'Cao', labelEn: 'High', color: 'bg-[hsl(var(--status-injured))]' },
  { id: 'critical', labelVi: 'Nguy kịch', labelEn: 'Critical', color: 'bg-destructive' },
];

type PageView = 'form' | 'success';

export default function RemoteSOS() {
  const { language, isOnline } = useApp();
  const { getLocation, isLoading: geoLoading } = useGeolocation();
  const [personName, setPersonName] = useState('');
  const [personPhone, setPersonPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [urgency, setUrgency] = useState('medium');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [victimLocation, setVictimLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [pageView, setPageView] = useState<PageView>('form');
  const [submittedReportId, setSubmittedReportId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxNoteLength = 120;
  const filteredProvinces = provinces.filter(p => p.toLowerCase().includes(provinceSearch.toLowerCase()));

  const handleGetLocation = async () => {
    const loc = await getLocation();
    if (loc) {
      setVictimLocation({ lat: loc.latitude, lng: loc.longitude });
      toast.success(language === 'vi' ? 'Đã lấy vị trí' : 'Location obtained');
    } else {
      toast.error(language === 'vi' ? 'Không lấy được vị trí' : 'Cannot get location');
    }
  };

  const generateReportText = () => {
    const urgencyLabel = urgencyLevels.find(u => u.id === urgency);
    const needs = selectedNeeds.join(', ');
    const locationText = victimLocation ? `\n📍 Tọa độ: ${victimLocation.lat.toFixed(5)}, ${victimLocation.lng.toFixed(5)}` : '';
    
    return `🆘 BÁO CỨU HỘ
━━━━━━━━━━━━━━
👤 Người cần cứu: ${personName || 'Chưa rõ'}
📞 SĐT: ${personPhone || 'Chưa rõ'}
📍 Địa chỉ: ${address || 'Chưa rõ'}
🏛️ Tỉnh/TP: ${province || 'Chưa chọn'}${locationText}
⚠️ Mức độ: ${urgencyLabel?.labelVi || 'Trung bình'}
📋 Nhu cầu: ${needs || 'Chưa chọn'}
📝 Ghi chú: ${note || 'Không có'}
━━━━━━━━━━━━━━
Gửi từ app FLOODED
Thời gian: ${new Date().toLocaleString('vi-VN')}`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    toast.success(language === 'vi' ? 'Đã sao chép báo cáo' : 'Report copied');
  };

  const patchLocalSyncStatus = (reportId: string, status: string) => {
    const list = JSON.parse(localStorage.getItem('flooded_remote_sos') || '[]');
    const updated = list.map((r: any) => (r.id === reportId ? { ...r, syncStatus: status } : r));
    localStorage.setItem('flooded_remote_sos', JSON.stringify(updated));
  };

  const handleSubmit = async () => {
    if (!personName.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng nhập tên người cần cứu' : 'Please enter person name');
      return;
    }
    if (!province) {
      toast.error(language === 'vi' ? 'Vui lòng chọn tỉnh/thành phố' : 'Please select province');
      return;
    }

    const reportId = uuidv4();
    const report = {
      id: reportId, personName, personPhone, address, province, urgency,
      needs: selectedNeeds, note, createdAt: Date.now(),
      location: victimLocation,
      syncStatus: 'pending' as string,
    };

    // Store-before-ACK: luon luu local truoc, du co mang hay khong
    const existing = JSON.parse(localStorage.getItem('flooded_remote_sos') || '[]');
    localStorage.setItem('flooded_remote_sos', JSON.stringify([...existing, report]));
    setSubmittedReportId(reportId);

    if (!isOnline) {
      setShowExport(true);
      setPageView('success');
      return;
    }

    // Co "isOnline" khong co nghia server chac chan nhan duoc - phai thu gui that
    setIsSubmitting(true);
    const { error } = await supabase.from('remote_sos_reports').insert({
      id: reportId,
      person_name: personName,
      person_phone: personPhone || null,
      address: address || null,
      province,
      urgency,
      needs: selectedNeeds,
      note: note || null,
      location_lat: victimLocation?.lat ?? null,
      location_lng: victimLocation?.lng ?? null,
      created_at: report.createdAt,
    });
    setIsSubmitting(false);

    if (error) {
      // Bao co mang nhung gui that su fail - khong duoc hien banner "da gui truc tuyen"
      console.error('[RemoteSOS] Loi gui Supabase:', error.message);
      patchLocalSyncStatus(reportId, 'offline');
      toast.error(language === 'vi'
        ? 'Không gửi được lên hệ thống — đã lưu để sao chép gửi tay'
        : 'Could not reach server — saved for manual copy');
      setShowExport(true);
      setPageView('success');
      return;
    }

    patchLocalSyncStatus(reportId, 'synced');
    setShowExport(false);
    setPageView('success');
  };

  // ===== SUCCESS SCREEN =====
  if (pageView === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }} className="mb-6">
          <CheckCircle className="w-24 h-24 text-[hsl(var(--success))]" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-2xl font-bold text-[hsl(var(--success))] text-center mb-2">
          {language === 'vi' ? 'ĐÃ GỬI BÁO CÁO THÀNH CÔNG' : 'REPORT SENT SUCCESSFULLY'}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-center mb-4">
          {language === 'vi' ? 'Báo cáo cứu hộ cho người thân đã được ghi nhận' : 'Remote rescue report has been recorded'}
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full max-w-sm space-y-3">
          <div className="tactical-card p-4 space-y-2 text-center">
            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Mã báo cáo' : 'Report ID'}</p>
            <p className="font-mono font-bold text-primary">{submittedReportId.slice(0, 12).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{language === 'vi' ? `Người cần cứu: ${personName}` : `Person: ${personName}`}</p>
            <p className="text-xs text-muted-foreground">{province}</p>
          </div>

          <div className={`text-center text-xs py-2 rounded-lg ${!showExport ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' : 'bg-warning/20 text-warning'}`}>
            {!showExport
              ? (language === 'vi' ? '🟢 Đã gửi trực tuyến' : '🟢 Sent online')
              : (language === 'vi' ? '🟡 Chưa gửi được — Hãy sao chép gửi qua Zalo/SMS' : '🟡 Not sent — Copy and send via messaging')}
          </div>

          {showExport && (
            <div className="tactical-card space-y-3 p-4">
              <pre className="p-3 bg-secondary rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">{generateReportText()}</pre>
              <button onClick={handleCopyReport} className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-medium flex items-center justify-center gap-2">
                <Copy className="w-5 h-5" />{language === 'vi' ? 'SAO CHÉP BÁO CÁO' : 'COPY REPORT'}
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => {
              setPageView('form');
              setPersonName(''); setPersonPhone(''); setAddress(''); setProvince(''); setProvinceSearch('');
              setUrgency('medium'); setSelectedNeeds([]); setNote(''); setVictimLocation(null); setShowExport(false);
            }} className="flex-1 py-3 bg-secondary rounded-xl font-medium text-sm">
              {language === 'vi' ? 'Báo thêm người' : 'Report Another'}
            </button>
            <Link to="/" className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-1">
              <Home className="w-4 h-4" />{language === 'vi' ? 'Về trang chủ' : 'Go Home'}
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== FORM =====
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/more" className="p-2 rounded-lg bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{language === 'vi' ? 'Báo SOS hộ người thân' : 'Remote SOS for Family'}</h1>
            <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Gửi từ nơi an toàn' : 'Send from safe location'}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-sm text-warning">
              {language === 'vi'
                ? 'Đây là báo cáo hỗ trợ, không thay thế cứu hộ chính thức (113/114/115).'
                : 'This is a support report, not a replacement for official rescue (113/114/115).'}
            </p>
          </div>
        </div>

        {/* Person Info */}
        <div className="tactical-card space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <User className="w-4 h-4 text-primary" />
            {language === 'vi' ? 'Thông tin người cần cứu' : 'Person Information'}
          </div>
          <input type="text" value={personName} onChange={(e) => setPersonName(e.target.value)}
            placeholder={language === 'vi' ? 'Họ tên *' : 'Full name *'}
            className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="tel" value={personPhone} onChange={(e) => setPersonPhone(e.target.value)}
            placeholder={language === 'vi' ? 'Số điện thoại' : 'Phone number'}
            className="w-full px-3 py-2 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* Address + Province + Location */}
        <div className="tactical-card space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-destructive" />
            {language === 'vi' ? 'Địa chỉ / vị trí nạn nhân' : 'Victim address / location'}
          </div>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder={language === 'vi' ? 'Địa chỉ chi tiết hoặc mô tả vị trí...' : 'Detailed address or location description...'}
            className="w-full h-16 px-3 py-2 bg-secondary rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />

          {/* Province dropdown */}
          <div className="relative">
            <input type="text" value={provinceSearch} onChange={(e) => { setProvinceSearch(e.target.value); setShowProvinceDropdown(true); }} onFocus={() => setShowProvinceDropdown(true)}
              placeholder={language === 'vi' ? 'Tỉnh/Thành phố * (bắt buộc)' : 'Province * (required)'}
              className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            {showProvinceDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto z-30">
                {filteredProvinces.slice(0, 15).map(p => (
                  <button key={p} onClick={() => { setProvince(p); setProvinceSearch(p); setShowProvinceDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary ${province === p ? 'bg-primary/10 font-medium' : ''}`}>{p}</button>
                ))}
              </div>
            )}
          </div>

          {/* Get Location button */}
          <div className="flex items-center gap-2">
            <button onClick={handleGetLocation} disabled={geoLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent/20 text-accent rounded-lg text-sm font-medium disabled:opacity-50">
              {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {language === 'vi' ? 'Lấy vị trí GPS' : 'Get GPS Location'}
            </button>
            {victimLocation && (
              <span className="text-xs font-mono text-muted-foreground">
                {victimLocation.lat.toFixed(4)}, {victimLocation.lng.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        {/* Urgency */}
        <div className="tactical-card space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 text-warning" />
            {language === 'vi' ? 'Mức độ khẩn cấp' : 'Urgency Level'}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {urgencyLevels.map((level) => (
              <button key={level.id} onClick={() => setUrgency(level.id)}
                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${urgency === level.id ? `${level.color} text-white` : 'bg-secondary text-muted-foreground'}`}>
                {language === 'vi' ? level.labelVi : level.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Needs */}
        <div className="tactical-card">
          <NeedTags selectedTags={selectedNeeds} onTagsChange={setSelectedNeeds} otherNote="" onOtherNoteChange={() => {}} />
        </div>

        {/* Note */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">{language === 'vi' ? 'Ghi chú ngắn' : 'Short note'}</label>
          <div className="relative">
            <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, maxNoteLength))}
              placeholder={language === 'vi' ? 'Mô tả ngắn tình huống...' : 'Brief description...'}
              className="w-full h-16 px-3 py-2 bg-secondary rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
            <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">{note.length}/{maxNoteLength}</span>
          </div>
        </div>

        {/* Submit */}
        <motion.button onClick={handleSubmit} disabled={isSubmitting} whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isSubmitting
            ? (language === 'vi' ? 'ĐANG GỬI...' : 'SENDING...')
            : (isOnline ? (language === 'vi' ? 'GỬI BÁO CÁO' : 'SEND REPORT') : (language === 'vi' ? 'TẠO BÁO CÁO' : 'CREATE REPORT'))}
        </motion.button>

        <div className={`text-center text-xs py-2 rounded-lg ${isOnline ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' : 'bg-warning/20 text-warning'}`}>
          {isOnline
            ? (language === 'vi' ? '🟢 Có mạng - Báo cáo sẽ được gửi ngay' : '🟢 Online - Report will be sent immediately')
            : (language === 'vi' ? '🟡 Ngoại tuyến - Sao chép gửi qua Zalo/SMS' : '🟡 Offline - Copy and send via messaging')}
        </div>
      </main>
    </div>
  );
}