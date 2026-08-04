import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, CheckCircle, XCircle, Clock, Eye, X, Copy, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  getRegistrations, approveRegistration, rejectRegistration,
  teamTypeLabels, vehicleTypeLabels, availabilityLabels,
  type RescueTeamRegistration, type RegistrationStatus,
} from '@/lib/rescueRegistration';

export default function AdminRescueRegistrations() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('flooded_admin_session') === 'true');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [regs, setRegs] = useState<RescueTeamRegistration[]>(getRegistrations);
  const [filterStatus, setFilterStatus] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [approvedCreds, setApprovedCreds] = useState<{ teamCode: string; teamName: string } | null>(null);

  const handleCommandLogin = () => {
    if (adminUser === 'Command 01' && adminPass === '1234') {
      sessionStorage.setItem('flooded_admin_session', 'true');
      setIsLoggedIn(true);
      toast.success('Đăng nhập Command thành công');
    } else {
      toast.error('Sai tài khoản Command');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('flooded_admin_session');
    setIsLoggedIn(false);
  };

  const filtered = useMemo(() => {
    let r = regs;
    if (filterStatus !== 'ALL') r = r.filter(x => x.status === filterStatus);
    return r.sort((a, b) => b.createdAt - a.createdAt);
  }, [regs, filterStatus]);

  const selected = regs.find(r => r.id === selectedId);

  const handleApprove = (id: string) => {
    const creds = approveRegistration(id);
    if (creds) {
      setApprovedCreds(creds);
      setRegs(getRegistrations());
      toast.success('Đã duyệt hồ sơ');
    }
  };

  const handleReject = (id: string) => {
    if (!rejectReason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    rejectRegistration(id, rejectReason.trim());
    setRegs(getRegistrations());
    setShowReject(false);
    setRejectReason('');
    toast.success('Đã từ chối hồ sơ');
  };

  const copyCreds = () => {
    if (!approvedCreds) return;
    navigator.clipboard.writeText(`Tên đội: ${approvedCreds.teamName}\nMã đội: ${approvedCreds.teamCode}`);
    toast.success('Đã sao chép');
  };

  // ===== COMMAND LOGIN =====
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-3" />
            <h1 className="text-xl font-bold">Command Login</h1>
            <p className="text-xs text-muted-foreground">Quản lý hồ sơ đăng ký đội cứu hộ</p>
          </div>
          <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)} placeholder="Username"
            className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Password"
            onKeyDown={e => e.key === 'Enter' && handleCommandLogin()}
            className="w-full px-4 py-3 bg-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={handleCommandLogin} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold">Đăng nhập</button>
          
        </div>
      </div>
    );
  }

  // ===== DETAIL VIEW =====
  const renderDetail = () => {
    if (!selected) return null;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center" onClick={() => { setSelectedId(null); setApprovedCreds(null); setShowReject(false); }}>
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          className="bg-card w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-4 space-y-4" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Hồ sơ: REG-{selected.id.slice(0, 8).toUpperCase()}</h2>
            <button onClick={() => { setSelectedId(null); setApprovedCreds(null); }} className="p-1.5 rounded-lg bg-secondary"><X className="w-4 h-4" /></button>
          </div>

          <div className={`py-2 px-3 rounded-lg text-center font-bold text-sm ${
            selected.status === 'PENDING' ? 'bg-warning/20 text-warning' :
            selected.status === 'APPROVED' ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' :
            'bg-destructive/20 text-destructive'
          }`}>{selected.status}</div>

          <div className="space-y-2 text-sm">
            <Row label="Tên đội" value={selected.teamName} />
            <Row label="Đội trưởng" value={selected.leaderName} />
            <Row label="SĐT" value={selected.leaderPhone} />
            <Row label="Email" value={selected.email || '-'} />
            <Row label="Loại đội" value={teamTypeLabels[selected.teamType]} />
            <Row label="Tỉnh/TP" value={selected.province} />
            {selected.district && <Row label="Quận/Huyện" value={selected.district} />}
            {selected.ward && <Row label="Phường/Xã" value={selected.ward} />}
            <Row label="Phương tiện" value={selected.vehicleTypes.map(v => vehicleTypeLabels[v]).join(', ')} />
            {selected.vehicleOtherText && <Row label="PT khác" value={selected.vehicleOtherText} />}
            {selected.licensePlate && <Row label="Biển số" value={selected.licensePlate} />}
            <Row label="Số thành viên" value={String(selected.membersCount)} />
            {selected.capacityNote && <Row label="Năng lực" value={selected.capacityNote} />}
            <Row label="Thời gian" value={selected.availability.map(a => availabilityLabels[a]).join(', ')} />
            <Row label="File xác minh" value={selected.verificationFileNames.join(', ')} />
            <Row label="Ngày gửi" value={new Date(selected.createdAt).toLocaleString('vi-VN')} />
          </div>

          {selected.status === 'REJECTED' && selected.rejectReason && (
            <div className="p-3 bg-destructive/10 rounded-lg text-sm">
              <p className="font-bold text-destructive text-xs mb-1">Lý do từ chối:</p>
              <p>{selected.rejectReason}</p>
            </div>
          )}

          {/* Approved credentials popup */}
          {approvedCreds && (
            <div className="p-4 bg-[hsl(var(--success))]/10 border-2 border-[hsl(var(--success))]/30 rounded-xl space-y-2">
              <p className="font-bold text-[hsl(var(--success))] text-sm">✅ TÀI KHOẢN ĐÃ CẤP</p>
              <div className="p-3 bg-secondary rounded-lg font-mono text-sm space-y-1">
                <p>Tên đội: <span className="font-bold text-primary">{approvedCreds.teamName}</span></p>
                <p>Mã đội: <span className="font-bold text-primary">{approvedCreds.teamCode}</span></p>
              </div>
              <button onClick={copyCreds} className="w-full py-2 bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                <Copy className="w-4 h-4" />Sao chép thông tin
              </button>
              <p className="text-[10px] text-muted-foreground text-center">Gửi thông tin này cho đội trưởng qua Zalo/SMS</p>
            </div>
          )}

          {/* Actions */}
          {selected.status === 'PENDING' && !approvedCreds && (
            <div className="space-y-2">
              {!showReject ? (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(selected.id)}
                    className="flex-1 py-3 bg-[hsl(var(--success))] text-white rounded-xl font-bold flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" />DUYỆT
                  </button>
                  <button onClick={() => setShowReject(true)}
                    className="flex-1 py-3 bg-destructive text-destructive-foreground rounded-xl font-bold flex items-center justify-center gap-1">
                    <XCircle className="w-4 h-4" />TỪ CHỐI
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Lý do từ chối *"
                    className="w-full h-20 px-3 py-2 bg-secondary rounded-lg text-sm resize-none focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setShowReject(false)} className="flex-1 py-2 bg-secondary rounded-lg text-sm">Huỷ</button>
                    <button onClick={() => handleReject(selected.id)} className="flex-1 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold text-sm">Xác nhận từ chối</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ===== LIST VIEW =====
  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/rescue" className="p-2 rounded-lg bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Quản lý đăng ký đội</h1>
            <p className="text-xs text-muted-foreground">{filtered.length} hồ sơ</p>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg bg-secondary"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-3">
        {/* Filter */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
              {s === 'ALL' ? 'Tất cả' : s === 'PENDING' ? 'Chờ duyệt' : s === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
              {s === 'PENDING' && ` (${regs.filter(r => r.status === 'PENDING').length})`}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="tactical-card p-8 text-center">
            <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Chưa có hồ sơ nào</p>
          </div>
        ) : (
          filtered.map(r => (
            <button key={r.id} onClick={() => { setSelectedId(r.id); setApprovedCreds(null); setShowReject(false); }}
              className="tactical-card p-3 w-full text-left space-y-1.5 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{r.teamName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  r.status === 'PENDING' ? 'bg-warning/20 text-warning' :
                  r.status === 'APPROVED' ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' :
                  'bg-destructive/20 text-destructive'
                }`}>{r.status}</span>
              </div>
              <p className="text-xs text-muted-foreground">{r.leaderName} • {r.leaderPhone}</p>
              <p className="text-xs text-muted-foreground">{r.province} • {teamTypeLabels[r.teamType]}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
            </button>
          ))
        )}
      </main>

      <AnimatePresence>{selectedId && renderDetail()}</AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
