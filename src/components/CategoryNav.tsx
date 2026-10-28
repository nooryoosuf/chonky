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
      case 'all': return <Utensils className="w-4 h-4" />;
      case 'burgers': return <Flame className="w-4 h-4" />;
      case 'submarines': return <Sandwich className="w-4 h-4" />;
      case 'pizza': return <Pizza className="w-4 h-4" />;
      case 'sides': return <Cookie className="w-4 h-4" />;
      case 'drinks': return <CupSoda className="w-4 h-4" />;
      case 'deals': return <Tag className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
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
    <div className="sticky top-[61px] sm:top-[69px] z-30 bg-chonky-bg/95 backdrop-blur-md border-b border-chonky-border/80 shadow-xs py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={scrollRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-chonky-red text-white shadow-sm ring-1 ring-chonky-red transform scale-[1.02]'
                    : 'bg-white text-chonky-text hover:bg-chonky-peach-light/80 border border-chonky-border/70 text-chonky-muted hover:text-chonky-text'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-chonky-red'}>
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
