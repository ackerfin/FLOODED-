import { useState } from 'react';
import { Shield, LogIn } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { loginCommand } from '@/lib/rescueRegistration';

export default function CommandLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      toast.error('Nhập tài khoản và mật khẩu');
      return;
    }
    if (loginCommand(username.trim(), password.trim())) {
      sessionStorage.setItem('flooded_command_auth', 'true');
      toast.success('Đăng nhập COMMAND thành công');
      navigate('/rescue');
    } else {
      toast.error('Sai tài khoản hoặc mật khẩu');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-9 h-9 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">COMMAND LOGIN</h1>
          <p className="text-xs text-muted-foreground">Đăng nhập dành cho quản trị viên cấp cao</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Nhập username"
              className="w-full px-4 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-destructive" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 bg-secondary rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-destructive" />
          </div>
          <button onClick={handleLogin} className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-bold flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" />Đăng nhập COMMAND
          </button>
        </div>

        <div className="p-3 bg-secondary/50 rounded-lg">
          <p className="text-[10px] text-muted-foreground text-center">
            ⚠️ Chỉ dành cho quản trị viên được ủy quyền.<br/>
            Demo: username = <span className="font-bold text-foreground">Command 01</span> | password = <span className="font-mono font-bold text-foreground">1234</span>
          </p>
        </div>

        <div className="text-center">
          <Link to="/rescue-login" className="text-sm text-primary font-medium">← Quay lại Dashboard đội cứu hộ</Link>
        </div>
      </div>
    </div>
  );
}
