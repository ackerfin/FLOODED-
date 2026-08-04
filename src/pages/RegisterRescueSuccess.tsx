import { motion } from 'framer-motion';
import { CheckCircle, Home, Search, Clock } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function RegisterRescueSuccess() {
  const [params] = useSearchParams();
  const regId = params.get('id') || '';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
        <CheckCircle className="w-24 h-24 text-[hsl(var(--success))]" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-[hsl(var(--success))] text-center mt-6 mb-2">
        ĐÃ GỬI ĐĂNG KÝ THÀNH CÔNG
      </motion.h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="w-full max-w-sm space-y-4">
        <div className="tactical-card p-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Mã hồ sơ</p>
          <p className="font-mono font-bold text-primary text-lg">REG-{regId.slice(0, 8).toUpperCase()}</p>
          <div className="flex items-center justify-center gap-2 text-warning">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Trạng thái: ĐANG CHỜ DUYỆT</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Ban điều phối sẽ xét duyệt hồ sơ. Khi được duyệt, bạn sẽ nhận tài khoản đăng nhập.
        </p>

        <div className="flex gap-3">
          <Link to={`/register-rescue/status?id=${regId}`} className="flex-1 py-3 bg-secondary rounded-xl font-medium text-sm flex items-center justify-center gap-1">
            <Search className="w-4 h-4" />Theo dõi
          </Link>
          <Link to="/" className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-1">
            <Home className="w-4 h-4" />Trang chủ
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
