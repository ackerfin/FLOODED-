import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getRegistrationById, type RescueTeamRegistration } from '@/lib/rescueRegistration';

export default function RegisterRescueStatus() {
  const [params] = useSearchParams();
  const paramId = params.get('id') || '';
  const [searchId, setSearchId] = useState(paramId);
  const [reg, setReg] = useState<RescueTeamRegistration | undefined>();
  const [searched, setSearched] = useState(!!paramId);

  useEffect(() => {
    if (paramId) {
      setReg(getRegistrationById(paramId));
      setSearched(true);
    }
  }, [paramId]);

  const handleSearch = () => {
    if (!searchId.trim()) return;
    setReg(getRegistrationById(searchId.trim()));
    setSearched(true);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center gap-4 p-4">
          <Link to="/" className="p-2 rounded-lg bg-secondary"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">Tra cứu trạng thái đăng ký</h1>
            <p className="text-xs text-muted-foreground">Nhập mã hồ sơ để kiểm tra</p>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        <div className="flex gap-2">
          <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)}
            placeholder="Nhập ID hồ sơ..." onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary" />
          <button onClick={handleSearch} className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {searched && !reg && (
          <div className="tactical-card p-8 text-center">
            <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Không tìm thấy hồ sơ với ID này</p>
          </div>
        )}

        {reg && (
          <div className="tactical-card p-4 space-y-4">
            <div className="text-center">
              {reg.status === 'PENDING' && <Clock className="w-12 h-12 text-warning mx-auto" />}
              {reg.status === 'APPROVED' && <CheckCircle className="w-12 h-12 text-[hsl(var(--success))] mx-auto" />}
              {reg.status === 'REJECTED' && <XCircle className="w-12 h-12 text-destructive mx-auto" />}
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">Mã hồ sơ</p>
              <p className="font-mono font-bold text-primary">REG-{reg.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <div className={`text-center py-3 rounded-lg font-bold ${
              reg.status === 'PENDING' ? 'bg-warning/20 text-warning' :
              reg.status === 'APPROVED' ? 'bg-[hsl(var(--success))]/20 text-[hsl(var(--success))]' :
              'bg-destructive/20 text-destructive'
            }`}>
              {reg.status === 'PENDING' && 'ĐANG CHỜ DUYỆT'}
              {reg.status === 'APPROVED' && 'ĐÃ DUYỆT — Bạn đã có tài khoản'}
              {reg.status === 'REJECTED' && 'BỊ TỪ CHỐI'}
            </div>

            {reg.status === 'REJECTED' && reg.rejectReason && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-xs text-destructive font-bold mb-1">Lý do từ chối:</p>
                <p className="text-sm">{reg.rejectReason}</p>
              </div>
            )}

            {reg.status === 'APPROVED' && (
              <Link to="/rescue-login" className="block w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-center">
                Đăng nhập ngay →
              </Link>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Đội</span><span className="font-medium">{reg.teamName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Đội trưởng</span><span>{reg.leaderName}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">SĐT</span><span>{reg.leaderPhone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tỉnh/TP</span><span>{reg.province}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Ngày gửi</span><span>{new Date(reg.createdAt).toLocaleDateString('vi-VN')}</span></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
