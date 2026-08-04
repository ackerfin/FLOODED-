import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getCategoriesOrdered, getCasesByCategory, searchCases, getAllCases, type SurvivalCase } from '@/lib/survivalData';
import { CategorySection } from '@/components/CategorySection';
import { CaseCard } from '@/components/CaseCard';
import { CaseSteps } from '@/components/CaseSteps';
import { BottomNav } from '@/components/BottomNav';

export default function Guides() {
  const { language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState<SurvivalCase | null>(null);

  const categories = getCategoriesOrdered();
  const searchResults = searchQuery ? searchCases(searchQuery) : null;
  
  // Get actual total case count
  const totalCases = useMemo(() => getAllCases().length, []);

  if (selectedCase) {
    return (
      <CaseSteps
        survivalCase={selectedCase}
        onBack={() => setSelectedCase(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-4 safe-top">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-bold text-lg">
              {language === 'vi' ? 'Hướng dẫn sinh tồn' : 'Survival Guides'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === 'vi' 
                ? `${totalCases} tình huống • Có sẵn ngoại tuyến` 
                : `${totalCases} scenarios • Available offline`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'vi' ? 'Tìm tình huống...' : 'Search scenarios...'}
            className="w-full pl-10 pr-4 py-3 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <main className="px-4">
        {/* Search Results */}
        {searchResults ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              {language === 'vi' 
                ? `${searchResults.length} kết quả cho "${searchQuery}"`
                : `${searchResults.length} results for "${searchQuery}"`
              }
            </p>
            {searchResults.map((survivalCase) => (
              <CaseCard
                key={survivalCase.id}
                survivalCase={survivalCase}
                onClick={() => setSelectedCase(survivalCase)}
              />
            ))}
            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === 'vi' ? 'Không tìm thấy kết quả' : 'No results found'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Categories */
          categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <CategorySection
                category={category}
                cases={getCasesByCategory(category.id)}
                onSelectCase={setSelectedCase}
                defaultExpanded={index === 0}
              />
            </motion.div>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
}
