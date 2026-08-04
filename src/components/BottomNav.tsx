import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, ClipboardList, MoreHorizontal } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const { language, pendingCount } = useApp();
  const location = useLocation();

  // User Mode only — Rescue Mode has its own nav in RescueMode.tsx
  const navItems = [
    { icon: Home, labelVi: 'Trang chủ', labelEn: 'Home', path: '/' },
    { icon: BookOpen, labelVi: 'Hướng dẫn', labelEn: 'Guides', path: '/guides' },
    { icon: Users, labelVi: 'Lân cận', labelEn: 'Nearby', path: '/nearby' },
    { icon: ClipboardList, labelVi: 'Checklist', labelEn: 'Checklist', path: '/checklist' },
    { icon: MoreHorizontal, labelVi: 'Thêm', labelEn: 'More', path: '/more' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = item.path === '/nearby' && pendingCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center p-2 min-w-[60px] transition-colors relative',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-1">
                {language === 'vi' ? item.labelVi : item.labelEn}
              </span>
              {showBadge && (
                <span className="absolute -top-1 right-0 bg-warning text-black text-[10px] font-bold px-1.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
