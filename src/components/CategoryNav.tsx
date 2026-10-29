import React, { useRef } from 'react';
import { CATEGORIES } from '../data/menuData';
import { CategoryId } from '../types';
import { 
  Flame, 
  Utensils, 
  Sandwich, 
  Pizza, 
  Cookie, 
  CupSoda, 
  Tag 
} from 'lucide-react';

interface CategoryNavProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'all': return <Utensils className="w-3.5 h-3.5" />;
      case 'burgers': return <Flame className="w-3.5 h-3.5" />;
      case 'submarines': return <Sandwich className="w-3.5 h-3.5" />;
      case 'pizza': return <Pizza className="w-3.5 h-3.5" />;
      case 'sides': return <Cookie className="w-3.5 h-3.5" />;
      case 'drinks': return <CupSoda className="w-3.5 h-3.5" />;
      case 'deals': return <Tag className="w-3.5 h-3.5" />;
      default: return <Utensils className="w-3.5 h-3.5" />;
    }
  };

  const handleCategoryClick = (id: CategoryId) => {
    onSelectCategory(id);
    const element = document.getElementById('menu-section');
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="sticky top-[61px] sm:top-[69px] z-30 bg-chonky-bg/90 dark:bg-[#120808]/90 backdrop-blur-xl border-b border-chonky-border/70 dark:border-white/10 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={scrollRef}
          className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`whitespace-nowrap px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-black flex items-center gap-2 transition-all duration-200 shrink-0 select-none ${
                  isSelected
                    ? 'bg-chonky-red text-white shadow-glow-red scale-[1.03]'
                    : 'bg-white dark:bg-white/5 text-chonky-text dark:text-gray-300 hover:bg-chonky-peach-light/70 dark:hover:bg-white/10 border border-chonky-border/80 dark:border-white/10 text-chonky-muted hover:text-chonky-text dark:hover:text-white active:scale-95'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-chonky-red dark:text-chonky-peach'}>
                  {getCategoryIcon(cat.id)}
                </span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
