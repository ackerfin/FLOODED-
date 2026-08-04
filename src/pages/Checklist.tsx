import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, RotateCcw, Shield, Droplets, Zap, Home, Phone, Package, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';

interface ChecklistItem {
  id: string;
  labelVi: string;
  labelEn: string;
  icon: React.ElementType;
}

interface ChecklistCategory {
  id: string;
  titleVi: string;
  titleEn: string;
  items: ChecklistItem[];
}

const checklistData: ChecklistCategory[] = [
  {
    id: 'water_food',
    titleVi: '💧 Nước & Thực phẩm',
    titleEn: '💧 Water & Food',
    items: [
      { id: 'water_3days', labelVi: 'Nước uống đủ 3 ngày (3L/người/ngày)', labelEn: 'Drinking water for 3 days (3L/person/day)', icon: Droplets },
      { id: 'food_dry', labelVi: 'Thực phẩm khô, đóng hộp', labelEn: 'Dry food, canned goods', icon: Package },
      { id: 'water_purify', labelVi: 'Viên lọc nước / thuốc khử khuẩn', labelEn: 'Water purification tablets', icon: Droplets },
    ],
  },
  {
    id: 'power_light',
    titleVi: '🔦 Điện & Ánh sáng',
    titleEn: '🔦 Power & Light',
    items: [
      { id: 'flashlight', labelVi: 'Đèn pin + pin dự phòng', labelEn: 'Flashlight + spare batteries', icon: Zap },
      { id: 'powerbank', labelVi: 'Sạc dự phòng (đã sạc đầy)', labelEn: 'Power bank (fully charged)', icon: Zap },
      { id: 'candles', labelVi: 'Nến + bật lửa (đặt xa vật dễ cháy)', labelEn: 'Candles + lighter (keep away from flammables)', icon: Zap },
    ],
  },
  {
    id: 'medical',
    titleVi: '🩹 Y tế & Sơ cứu',
    titleEn: '🩹 Medical & First Aid',
    items: [
      { id: 'firstaid_kit', labelVi: 'Túi sơ cứu cơ bản', labelEn: 'Basic first aid kit', icon: Heart },
      { id: 'medicine', labelVi: 'Thuốc cá nhân (bệnh nền, dị ứng)', labelEn: 'Personal medicine (chronic, allergy)', icon: Heart },
      { id: 'mask_gloves', labelVi: 'Khẩu trang, găng tay', labelEn: 'Masks, gloves', icon: Heart },
    ],
  },
  {
    id: 'documents',
    titleVi: '📄 Giấy tờ & Liên lạc',
    titleEn: '📄 Documents & Communication',
    items: [
      { id: 'id_copy', labelVi: 'Bản sao CCCD, sổ hộ khẩu (bọc nilon)', labelEn: 'ID copies (sealed in plastic)', icon: Shield },
      { id: 'emergency_contacts', labelVi: 'Số điện thoại khẩn cấp (viết ra giấy)', labelEn: 'Emergency contacts (written on paper)', icon: Phone },
      { id: 'cash', labelVi: 'Tiền mặt nhỏ', labelEn: 'Small cash', icon: Package },
    ],
  },
  {
    id: 'safety',
    titleVi: '🏠 An toàn nhà cửa',
    titleEn: '🏠 Home Safety',
    items: [
      { id: 'power_off', labelVi: 'Biết vị trí cầu dao tổng', labelEn: 'Know main circuit breaker location', icon: Home },
      { id: 'valuables_high', labelVi: 'Đồ quý đã chuyển lên cao', labelEn: 'Valuables moved to high ground', icon: Home },
      { id: 'evacuation_route', labelVi: 'Đã xác định đường sơ tán', labelEn: 'Evacuation route identified', icon: Home },
      { id: 'neighbors_check', labelVi: 'Đã báo hàng xóm/người già', labelEn: 'Notified neighbors/elderly', icon: Phone },
    ],
  },
  {
    id: 'emergency_kit',
    titleVi: '🎒 Túi khẩn cấp',
    titleEn: '🎒 Emergency Bag',
    items: [
      { id: 'clothes_change', labelVi: 'Quần áo thay đổi (bọc nilon)', labelEn: 'Change of clothes (in plastic bag)', icon: Package },
      { id: 'rain_gear', labelVi: 'Áo mưa / áo phao', labelEn: 'Rain gear / life jacket', icon: Package },
      { id: 'whistle', labelVi: 'Còi / vật phát tín hiệu', labelEn: 'Whistle / signaling device', icon: Package },
      { id: 'rope', labelVi: 'Dây thừng (5-10m)', labelEn: 'Rope (5-10m)', icon: Package },
    ],
  },
];

const STORAGE_KEY = 'flooded_checklist_state';

export default function Checklist() {
  const { language } = useApp();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse checklist state:', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const resetAll = () => {
    setCheckedItems({});
  };

  const totalItems = checklistData.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progress = Math.round((checkedCount / totalItems) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
        <div className="flex items-center justify-between p-4 safe-top">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold text-lg">
                {language === 'vi' ? 'Checklist trước bão' : 'Pre-Storm Checklist'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {language === 'vi' ? 'Chuẩn bị để an toàn' : 'Prepare to stay safe'}
              </p>
            </div>
          </div>
          <button 
            onClick={resetAll}
            className="p-2 rounded-lg bg-secondary text-muted-foreground"
            title={language === 'vi' ? 'Đặt lại' : 'Reset'}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Progress Bar */}
        <div className="tactical-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {language === 'vi' ? 'Tiến độ chuẩn bị' : 'Preparation Progress'}
            </span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {checkedCount}/{totalItems} {language === 'vi' ? 'mục đã hoàn thành' : 'items completed'}
          </p>
        </div>

        {/* Checklist Categories */}
        {checklistData.map((category) => (
          <div key={category.id} className="tactical-card">
            <h2 className="font-bold text-base mb-3">
              {language === 'vi' ? category.titleVi : category.titleEn}
            </h2>
            <div className="space-y-2">
              {category.items.map((item) => {
                const isChecked = checkedItems[item.id] || false;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isChecked 
                        ? 'bg-success/20 border border-success/30' 
                        : 'bg-secondary border border-transparent'
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-success text-black' : 'bg-muted'
                    }`}>
                      {isChecked && <Check className="w-4 h-4" />}
                    </div>
                    <span className={`flex-1 text-left text-sm ${isChecked ? 'line-through text-muted-foreground' : ''}`}>
                      {language === 'vi' ? item.labelVi : item.labelEn}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Completion Message */}
        {progress === 100 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="tactical-card border-success/30 bg-success/10 text-center py-6"
          >
            <Check className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-bold text-lg text-success">
              {language === 'vi' ? 'Tuyệt vời!' : 'Excellent!'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'vi' 
                ? 'Bạn đã chuẩn bị đầy đủ. Hãy giữ an toàn!' 
                : "You're fully prepared. Stay safe!"}
            </p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
