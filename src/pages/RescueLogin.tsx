import { useState, useEffect } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { loginRescueTeam, ensureDemoTeam } from '@/lib/rescueRegistration';

export default function RescueLogin() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');

  // Ensure demo team exists
  useEffect(() => { ensureDemoTeam(); }, []);

  const handleLogin = () => {
    if (!teamName.trim() || !teamCode.trim()) { toast.error('Nhập tên đội và mã đội'); return; }
    const cred = loginRescueTeam(teamName.trim(), teamCode.trim());
    if (cred) {
      sessionStorage.setItem('flooded_rescue_team', JSON.stringify(cred));
      toast.success('Đăng nhập thành công');
      navigate('/rescue-team');
    } else {
      toast.error('Sai thông tin đăng nhập hoặc tài khoản chưa được duyệt');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-bold">Đăng nhập Đội cứu hộ</h1>
          <p className="text-xs text-muted-foreground">Dành cho đội đã được phê duyệt</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Tên đội</label>
            <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="VD: Đội Demo"
              className="w-full px-4 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Mã đội</label>
            <input type="text" value={teamCode} onChange={e => setTeamCode(e.target.value)} placeholder="VD: 1111-1234"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-secondary rounded-lg text-base font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button onClick={handleLogin} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />Đăng nhập
          </button>
        </div>

        <div className="p-3 bg-secondary/50 rounded-lg">
          <p className="text-[10px] text-muted-foreground text-center">
            📌 Mã đội được cấp sau khi hồ sơ được COMMAND phê duyệt.<br/>
            Demo: Tên đội = <span className="font-bold text-foreground">Đội Demo</span> | Mã đội = <span className="font-mono font-bold text-foreground">1111-1234</span>
          </p>
        </div>

        <div className="text-center space-y-2">
          <Link to="/register-rescue" className="text-sm text-primary font-medium">Chưa có tài khoản? Đăng ký đội cứu hộ →</Link>
          <br />
          <Link to="/register-rescue/status" className="text-xs text-muted-foreground">Tra cứu trạng thái đăng ký</Link>
        </div>
      </div>
    </div>
  );
}
