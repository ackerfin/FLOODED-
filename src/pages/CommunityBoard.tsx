import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Send, Clock, Radio, CheckCircle, AlertCircle, HandHeart, Info, MessageCircle, X, ArrowLeft, ClipboardPaste, ChevronDown
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import type { CommunityPost, CommunityPostType, CommunityPostReply } from '@/types';

const postTypes: { id: CommunityPostType; labelVi: string; labelEn: string; icon: typeof CheckCircle; color: string; bgColor: string }[] = [
  { id: 'checkin', labelVi: 'Tôi ổn', labelEn: "I'm OK", icon: CheckCircle, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  { id: 'need', labelVi: 'Cần giúp', labelEn: 'Need Help', icon: AlertCircle, color: 'text-destructive', bgColor: 'bg-destructive/20' },
  { id: 'offer', labelVi: 'Có thể hỗ trợ', labelEn: 'Can Help', icon: HandHeart, color: 'text-success', bgColor: 'bg-success/20' },
];

const needItems = [
  { id: 'medicine', labelVi: 'Thuốc', labelEn: 'Medicine' },
  { id: 'water', labelVi: 'Nước sạch', labelEn: 'Clean Water' },
  { id: 'food', labelVi: 'Đồ ăn', labelEn: 'Food' },
  { id: 'battery', labelVi: 'Pin/Sạc', labelEn: 'Battery' },
  { id: 'flashlight', labelVi: 'Đèn pin', labelEn: 'Flashlight' },
  { id: 'lifejacket', labelVi: 'Áo phao', labelEn: 'Life Jacket' },
  { id: 'evacuate', labelVi: 'Di chuyển', labelEn: 'Evacuation' },
  { id: 'firstaid', labelVi: 'Sơ cứu', labelEn: 'First Aid' },
];

const offerItems = [
  { id: 'has_medicine', labelVi: 'Có thuốc', labelEn: 'Have Medicine' },
  { id: 'has_food', labelVi: 'Có đồ ăn', labelEn: 'Have Food' },
  { id: 'has_water', labelVi: 'Có nước', labelEn: 'Have Water' },
  { id: 'has_battery', labelVi: 'Có pin/sạc', labelEn: 'Have Battery' },
  { id: 'has_shelter', labelVi: 'Có chỗ trú', labelEn: 'Have Shelter' },
  { id: 'has_boat', labelVi: 'Có thuyền', labelEn: 'Have Boat' },
  { id: 'can_firstaid', labelVi: 'Biết sơ cứu', labelEn: 'Can First Aid' },
];

const checkinItems = [
  { id: 'im_ok', labelVi: 'Tôi ổn', labelEn: "I'm OK" },
  { id: 'house_safe', labelVi: 'Nhà an toàn', labelEn: 'House Safe' },
  { id: 'on_high', labelVi: 'Đã lên cao', labelEn: 'On High Ground' },
];

const DEFAULT_TTL = 180;

// Home profile for quick paste
interface HomeProfile {
  label: string;
  address: string;
  province: string;
}

function getHomeProfile(): HomeProfile {
  const saved = localStorage.getItem('flooded_home_profile');
  return saved ? JSON.parse(saved) : { label: 'Nhà 1', address: '', province: '' };
}

function saveHomeProfile(p: HomeProfile) {
  localStorage.setItem('flooded_home_profile', JSON.stringify(p));
}

export default function CommunityBoard() {
  const { language, settings, updateAppSettings } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [postType, setPostType] = useState<CommunityPostType>('checkin');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [homeProfile, setHomeProfile] = useState<HomeProfile>(getHomeProfile);
  const [senderLabel, setSenderLabel] = useState(settings?.senderLabel || homeProfile.label);
  
  // Detail view
  const [detailPostId, setDetailPostId] = useState<string | null>(null);
  
  // Reply
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyItems, setReplyItems] = useState<string[]>([]);
  const [replyNote, setReplyNote] = useState('');
  
  // Home profile editor
  const [showHomeEditor, setShowHomeEditor] = useState(false);
  const [editLabel, setEditLabel] = useState(homeProfile.label);
  const [editAddress, setEditAddress] = useState(homeProfile.address);

  const maxNoteLength = 60;

  useEffect(() => {
    const saved = localStorage.getItem('flooded_community_posts');
    if (saved) {
      const parsed: CommunityPost[] = JSON.parse(saved);
      const now = Date.now();
      const active = parsed.filter(p => now < p.createdAt + (p.ttlMinutes * 60 * 1000));
      setPosts(active);
    } else {
      const demoData: CommunityPost[] = [
        { id: uuidv4(), type: 'need', senderLabel: 'Nhà 5', items: ['Nước sạch', 'Thuốc'], note: 'Có người già cần thuốc huyết áp', createdAt: Date.now() - 30 * 60 * 1000, ttlMinutes: DEFAULT_TTL, hops: 1, replies: [] },
        { id: uuidv4(), type: 'offer', senderLabel: 'Nhà 10', items: ['Có đồ ăn', 'Có nước'], note: 'Còn mì gói và nước đóng chai', createdAt: Date.now() - 45 * 60 * 1000, ttlMinutes: DEFAULT_TTL, hops: 0, replies: [] },
        { id: uuidv4(), type: 'checkin', senderLabel: 'Nhà 3', items: ['Tôi ổn', 'Đã lên cao'], note: '', createdAt: Date.now() - 60 * 60 * 1000, ttlMinutes: DEFAULT_TTL, hops: 2, replies: [] },
      ];
      setPosts(demoData);
      localStorage.setItem('flooded_community_posts', JSON.stringify(demoData));
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem('flooded_community_posts', JSON.stringify(posts));
  }, [posts]);

  const getItemsByType = (type?: CommunityPostType) => {
    switch (type || postType) {
      case 'need': return needItems;
      case 'offer': return offerItems;
      case 'checkin': return checkinItems;
    }
  };

  const toggleItem = (itemLabel: string) => setSelectedItems(prev => prev.includes(itemLabel) ? prev.filter(i => i !== itemLabel) : [...prev, itemLabel]);
  const toggleReplyItem = (itemLabel: string) => setReplyItems(prev => prev.includes(itemLabel) ? prev.filter(i => i !== itemLabel) : [...prev, itemLabel]);

  const handleSubmit = () => {
    if (selectedItems.length === 0) { toast.error(language === 'vi' ? 'Chọn ít nhất 1 mục' : 'Select at least 1 item'); return; }
    const newPost: CommunityPost = { id: uuidv4(), type: postType, senderLabel, items: selectedItems, note: note.trim(), createdAt: Date.now(), ttlMinutes: DEFAULT_TTL, hops: 0, replies: [] };
    setPosts(prev => [newPost, ...prev]);
    setSelectedItems([]); setNote('');
    updateAppSettings({ senderLabel });
    // Also update home profile label
    const hp = { ...homeProfile, label: senderLabel };
    setHomeProfile(hp); saveHomeProfile(hp);
    toast.success(language === 'vi' ? 'Đã gửi tin' : 'Post sent');
  };

  const handleReply = (postId: string) => {
    if (replyItems.length === 0 && !replyNote.trim()) { toast.error(language === 'vi' ? 'Chọn mục hoặc ghi chú' : 'Select or add note'); return; }
    const reply: CommunityPostReply = { id: uuidv4(), parentId: postId, senderLabel, items: replyItems, note: replyNote.trim(), createdAt: Date.now(), ttlMinutes: DEFAULT_TTL };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: [...(p.replies || []), reply] } : p));
    setReplyingTo(null); setReplyItems([]); setReplyNote('');
    toast.success(language === 'vi' ? 'Đã trả lời' : 'Reply sent');
  };

  const pasteAddress = () => {
    if (homeProfile.address) {
      setReplyNote(prev => {
        const addr = homeProfile.address;
        const combined = prev ? `${prev} — ${addr}` : addr;
        return combined.slice(0, 60);
      });
    } else {
      toast.info(language === 'vi' ? 'Chưa có địa chỉ nhà — thiết lập bên dưới' : 'No home address set');
      setShowHomeEditor(true);
    }
  };

  const simulateMesh = () => {
    const names = ['Nhà 7', 'Nhà 12', 'Nhà 15', 'Nhà 20'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newPost: CommunityPost = Math.random() > 0.5
      ? { id: uuidv4(), type: 'need', senderLabel: randomName, items: ['Nước sạch', 'Pin/Sạc'], note: 'Có trẻ nhỏ', createdAt: Date.now(), ttlMinutes: DEFAULT_TTL, hops: 1, replies: [] }
      : { id: uuidv4(), type: 'offer', senderLabel: randomName, items: ['Có thuyền', 'Biết sơ cứu'], note: '', createdAt: Date.now(), ttlMinutes: DEFAULT_TTL, hops: 1, replies: [] };
    setPosts(prev => [newPost, ...prev.map(p => ({ ...p, hops: p.hops + 1 }))]);
    toast.success(language === 'vi' ? 'Đã nhận tin từ thiết bị gần' : 'Received from nearby device');
  };

  const getTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return language === 'vi' ? 'Vừa xong' : 'Just now';
    if (minutes < 60) return `${minutes} ${language === 'vi' ? 'phút' : 'min'}`;
    return `${Math.floor(minutes / 60)} ${language === 'vi' ? 'giờ' : 'hr'}`;
  };

  const getPostTypeInfo = (type: CommunityPostType) => postTypes.find(t => t.id === type)!;
  const getReplyItemsForPost = (post: CommunityPost) => post.type === 'need' ? offerItems : post.type === 'offer' ? needItems : checkinItems;

  const detailPost = useMemo(() => posts.find(p => p.id === detailPostId), [posts, detailPostId]);

  const saveHomeProfileEdits = () => {
    const hp: HomeProfile = { label: editLabel || 'Nhà 1', address: editAddress, province: '' };
    setHomeProfile(hp); saveHomeProfile(hp);
    setSenderLabel(hp.label);
    setShowHomeEditor(false);
    toast.success(language === 'vi' ? 'Đã lưu thông tin nhà' : 'Home info saved');
  };

  // ============= POST DETAIL VIEW =============
  if (detailPost) {
    const typeInfo = getPostTypeInfo(detailPost.type);
    const allReplies = detailPost.replies || [];

    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10">
          <div className="flex items-center gap-4 p-4">
            <button onClick={() => setDetailPostId(null)} className="p-2 rounded-lg bg-secondary">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg">{language === 'vi' ? 'Chi tiết bài đăng' : 'Post Detail'}</h1>
              <p className="text-xs text-muted-foreground">{detailPost.senderLabel} • {getTimeAgo(detailPost.createdAt)}</p>
            </div>
          </div>
        </header>

        <main className="p-4 space-y-4">
          {/* Full post */}
          <div className="tactical-card">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${typeInfo.bgColor} ${typeInfo.color}`}>
                {language === 'vi' ? typeInfo.labelVi : typeInfo.labelEn}
              </span>
              <span className="text-base font-bold">{detailPost.senderLabel}</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {detailPost.items.map((item, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium">{item}</span>
              ))}
            </div>
            {detailPost.note && <p className="text-base mb-3">{detailPost.note}</p>}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeAgo(detailPost.createdAt)}</span>
              {detailPost.hops > 0 && <span className="flex items-center gap-1"><Radio className="w-3 h-3" />{language === 'vi' ? `Chuyển ${detailPost.hops} lần` : `${detailPost.hops} hops`}</span>}
            </div>
          </div>

          {/* All Replies */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {language === 'vi' ? `Trả lời (${allReplies.length})` : `Replies (${allReplies.length})`}
            </h3>
            {allReplies.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{language === 'vi' ? 'Chưa có trả lời' : 'No replies yet'}</p>
            ) : (
              <div className="space-y-2">
                {allReplies.map(reply => (
                  <div key={reply.id} className="tactical-card p-3 ml-4 border-l-2 border-accent/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{reply.senderLabel}</span>
                      <span className="text-xs text-muted-foreground">{getTimeAgo(reply.createdAt)}</span>
                    </div>
                    {reply.items.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {reply.items.map((item, i) => <span key={i} className="text-sm px-2 py-0.5 rounded bg-secondary">{item}</span>)}
                      </div>
                    )}
                    {reply.note && <p className="text-sm text-muted-foreground">{reply.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply form in detail */}
          <div className="tactical-card space-y-3">
            <h3 className="font-medium text-sm">{language === 'vi' ? 'Trả lời bài này' : 'Reply to this post'}</h3>
            <div className="flex flex-wrap gap-1.5">
              {getReplyItemsForPost(detailPost).map((item) => {
                const label = language === 'vi' ? item.labelVi : item.labelEn;
                return (
                  <button key={item.id} onClick={() => toggleReplyItem(label)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${replyItems.includes(label) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input type="text" value={replyNote} onChange={(e) => setReplyNote(e.target.value.slice(0, 60))} placeholder={language === 'vi' ? 'Ghi chú ngắn...' : 'Short note...'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none pr-8" />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{replyNote.length}/60</span>
              </div>
              <button onClick={pasteAddress} className="p-2 rounded-lg bg-secondary text-muted-foreground" title={language === 'vi' ? 'Dán địa chỉ nhà' : 'Paste home address'}>
                <ClipboardPaste className="w-4 h-4" />
              </button>
            </div>
            <button onClick={() => handleReply(detailPost.id)} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              {language === 'vi' ? 'GỬI TRẢ LỜI' : 'SEND REPLY'}
            </button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  // ============= MAIN LIST VIEW =============
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{language === 'vi' ? 'Bảng tin lân cận' : 'Community Board'}</h1>
              <p className="text-xs text-muted-foreground">{language === 'vi' ? 'Hỗ trợ cộng đồng • Ngoại tuyến' : 'Community • Offline'}</p>
            </div>
          </div>
          <button onClick={simulateMesh} className="p-2 rounded-lg bg-secondary" title={language === 'vi' ? 'Mô phỏng thiết bị gần' : 'Simulate nearby'}>
            <Radio className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="px-4 space-y-4">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {language === 'vi' ? 'Không chia sẻ thông tin nhạy cảm. Nếu nguy kịch, ưu tiên nút KHẨN CẤP.' : "Don't share sensitive info. In emergency, use EMERGENCY button."}
            </p>
          </div>
        </div>

        {/* Home profile quick setup */}
        <button onClick={() => { setEditLabel(homeProfile.label); setEditAddress(homeProfile.address); setShowHomeEditor(!showHomeEditor); }}
          className="w-full tactical-card p-3 flex items-center justify-between text-left">
          <div>
            <p className="text-sm font-medium">{language === 'vi' ? '🏠 Nhà của tôi' : '🏠 My Home'}: <span className="text-accent">{homeProfile.label}</span></p>
            <p className="text-xs text-muted-foreground">{homeProfile.address || (language === 'vi' ? 'Chưa có địa chỉ — bấm để thiết lập' : 'No address — tap to set')}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showHomeEditor ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showHomeEditor && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="tactical-card space-y-3">
                <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value.slice(0, 20))} placeholder={language === 'vi' ? 'Tên nhà (Nhà 1, Nhà 10...)' : 'Home label'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                <input type="text" value={editAddress} onChange={(e) => setEditAddress(e.target.value.slice(0, 60))} placeholder={language === 'vi' ? 'Địa chỉ ngắn (thôn/xóm, xã...)' : 'Short address'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none" />
                <button onClick={saveHomeProfileEdits} className="w-full py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm">
                  {language === 'vi' ? 'Lưu thông tin nhà' : 'Save Home Info'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post Composer */}
        <div className="tactical-card space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{language === 'vi' ? 'Gửi từ:' : 'From:'}</span>
            <span className="text-sm font-bold text-accent">{senderLabel}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {postTypes.map((type) => (
              <button key={type.id} onClick={() => { setPostType(type.id); setSelectedItems([]); }}
                className={`py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${postType === type.id ? `${type.bgColor} ${type.color} ring-2 ring-current` : 'bg-secondary text-muted-foreground'}`}>
                <type.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{language === 'vi' ? type.labelVi : type.labelEn}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {getItemsByType().map((item) => {
              const label = language === 'vi' ? item.labelVi : item.labelEn;
              return (
                <button key={item.id} onClick={() => toggleItem(label)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${selectedItems.includes(label) ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground'}`}>
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <input type="text" value={note} onChange={(e) => setNote(e.target.value.slice(0, maxNoteLength))} placeholder={language === 'vi' ? "Ghi chú ngắn (vd: 'có trẻ nhỏ')" : 'Short note'} className="w-full px-3 py-2 bg-secondary rounded-lg text-sm focus:outline-none pr-12" />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{note.length}/{maxNoteLength}</span>
          </div>

          <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            {language === 'vi' ? 'GỬI TIN' : 'SEND POST'}
          </button>
        </div>

        <div className="text-center">
          <button onClick={simulateMesh} className="text-xs text-muted-foreground underline">
            {language === 'vi' ? '📡 Mô phỏng gặp thiết bị gần' : '📡 Simulate nearby device'}
          </button>
          <p className="text-[10px] text-muted-foreground mt-1">{language === 'vi' ? 'Tin có thể lan truyền khi gặp thiết bị gần (mô phỏng)' : 'Posts can propagate via nearby devices (simulated)'}</p>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            {language === 'vi' ? 'Tin lân cận' : 'Nearby Posts'} ({posts.length})
          </h2>
          
          {posts.map((post, index) => {
            const typeInfo = getPostTypeInfo(post.type);
            const visibleReplies = (post.replies || []).slice(-2);
            const totalReplies = (post.replies || []).length;
            
            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                <button onClick={() => setDetailPostId(post.id)} className="tactical-card p-3 w-full text-left">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${typeInfo.bgColor} ${typeInfo.color}`}>
                        {language === 'vi' ? typeInfo.labelVi : typeInfo.labelEn}
                      </span>
                      <span className="text-sm font-bold">{post.senderLabel}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />{getTimeAgo(post.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.items.map((item, i) => (<span key={i} className="text-sm">{i > 0 && ' • '}{item}</span>))}
                  </div>

                  {post.note && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.note}</p>}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {post.hops > 0 && <span className="flex items-center gap-1"><Radio className="w-3 h-3" />{post.hops}x</span>}
                      {totalReplies > 0 && <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{totalReplies}</span>}
                    </div>
                    <span className="text-xs text-accent">{language === 'vi' ? 'Xem chi tiết →' : 'View →'}</span>
                  </div>

                  {/* Preview last 2 replies */}
                  {visibleReplies.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      {visibleReplies.map(reply => (
                        <p key={reply.id} className="text-xs text-muted-foreground truncate">
                          <span className="font-medium text-foreground">{reply.senderLabel}:</span> {reply.items.join(' • ')}{reply.note ? ` — ${reply.note}` : ''}
                        </p>
                      ))}
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
