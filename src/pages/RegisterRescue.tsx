import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { provinces } from '@/lib/provinces';
import {
  createRegistration, teamTypeLabels, vehicleTypeLabels, availabilityLabels,
  type TeamType, type VehicleType, type Availability,
} from '@/lib/rescueRegistration';

export default function RegisterRescue() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [email, setEmail] = useState('');
  const [teamType, setTeamType] = useState<TeamType | ''>('');
  const [province, setProvince] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDrop, setShowProvinceDrop] = useState(false);
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [vehicleOther, setVehicleOther] = useState('');
  const [membersCount, setMembersCount] = useState(3);
  const [capacityNote, setCapacityNote] = useState('');
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [licensePlate, setLicensePlate] = useState('');
  const [consent, setConsent] = useState(false);

  const filteredProvinces = provinces.filter(p => p.toLowerCase().includes(provinceSearch.toLowerCase()));

  const toggleVehicle = (v: VehicleType) => {
    setVehicleTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };
  const toggleAvail = (a: Availability) => {
    setAvailability(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const names: string[] = [];
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      names.push(files[i].name);
    }
    setFileNames(names);
  };

  const handleSubmit = () => {
    if (!teamName.trim()) { toast.error('Vui lòng nhập tên đội'); return; }
    if (!leaderName.trim()) { toast.error('Vui lòng nhập tên đội trưởng'); return; }
    if (!leaderPhone.trim()) { toast.error('Vui lòng nhập SĐT đội trưởng'); return; }
    if (!teamType) { toast.error('Vui lòng chọn loại đội'); return; }
    if (!province) { toast.error('Vui lòng chọn tỉnh/thành phố'); return; }
    if (vehicleTypes.length === 0) { toast.error('Vui lòng chọn loại phương tiện'); return; }
    if (membersCount < 1) { toast.error('Số thành viên phải >= 1'); return; }
    if (availability.length === 0) { toast.error('Vui lòng chọn thời gian hoạt động'); return; }
    if (fileNames.length === 0) { toast.error('Vui lòng tải lên ít nhất 1 file xác minh'); return; }
    if (!consent) { toast.error('Vui lòng đồng ý cam kết'); return; }

    const result = createRegistration({
      teamName: teamName.trim(),
      leaderName: leaderName.trim(),
      leaderPhone: leaderPhone.trim(),
      email: email.trim() || undefined,
      teamType: teamType as TeamType,
      province,
      district: district.trim() || undefined,
      ward: ward.trim() || undefined,
      vehicleTypes,
      vehicleOtherText: vehicleOther.trim() || undefined,
      membersCount,
      capacityNote: capacityNote.trim() || undefined,
      availability,
      verificationFileNames: fileNames,
      licensePlate: licensePlate.trim() || undefined,
      consent: true,
    });

    if (!result.success) {
      toast.error(result.error || 'Lỗi đăng ký');
      return;
    }

    navigate(`/register-rescue/success?id=${result.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/" className="p-2 rounded-lg bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-primary" />Đăng ký đội cứu hộ</h1>
            <p className="text-xs text-muted-foreground">Gửi hồ sơ để được duyệt tham gia điều phối</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-sm text-warning">Hồ sơ sẽ được Ban điều phối xét duyệt. Chỉ đội đã APPROVED mới được cấp tài khoản.</p>
          </div>
        </div>

        {/* Team name */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Tên đội *</label>
          <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="VD: Đội cứu hộ Phong Điền"
            className="w-full px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* Leader info */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Thông tin đội trưởng</label>
          <input type="text" value={leaderName} onChange={e => setLeaderName(e.target.value)} placeholder="Họ tên đội trưởng *"
            className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="tel" value={leaderPhone} onChange={e => setLeaderPhone(e.target.value)} placeholder="SĐT đội trưởng *"
            className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email (không bắt buộc)"
            className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        {/* Team type */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Loại đội *</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(teamTypeLabels) as [TeamType, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setTeamType(key)}
                className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${teamType === key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Province */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Khu vực hoạt động *</label>
          <div className="relative">
            <input type="text" value={provinceSearch} onChange={e => { setProvinceSearch(e.target.value); setShowProvinceDrop(true); }} onFocus={() => setShowProvinceDrop(true)}
              placeholder="Tỉnh/Thành phố *" className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            {showProvinceDrop && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto z-30">
                {filteredProvinces.slice(0, 15).map(p => (
                  <button key={p} onClick={() => { setProvince(p); setProvinceSearch(p); setShowProvinceDrop(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary ${province === p ? 'bg-primary/10 font-medium' : ''}`}>{p}</button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="text" value={district} onChange={e => setDistrict(e.target.value)} placeholder="Quận/Huyện"
              className="px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
            <input type="text" value={ward} onChange={e => setWard(e.target.value)} placeholder="Phường/Xã"
              className="px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
          </div>
        </div>

        {/* Vehicle types */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Phương tiện *</label>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(vehicleTypeLabels) as [VehicleType, string][]).map(([key, label]) => (
              <button key={key} onClick={() => toggleVehicle(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${vehicleTypes.includes(key) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
          {vehicleTypes.includes('OTHER') && (
            <input type="text" value={vehicleOther} onChange={e => setVehicleOther(e.target.value)} placeholder="Mô tả phương tiện khác"
              className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
          )}
          <input type="text" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} placeholder="Biển số xe (nếu có)"
            className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
        </div>

        {/* Members + capacity */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Nhân lực</label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Số thành viên *:</span>
            <button onClick={() => setMembersCount(Math.max(1, membersCount - 1))} className="w-10 h-10 rounded-lg bg-secondary font-bold text-lg">-</button>
            <span className="text-2xl font-bold min-w-[40px] text-center">{membersCount}</span>
            <button onClick={() => setMembersCount(membersCount + 1)} className="w-10 h-10 rounded-lg bg-secondary font-bold text-lg">+</button>
          </div>
          <input type="text" value={capacityNote} onChange={e => setCapacityNote(e.target.value)} placeholder="Ghi chú năng lực (VD: có bác sĩ, thợ lặn...)"
            className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
        </div>

        {/* Availability */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">Thời gian hoạt động *</label>
          <div className="flex gap-2">
            {(Object.entries(availabilityLabels) as [Availability, string][]).map(([key, label]) => (
              <button key={key} onClick={() => toggleAvail(key)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${availability.includes(key) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Verification files */}
        <div className="tactical-card space-y-3">
          <label className="text-sm font-medium">File xác minh * (1-3 file)</label>
          <p className="text-xs text-muted-foreground">Ảnh CMND/CCCD đội trưởng, giấy phép thuyền, hoặc xác nhận từ chính quyền</p>
          <div className="relative">
            <input type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="flex items-center gap-2 px-4 py-3 bg-secondary rounded-lg cursor-pointer">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{fileNames.length > 0 ? `${fileNames.length} file đã chọn` : 'Chọn file...'}</span>
            </div>
          </div>
          {fileNames.length > 0 && (
            <div className="space-y-1">
              {fileNames.map((f, i) => (
                <p key={i} className="text-xs text-accent">📎 {f}</p>
              ))}
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="tactical-card">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
              className="mt-1 w-5 h-5 rounded accent-primary" />
            <span className="text-sm">
              Tôi cam kết thông tin trên là chính xác. Tôi đồng ý tuân thủ quy trình điều phối cứu hộ và chịu trách nhiệm về hoạt động của đội. *
            </span>
          </label>
        </div>

        {/* Submit */}
        <motion.button onClick={handleSubmit} whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" />GỬI ĐĂNG KÝ
        </motion.button>
      </main>
    </div>
  );
}
