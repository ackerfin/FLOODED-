import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Sparkles, Star, Cloud, Heart, Bookmark, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { 
  quoteThemes, loadQuotesState, saveQuotesState, getAllQuotes, 
  getRandomQuote, getRandomThemeIndex, type QuotesState 
} from '@/lib/quotes';

interface QuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const stickers = [Star, Cloud, Heart, Sparkles];

export function QuotesModal({ isOpen, onClose }: QuotesModalProps) {
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

  useEffect(() => {
    if (isOpen) {
      nextQuote();
    }
  }, [isOpen]);

  const toggleFavorite = () => {
    const updated = { ...state };
    if (isFavorited) {
      updated.favorites = updated.favorites.filter(q => q !== currentQuote);
    } else {
      updated.favorites = [...updated.favorites, currentQuote];
    }
    setState(updated);
    saveQuotesState(updated);
  };

  const addCustomQuote = () => {
    if (!newQuote.trim()) return;
    const updated = { ...state, customQuotes: [...state.customQuotes, newQuote.trim()] };
    setState(updated);
    saveQuotesState(updated);
    setNewQuote('');
    setShowAddForm(false);
  };

  const isDarkBg = theme.text === '#FFFFFF';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl"
            style={{ backgroundColor: theme.bg }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3">
              <div className="w-12 h-1.5 rounded-full opacity-30" style={{ backgroundColor: theme.text }} />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full"
              style={{ backgroundColor: `${theme.text}15` }}
            >
              <X className="w-5 h-5" style={{ color: theme.text }} />
            </button>

            <div className="p-6 pb-10">
              {/* Title */}
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5" style={{ color: theme.accent }} />
                <h2 className="text-lg font-bold" style={{ color: theme.text }}>
                  {language === 'vi' ? 'Câu an ủi' : 'Support Quote'}
                </h2>
              </div>

              {/* Quote card */}
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-6 rounded-2xl mb-6"
                style={{ backgroundColor: `${theme.text}10` }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-3 -right-2"
                >
                  <StickerIcon className="w-8 h-8" style={{ color: theme.accent }} />
                </motion.div>

                <p className="text-xl font-medium leading-relaxed" style={{ color: theme.text }}>
                  "{currentQuote}"
                </p>
              </motion.div>

              {/* Action buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={nextQuote}
                  className="flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: theme.accent,
                    color: isDarkBg ? '#252D45' : '#FFFFFF'
                  }}
                >
                  <RefreshCw className="w-5 h-5" />
                  {language === 'vi' ? 'Đổi câu' : 'Next'}
                </button>
                <button
                  onClick={toggleFavorite}
                  className="px-4 py-3 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${theme.text}15` }}
                >
                  <Bookmark 
                    className="w-5 h-5" 
                    style={{ color: theme.accent }}
                    fill={isFavorited ? theme.accent : 'none'}
                  />
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-3 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${theme.text}15` }}
                >
                  <Plus className="w-5 h-5" style={{ color: theme.text }} />
                </button>
              </div>

              {/* Add custom quote form */}
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      placeholder={language === 'vi' ? 'Thêm câu an ủi...' : 'Add a quote...'}
                      className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/20 focus:outline-none"
                      style={{ color: theme.text }}
                      maxLength={150}
                    />
                    <button
                      onClick={addCustomQuote}
                      className="px-4 py-2 rounded-lg font-medium text-sm"
                      style={{ backgroundColor: theme.accent, color: isDarkBg ? '#252D45' : '#FFFFFF' }}
                    >
                      {language === 'vi' ? 'Thêm' : 'Add'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Favorites count */}
              {state.favorites.length > 0 && (
                <p className="text-xs mb-4" style={{ color: theme.subtext }}>
                  <Bookmark className="w-3 h-3 inline mr-1" />
                  {state.favorites.length} {language === 'vi' ? 'câu đã lưu' : 'saved'}
                </p>
              )}

              {/* Theme palette */}
              <div>
                <p className="text-sm mb-3" style={{ color: theme.subtext }}>
                  {language === 'vi' ? 'Chọn màu nền' : 'Choose theme'}
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {quoteThemes.map((t, index) => (
                    <button
                      key={t.id}
                      onClick={() => setThemeIndex(index)}
                      className={`aspect-square rounded-xl transition-all ${
                        themeIndex === index ? 'ring-2 ring-offset-2 scale-110' : ''
                      }`}
                      style={{ backgroundColor: t.bg }}
                      title={t.name}
                    />
                  ))}
                </div>
              </div>

              {/* Safety note */}
              <p className="text-xs text-center mt-6" style={{ color: theme.subtext }}>
                {language === 'vi' 
                  ? 'Bạn không cô đơn. Có người đang chờ bạn.' 
                  : 'You are not alone. Someone is waiting for you.'}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
