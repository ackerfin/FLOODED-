import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Sparkles, Star, Cloud, Heart, Bookmark, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import { 
  quoteThemes, loadQuotesState, saveQuotesState, getAllQuotes, 
  getRandomQuote, getRandomThemeIndex, type QuotesState 
} from '@/lib/quotes';

const stickers = [Star, Cloud, Heart, Sparkles];

export default function QuotesPage() {
  const { language } = useApp();
  
  const [state, setState] = useState<QuotesState>(loadQuotesState);
  const [currentQuote, setCurrentQuote] = useState('');
  const [themeIndex, setThemeIndex] = useState(0);
  const [stickerIndex, setStickerIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuote, setNewQuote] = useState('');

  const allQuotes = getAllQuotes(state);
  const theme = quoteThemes[themeIndex];
  const StickerIcon = stickers[stickerIndex];
  const isFavorited = state.favorites.includes(currentQuote);

  const nextQuote = useCallback(() => {
    const { quote, index } = getRandomQuote(allQuotes, state.lastQuoteIndex);
    const newThemeIdx = getRandomThemeIndex(state.lastThemeIndex);
    setCurrentQuote(quote);
    setThemeIndex(newThemeIdx);
    setStickerIndex(Math.floor(Math.random() * stickers.length));
    const updated = { ...state, lastQuoteIndex: index, lastThemeIndex: newThemeIdx };
    setState(updated);
    saveQuotesState(updated);
  }, [allQuotes, state]);

  useEffect(() => { nextQuote(); }, []);

  const toggleFavorite = () => {
    const updated = { ...state };
    if (isFavorited) { updated.favorites = updated.favorites.filter(q => q !== currentQuote); }
    else { updated.favorites = [...updated.favorites, currentQuote]; }
    setState(updated); saveQuotesState(updated);
  };

  const addCustomQuote = () => {
    if (!newQuote.trim()) return;
    const updated = { ...state, customQuotes: [...state.customQuotes, newQuote.trim()] };
    setState(updated); saveQuotesState(updated); setNewQuote(''); setShowAddForm(false);
  };

  const isDarkBg = theme.text === '#FFFFFF';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
      <header className="p-4 safe-top">
        <div className="flex items-center gap-4">
          <Link to="/more" className="p-2 rounded-lg" style={{ backgroundColor: `${theme.text}15` }}>
            <ArrowLeft className="w-5 h-5" style={{ color: theme.text }} />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
            <h1 className="font-bold text-lg" style={{ color: theme.text }}>
              {language === 'vi' ? 'Câu an ủi' : 'Support Quotes'}
            </h1>
          </div>
        </div>
      </header>

      <main className="px-4 pb-8">
        <motion.div key={currentQuote} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="relative p-8 rounded-2xl mb-6 mt-8" style={{ backgroundColor: `${theme.text}10` }}>
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-4 -right-2">
            <StickerIcon className="w-10 h-10" style={{ color: theme.accent }} />
          </motion.div>
          <p className="text-2xl font-medium leading-relaxed" style={{ color: theme.text }}>"{currentQuote}"</p>
        </motion.div>

        <div className="flex gap-3 mb-8">
          <button onClick={nextQuote} className="flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: theme.accent, color: isDarkBg ? '#252D45' : '#FFFFFF' }}>
            <RefreshCw className="w-6 h-6" />{language === 'vi' ? 'Đổi câu' : 'Next'}
          </button>
          <button onClick={toggleFavorite} className="px-5 py-4 rounded-xl" style={{ backgroundColor: `${theme.text}15` }}>
            <Bookmark className="w-6 h-6" style={{ color: theme.accent }} fill={isFavorited ? theme.accent : 'none'} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="px-5 py-4 rounded-xl" style={{ backgroundColor: `${theme.text}15` }}>
            <Plus className="w-6 h-6" style={{ color: theme.text }} />
          </button>
        </div>

        {showAddForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 flex gap-2">
            <input type="text" value={newQuote} onChange={(e) => setNewQuote(e.target.value)} placeholder={language === 'vi' ? 'Thêm câu an ủi...' : 'Add quote...'}
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/20 focus:outline-none" style={{ color: theme.text }} maxLength={150} />
            <button onClick={addCustomQuote} className="px-4 py-2 rounded-lg font-medium text-sm" style={{ backgroundColor: theme.accent, color: isDarkBg ? '#252D45' : '#FFFFFF' }}>
              {language === 'vi' ? 'Thêm' : 'Add'}
            </button>
          </motion.div>
        )}

        {state.favorites.length > 0 && (
          <p className="text-xs mb-4" style={{ color: theme.subtext }}>
            <Bookmark className="w-3 h-3 inline mr-1" />
            {state.favorites.length} {language === 'vi' ? 'câu đã lưu' : 'saved'}
          </p>
        )}

        <div>
          <p className="text-sm mb-3" style={{ color: theme.subtext }}>{language === 'vi' ? 'Chọn màu nền' : 'Choose theme'}</p>
          <div className="grid grid-cols-6 gap-3">
            {quoteThemes.map((t, index) => (
              <button key={t.id} onClick={() => setThemeIndex(index)}
                className={`aspect-square rounded-xl transition-all ${themeIndex === index ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                style={{ backgroundColor: t.bg }} title={t.name} />
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl text-center" style={{ backgroundColor: `${theme.text}10` }}>
          <p className="text-sm" style={{ color: theme.subtext }}>
            {language === 'vi' ? 'Bạn không cô đơn. Có người đang chờ bạn sống tiếp.' : 'You are not alone. Someone is waiting for you to keep living.'}
          </p>
        </div>
      </main>
    </div>
  );
}
