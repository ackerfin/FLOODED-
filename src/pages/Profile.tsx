import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Heart, Pill, AlertCircle, Phone, ArrowLeft, 
  Plus, Trash2, Download, Share2, MapPin, Edit,
  Check, X, Loader2, Search, FileText
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { EmergencyProfile } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { provinces } from '@/lib/provinces';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '?'];

const defaultProfile = (): EmergencyProfile => ({
  id: uuidv4(),
  fullName: '',
  conditions: [],
  allergies: [],
  medications: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export default function Profile() {
  const { language, isOnline } = useApp();
  const { location, error: geoError, isLoading: geoLoading, getLocation } = useGeolocation();
  
  const [profiles, setProfiles] = useState<EmergencyProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<EmergencyProfile | null>(null);
  const [showExportCard, setShowExportCard] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flooded_emergency_profiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfiles(parsed);
      if (parsed.length > 0) setSelectedProfileId(parsed[0].id);
    }
  }, []);

  useEffect(() => {
    if (profiles.length > 0) {
      localStorage.setItem('flooded_emergency_profiles', JSON.stringify(profiles));
    }
  }, [profiles]);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const handleCreateNew = () => {
    setEditProfile(defaultProfile());
    setIsEditing(true);
  };

  const handleEdit = (profile: EmergencyProfile) => {
    setEditProfile({ ...profile });
    setProvinceSearch(profile.province || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editProfile) return;
    if (!editProfile.fullName.trim()) {
      toast.error(language === 'vi' ? 'Vui lòng nhập họ tên' : 'Please enter name');
      return;
    }
    editProfile.updatedAt = Date.now();
    const existingIndex = profiles.findIndex(p => p.id === editProfile.id);
    if (existingIndex >= 0) {
      const updated = [...profiles];
      updated[existingIndex] = editProfile;
      setProfiles(updated);
    } else {
      setProfiles([...profiles, editProfile]);
    }
    setSelectedProfileId(editProfile.id);
    setIsEditing(false);
    setEditProfile(null);
    toast.success(language === 'vi' ? 'Đã lưu hồ sơ' : 'Profile saved');
  };

  const handleDelete = (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    if (updated.length === 0) localStorage.removeItem('flooded_emergency_profiles');
    if (selectedProfileId === id) setSelectedProfileId(updated.length > 0 ? updated[0].id : null);
    toast.success(language === 'vi' ? 'Đã xoá hồ sơ' : 'Profile deleted');
  };

  const handleGetLocation = async () => {
    if (!editProfile) return;
    const loc = await getLocation();
    if (loc) {
      setEditProfile({
        ...editProfile,
        location: { latitude: loc.latitude, longitude: loc.longitude, updatedAt: Date.now() }
      });
      toast.success(language === 'vi' ? 'Đã lấy vị trí' : 'Location obtained');
    } else {
      toast.error(language === 'vi' ? 'Không lấy được vị trí. Thử lại hoặc nhập địa chỉ thủ công.' : 'Cannot get location. Try again or enter address manually.');
    }
  };

  const generateProfileText = (profile: EmergencyProfile) => {
    return `🆘 HỒ SƠ KHẨN CẤP
━━━━━━━━━━━━━━
👤 ${profile.fullName}${profile.birthYear ? ` (${new Date().getFullYear() - profile.birthYear} tuổi)` : ''}
📞 ${profile.phone || 'Chưa có'}
🏠 ${profile.address || 'Chưa có'} ${profile.province ? `• ${profile.province}` : ''}
🩸 Nhóm máu: ${profile.bloodType || '?'}

📋 BỆNH NỀN: ${profile.conditions.length > 0 ? profile.conditions.join(', ') : 'Không'}
⚠️ DỊ ỨNG: ${profile.allergies.length > 0 ? profile.allergies.join(', ') : 'Không'}
💊 THUỐC: ${profile.medications.length > 0 ? profile.medications.join(', ') : 'Không'}
${profile.medicalNote ? `📝 Y tế: ${profile.medicalNote}` : ''}

📱 LIÊN HỆ KHẨN: ${profile.emergencyContactName || 'Chưa có'} - ${profile.emergencyContactPhone || ''}
${profile.location ? `📍 ${profile.location.latitude.toFixed(5)}, ${profile.location.longitude.toFixed(5)}` : ''}
${profile.specialNotes ? `📝 ${profile.specialNotes}` : ''}
━━━━━━━━━━━━━━
Từ app FLOODED`;
  };

  const handleCopyProfile = (profile: EmergencyProfile) => {
    navigator.clipboard.writeText(generateProfileText(profile));
    toast.success(language === 'vi' ? 'Đã sao chép' : 'Copied');
  };

  const handleExportJSON = (profile: EmergencyProfile) => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-profile-${profile.fullName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'vi' ? 'Đã tải file JSON' : 'JSON downloaded');
  };

  const handleExportText = (profile: EmergencyProfile) => {
    const text = generateProfileText(profile);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emergency-profile-${profile.fullName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'vi' ? 'Đã tải file' : 'File downloaded');
  };

  const filteredProvinces = provinces.filter(p => 
    p.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  // ---- EDITING FORM ----
  if (isEditing && editProfile) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-20">
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => { setIsEditing(false); setEditProfile(null); }} className="p-2 rounded-lg bg-secondary">
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">
                {profiles.find(p => p.id === editProfile.id) 
                  ? (language === 'vi' ? 'Sửa hồ sơ' : 'Edit Profile')
                  : (language === 'vi' ? 'Tạo hồ sơ mới' : 'New Profile')}
              </h1>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              <Check className="w-4 h-4" />
              {language === 'vi' ? 'Lưu' : 'Save'}
            </button>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="tactical-card space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {language === 'vi' ? 'Thông tin cơ bản' : 'Basic Info'}
            </h3>
            <input
              type="text"
              value={editProfile.fullName}
              onChange={(e) => setEditProfile({ ...editProfile, fullName: e.target.value })}
              placeholder={language === 'vi' ? 'Họ tên *' : 'Full name *'}
              className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                value={editProfile.birthYear || ''}
                onChange={(e) => setEditProfile({ ...editProfile, birthYear: parseInt(e.target.value) || undefined })}
                placeholder={language === 'vi' ? 'Năm sinh' : 'Birth year'}
                className="px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="tel"
                value={editProfile.phone || ''}
                onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                placeholder={language === 'vi' ? 'SĐT' : 'Phone'}
                className="px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Address + Province */}
          <div className="tactical-card space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {language === 'vi' ? 'Địa chỉ' : 'Address'}
            </h3>
            <input
              type="text"
              value={editProfile.address || ''}
              onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
              placeholder={language === 'vi' ? 'Số nhà, đường, phường/xã...' : 'Street address...'}
              className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {/* Province searchable dropdown */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={provinceSearch}
                  onChange={(e) => {
                    setProvinceSearch(e.target.value);
                    setShowProvinceDropdown(true);
                  }}
                  onFocus={() => setShowProvinceDropdown(true)}
                  placeholder={language === 'vi' ? 'Tỉnh/Thành phố...' : 'Province/City...'}
                  className="w-full pl-9 pr-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {showProvinceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto z-30">
                  {filteredProvinces.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setEditProfile({ ...editProfile, province: p });
                        setProvinceSearch(p);
                        setShowProvinceDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-secondary transition-colors ${
                        editProfile.province === p ? 'bg-primary/10 text-primary font-medium' : ''
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {filteredProvinces.length === 0 && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">
                      {language === 'vi' ? 'Không tìm thấy' : 'Not found'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Blood Type */}
          <div className="tactical-card space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-destructive" />
              {language === 'vi' ? 'Nhóm máu' : 'Blood Type'}
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {bloodTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setEditProfile({ ...editProfile, bloodType: type })}
                  className={`py-2 rounded-lg font-bold text-sm ${
                    editProfile.bloodType === type
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <TagInputSection
            title={language === 'vi' ? 'Bệnh nền' : 'Medical Conditions'}
            icon={<AlertCircle className="w-4 h-4 text-warning" />}
            items={editProfile.conditions}
            onItemsChange={(items) => setEditProfile(prev => prev ? { ...prev, conditions: items } : prev)}
            placeholder={language === 'vi' ? 'Thêm bệnh nền...' : 'Add condition...'}
            color="warning"
          />

          {/* Allergies */}
          <TagInputSection
            title={language === 'vi' ? 'Dị ứng' : 'Allergies'}
            icon={<AlertCircle className="w-4 h-4 text-orange-500" />}
            items={editProfile.allergies}
            onItemsChange={(items) => setEditProfile(prev => prev ? { ...prev, allergies: items } : prev)}
            placeholder={language === 'vi' ? 'Thêm dị ứng...' : 'Add allergy...'}
            color="orange"
          />

          {/* Medications */}
          <TagInputSection
            title={language === 'vi' ? 'Thuốc đang dùng' : 'Current Medications'}
            icon={<Pill className="w-4 h-4 text-accent" />}
            items={editProfile.medications}
            onItemsChange={(items) => setEditProfile(prev => prev ? { ...prev, medications: items } : prev)}
            placeholder={language === 'vi' ? 'Thêm thuốc...' : 'Add medication...'}
            color="accent"
          />

          {/* Medical Note */}
          <div className="tactical-card space-y-3">
            <h3 className="font-medium">
              {language === 'vi' ? 'Ghi chú y tế ngắn' : 'Medical Note'}
            </h3>
            <div className="relative">
              <input
                type="text"
                value={editProfile.medicalNote || ''}
                onChange={(e) => setEditProfile({ ...editProfile, medicalNote: e.target.value.slice(0, 80) })}
                placeholder={language === 'vi' ? 'VD: Đang mang thai 7 tháng...' : 'E.g. 7 months pregnant...'}
                className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={80}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                {(editProfile.medicalNote || '').length}/80
              </span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="tactical-card space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-success" />
              {language === 'vi' ? 'Liên hệ khẩn cấp' : 'Emergency Contact'}
            </h3>
            <input
              type="text"
              value={editProfile.emergencyContactName || ''}
              onChange={(e) => setEditProfile({ ...editProfile, emergencyContactName: e.target.value })}
              placeholder={language === 'vi' ? 'Tên người liên hệ' : 'Contact name'}
              className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-success"
            />
            <input
              type="tel"
              value={editProfile.emergencyContactPhone || ''}
              onChange={(e) => setEditProfile({ ...editProfile, emergencyContactPhone: e.target.value })}
              placeholder={language === 'vi' ? 'SĐT liên hệ' : 'Contact phone'}
              className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-success"
            />
          </div>

          {/* Location */}
          <div className="tactical-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {language === 'vi' ? 'Vị trí GPS' : 'GPS Location'}
              </h3>
              <button
                onClick={handleGetLocation}
                disabled={geoLoading}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {language === 'vi' ? 'Lấy vị trí' : 'Get Location'}
              </button>
            </div>
            {editProfile.location ? (
              <div className="p-2 bg-secondary rounded-lg">
                <p className="text-sm font-mono text-muted-foreground">
                  {editProfile.location.latitude.toFixed(5)}, {editProfile.location.longitude.toFixed(5)}
                </p>
                {editProfile.location.updatedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'vi' ? 'Cập nhật: ' : 'Updated: '}
                    {new Date(editProfile.location.updatedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {language === 'vi' ? 'Chưa có vị trí. Nhấn "Lấy vị trí" hoặc nhập địa chỉ ở trên.' : 'No location. Tap "Get Location" or enter address above.'}
              </p>
            )}
          </div>

          {/* Special Notes */}
          <div className="tactical-card space-y-3">
            <h3 className="font-medium">
              {language === 'vi' ? 'Ghi chú đặc biệt' : 'Special Notes'}
            </h3>
            <div className="relative">
              <textarea
                value={editProfile.specialNotes || ''}
                onChange={(e) => setEditProfile({ ...editProfile, specialNotes: e.target.value.slice(0, 120) })}
                placeholder={language === 'vi' ? 'Thông tin khác cho cứu hộ...' : 'Other info for rescuers...'}
                className="w-full h-20 px-3 py-2 bg-secondary rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={120}
              />
              <span className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {(editProfile.specialNotes || '').length}/120
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ---- EXPORT CARD VIEW ----
  if (showExportCard && selectedProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => setShowExportCard(false)} className="p-2 rounded-lg bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">
                {language === 'vi' ? 'Ảnh thẻ khẩn cấp' : 'Emergency Card'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Chụp màn hình để lưu' : 'Screenshot to save'}
              </p>
            </div>
          </div>
        </header>

        <main className="p-4">
          <div className="bg-gradient-to-br from-destructive/90 to-destructive p-6 rounded-2xl text-white relative overflow-hidden"
            style={{ aspectRatio: '9/16', maxWidth: '320px', margin: '0 auto' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6" />
              <span className="font-bold text-lg">HỒ SƠ KHẨN CẤP</span>
            </div>

            <div className="space-y-2.5 text-sm">
              <InfoRow label="HỌ TÊN" value={selectedProfile.fullName} large />
              {selectedProfile.birthYear && (
                <InfoRow label="TUỔI" value={`${new Date().getFullYear() - selectedProfile.birthYear}`} />
              )}
              <InfoRow label="SĐT" value={selectedProfile.phone || '-'} />
              {selectedProfile.address && <InfoRow label="ĐỊA CHỈ" value={`${selectedProfile.address}${selectedProfile.province ? ` • ${selectedProfile.province}` : ''}`} />}
              <InfoRow label="NHÓM MÁU" value={selectedProfile.bloodType || '?'} large />
              {selectedProfile.conditions.length > 0 && <InfoRow label="BỆNH NỀN" value={selectedProfile.conditions.join(', ')} />}
              {selectedProfile.allergies.length > 0 && <InfoRow label="DỊ ỨNG" value={selectedProfile.allergies.join(', ')} />}
              {selectedProfile.medications.length > 0 && <InfoRow label="THUỐC" value={selectedProfile.medications.join(', ')} />}
              {selectedProfile.medicalNote && <InfoRow label="GHI CHÚ Y TẾ" value={selectedProfile.medicalNote} />}

              <div className="pt-2 border-t border-white/30">
                <InfoRow label="LIÊN HỆ KHẨN" value={`${selectedProfile.emergencyContactName || '-'} • ${selectedProfile.emergencyContactPhone || '-'}`} />
              </div>

              {selectedProfile.location && (
                <InfoRow label="TOẠ ĐỘ" value={`${selectedProfile.location.latitude.toFixed(5)}, ${selectedProfile.location.longitude.toFixed(5)}`} mono />
              )}
            </div>

            <div className="absolute bottom-4 left-6 right-6 text-center">
              <p className="text-white/50 text-xs">FLOODED Emergency App</p>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {language === 'vi' 
              ? '📱 Chụp màn hình và đặt làm hình nền màn hình khoá' 
              : '📱 Take a screenshot and set as lock screen wallpaper'}
          </p>
        </main>
      </div>
    );
  }

  // ---- PROFILE LIST VIEW ----
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/more" className="p-2 rounded-lg bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">
              {language === 'vi' ? 'Hồ sơ khẩn cấp' : 'Emergency Profiles'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === 'vi' ? 'Thông tin y tế cho cứu hộ' : 'Medical info for rescuers'}
            </p>
          </div>
          <button onClick={handleCreateNew} className="p-2 rounded-lg bg-primary text-primary-foreground">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {language === 'vi' ? 'Chưa có hồ sơ nào' : 'No profiles yet'}
            </p>
            <button onClick={handleCreateNew} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium">
              {language === 'vi' ? 'Tạo hồ sơ đầu tiên' : 'Create first profile'}
            </button>
          </div>
        ) : (
          profiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="tactical-card"
            >
              {/* Profile header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-base">{profile.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.bloodType && `🩸 ${profile.bloodType}`}
                      {profile.province && ` • ${profile.province}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleEdit(profile)} className="p-2 rounded-lg bg-secondary">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Profile details grid */}
              <div className="space-y-2 mb-3 text-sm">
                <DetailRow label={language === 'vi' ? 'SĐT' : 'Phone'} value={profile.phone} />
                <DetailRow label={language === 'vi' ? 'Địa chỉ' : 'Address'} value={profile.address} />
                <DetailRow label={language === 'vi' ? 'Bệnh nền' : 'Conditions'} value={profile.conditions.length > 0 ? profile.conditions.join(', ') : undefined} />
                <DetailRow label={language === 'vi' ? 'Dị ứng' : 'Allergies'} value={profile.allergies.length > 0 ? profile.allergies.join(', ') : undefined} />
                <DetailRow label={language === 'vi' ? 'Thuốc' : 'Meds'} value={profile.medications.length > 0 ? profile.medications.join(', ') : undefined} />
                <DetailRow label={language === 'vi' ? 'Liên hệ khẩn' : 'Emergency'} value={profile.emergencyContactName ? `${profile.emergencyContactName} • ${profile.emergencyContactPhone || ''}` : undefined} />
                {profile.medicalNote && <DetailRow label={language === 'vi' ? 'Ghi chú y tế' : 'Medical note'} value={profile.medicalNote} />}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={() => handleCopyProfile(profile)} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                  <Share2 className="w-4 h-4" />
                  {language === 'vi' ? 'Sao chép' : 'Copy'}
                </button>
                <button onClick={() => handleExportText(profile)} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                  <FileText className="w-4 h-4" />
                  TXT
                </button>
                <button onClick={() => handleExportJSON(profile)} className="flex-1 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                  <Download className="w-4 h-4" />
                  JSON
                </button>
                <button onClick={() => { setSelectedProfileId(profile.id); setShowExportCard(true); }} className="py-2 px-3 bg-accent text-accent-foreground rounded-lg text-sm font-medium">
                  {language === 'vi' ? 'Thẻ' : 'Card'}
                </button>
                <button onClick={() => handleDelete(profile.id)} className="py-2 px-3 bg-destructive/20 text-destructive rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))
        )}

        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground text-center">
            {language === 'vi'
              ? '💡 Tạo hồ sơ cho bản thân và người thân. Dữ liệu lưu trong máy.'
              : '💡 Create profiles for yourself and family. Data saved locally.'}
          </p>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-muted-foreground min-w-[70px] pt-0.5">{label}</span>
      <span className="text-sm font-medium flex-1">{value || <span className="text-muted-foreground italic text-xs">Chưa cập nhật</span>}</span>
    </div>
  );
}

function InfoRow({ label, value, large, mono }: { label: string; value: string; large?: boolean; mono?: boolean }) {
  return (
    <div>
      <p className="text-white/70 text-[10px]">{label}</p>
      <p className={`font-medium ${large ? 'text-xl font-bold' : 'text-sm'} ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}

function TagInputSection({ title, icon, items, onItemsChange, placeholder, color }: {
  title: string; icon: React.ReactNode; items: string[];
  onItemsChange: (items: string[]) => void; placeholder: string; color: string;
}) {
  const [newItem, setNewItem] = useState('');
  const addItem = () => { if (!newItem.trim()) return; onItemsChange([...items, newItem.trim()]); setNewItem(''); };
  const removeItem = (index: number) => { onItemsChange(items.filter((_, i) => i !== index)); };

  return (
    <div className="tactical-card space-y-3">
      <h3 className="font-medium flex items-center gap-2">{icon}{title}</h3>
      <div className="flex gap-2">
        <input
          type="text" value={newItem} onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem} className={`px-4 py-2 rounded-lg font-medium ${
          color === 'warning' ? 'bg-warning text-warning-foreground' : color === 'orange' ? 'bg-orange-500 text-white' : 'bg-accent text-accent-foreground'
        }`}>+</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span key={index} className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
            color === 'warning' ? 'bg-warning/20 text-warning' : color === 'orange' ? 'bg-orange-500/20 text-orange-500' : 'bg-accent/20 text-accent'
          }`}>
            {item}
            <button onClick={() => removeItem(index)}><Trash2 className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}
