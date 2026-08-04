import { useEffect, useState } from 'react';
import { Shield, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import type { RescueTeamCredential } from '@/lib/rescueRegistration';

export default function RescueDashboard() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<RescueTeamCredential | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('flooded_rescue_team');
    if (!saved) { navigate('/rescue-login'); return; }
    setTeam(JSON.parse(saved));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('flooded_rescue_team');
    navigate('/rescue-login');
  };

  if (!team) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <CheckCircle className="w-20 h-20 text-[hsl(var(--success))] mx-auto" />
        <h1 className="text-2xl font-bold text-[hsl(var(--success))]">Bạn đã vào Chế độ cứu hộ thành công</h1>

        <div className="tactical-card p-4 space-y-2 text-left">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">{team.teamName}</span>
          </div>
          <p className="text-sm text-muted-foreground">Đội trưởng: {team.leaderName}</p>
          <p className="text-sm text-muted-foreground">Tỉnh/TP: {team.province}</p>
          <p className="text-sm text-muted-foreground">Username: @{team.username}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] text-xs font-bold">{team.status}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Chức năng đầy đủ sẽ được cập nhật trong phiên bản tiếp theo. Hiện tại bạn đã xác thực thành công.</p>

        <div className="flex gap-3">
          <Link to="/" className="flex-1 py-3 bg-secondary rounded-xl font-medium text-sm">Trang chủ</Link>
          <button onClick={handleLogout} className="flex-1 py-3 bg-destructive/20 text-destructive rounded-xl font-bold text-sm flex items-center justify-center gap-1">
            <LogOut className="w-4 h-4" />Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
