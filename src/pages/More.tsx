import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Settings, 
  User, 
  Heart, 
  Phone, 
  Shield, 
  HelpCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';

export default function More() {
  const { language, settings } = useApp();

  const menuItems = [
    {
      icon: User,
      titleVi: 'Hồ sơ khẩn cấp',
      titleEn: 'Emergency Profiles',
      descriptionVi: 'Thông tin y tế cho cứu hộ',
      descriptionEn: 'Medical info for rescuers',
      path: '/profile',
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      icon: Sparkles,
      titleVi: 'Câu an ủi',
      titleEn: 'Support Quotes',
      descriptionVi: 'Giữ bình tĩnh trong khó khăn',
      descriptionEn: 'Stay calm during hardship',
      path: '/quotes',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
    },
    {
      icon: Phone,
      titleVi: 'Báo SOS hộ người thân',
      titleEn: 'Remote SOS for Family',
      descriptionVi: 'Gửi khi có mạng, từ nơi an toàn',
      descriptionEn: 'Send when online, from safe zone',
      path: '/remote-sos',
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      icon: Settings,
      titleVi: 'Cài đặt',
      titleEn: 'Settings',
      descriptionVi: 'Ngôn ngữ, đồng bộ, chế độ',
      descriptionEn: 'Language, sync, modes',
      path: '/settings',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
  ];

  // Show rescue dashboard link if rescue mode is enabled
  if (settings?.rescueMode) {
    menuItems.push({
      icon: Shield,
      titleVi: 'Quản lý cứu hộ',
      titleEn: 'Rescue Dashboard',
      descriptionVi: 'Giao diện riêng cho đội cứu hộ',
      descriptionEn: 'Separate UI for rescue teams',
      path: '/rescue',
      color: 'text-success',
      bgColor: 'bg-success/20',
    });
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 safe-top">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
              {language === 'vi' ? 'Thêm' : 'More'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === 'vi' ? 'Công cụ & cài đặt' : 'Tools & settings'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={item.path}
              className="tactical-card flex items-center gap-4 p-4"
            >
              <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {language === 'vi' ? item.titleVi : item.titleEn}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'vi' ? item.descriptionVi : item.descriptionEn}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Link>
          </motion.div>
        ))}

        {/* Help note */}
        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'vi'
                  ? 'Nếu nguy kịch, ưu tiên nút KHẨN CẤP ở Trang chủ.'
                  : 'In emergency, prioritize the EMERGENCY button on Home.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
