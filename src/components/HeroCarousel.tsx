import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HERO_SLIDES } from '../data/menuData';
import { ArrowRight, Flame, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal } from 'lucide-react';
import { CategoryId } from '../types';

interface HeroCarouselProps {
  onSelectCategory: (category: CategoryId) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ 
  onSelectCategory,
  searchQuery = '',
  setSearchQuery 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_DURATION = 5000; // 5 seconds per slide

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Auto-advance timer (pauses on hover or touch)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) nextSlide();
    else if (diff < -40) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleCtaClick = (category: string) => {
    onSelectCategory(category as CategoryId);
    const element = document.getElementById('menu-section');
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({
        top: elementRect - bodyRect - offset,
        behavior: 'smooth'
      });
    }
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section 
      className="w-full pt-3 pb-4 sm:pt-4 sm:pb-6"
      aria-label="Promotions and search"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 1. SEARCH BAR ABOVE HERO (Prominent mobile-first search) */}
        {setSearchQuery && (
          <div className="mb-3.5 sm:mb-4">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-chonky-red dark:text-chonky-peach absolute left-3.5 sm:left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your favorite cravings, burgers, pizza..."
                className="w-full h-11 sm:h-12 pl-10 sm:pl-12 pr-11 rounded-2xl bg-white dark:bg-[#120808] text-xs sm:text-sm font-medium text-chonky-text dark:text-white placeholder:text-chonky-muted dark:placeholder:text-gray-500 border border-chonky-border/80 dark:border-white/10 shadow-xs focus:outline-none focus:ring-2 focus:ring-chonky-red/30 focus:border-chonky-red transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1 rounded-full text-chonky-muted hover:text-chonky-text dark:text-gray-400 dark:hover:text-white transition"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div 
                  className="absolute right-3.5 p-1 text-chonky-muted dark:text-gray-400 pointer-events-none"
                  title="Filter cravings"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. COMPACT 2:4 HORIZONTAL HERO CAROUSEL BANNER */}
        <div
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Banner Card with 2:4 / ~2:1 Horizontal Proportion */}
          <div 
            className="relative w-full h-[175px] xs:h-[185px] sm:h-[215px] md:h-[245px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#700808] via-[#560606] to-[#1c0202] dark:from-[#4a0606] dark:via-[#300303] dark:to-[#0f0101] text-white overflow-hidden shadow-lg border border-white/10 dark:border-chonky-red/30 transition-all duration-300"
          >
            {/* Subtle background ambient blur */}
            <div className="absolute -left-12 -top-12 w-48 h-48 bg-chonky-red/40 rounded-full blur-2xl pointer-events-none" />

            {/* Left Content Area (58% width on mobile, 52% on desktop) */}
            <div className="relative z-10 w-[58%] sm:w-[54%] md:w-[50%] h-full flex flex-col justify-between p-3.5 sm:p-6 md:p-8 select-none">
              
              {/* Top Tag Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-chonky-peach text-[9px] sm:text-[11px] font-black uppercase tracking-wider w-fit shadow-xs">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse shrink-0" />
                <span className="truncate">{slide.tagline}</span>
              </div>

              {/* Middle Headline & Description */}
              <div className="my-auto py-0.5">
                <h2 className="text-sm xs:text-base sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight line-clamp-2 drop-shadow-xs font-sans">
                  {slide.headline}
                </h2>
                <p className="hidden xs:block text-[10px] sm:text-xs text-chonky-peach/90 mt-0.5 sm:mt-1 font-medium line-clamp-1 max-w-sm">
                  {slide.description}
                </p>
              </div>

              {/* Bottom Action Button */}
              <div>
                <button
                  onClick={() => handleCtaClick(slide.category)}
                  className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-chonky-red hover:bg-chonky-peach dark:bg-chonky-peach dark:text-chonky-red font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-all transform hover:scale-102 group/btn"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>

            {/* Right Food Photo Section with Soft Lateral Blend */}
            <div className="absolute right-0 top-0 bottom-0 w-[46%] sm:w-[50%] md:w-[52%] h-full overflow-hidden select-none">
              <img
                src={slide.image}
                alt={slide.headline}
                key={slide.id}
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-all duration-700 ease-out animate-in fade-in"
              />
              
              {/* Soft Gradient Mask Blending Photo Into The Card Background */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-[#700808] via-[#700808]/30 to-transparent pointer-events-none" 
                aria-hidden="true" 
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" 
                aria-hidden="true" 
              />
            </div>

            {/* Desktop Quick Nav Arrows (Visible on hover on desktop) */}
            <div className="hidden sm:flex absolute inset-y-0 left-2 right-2 items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <button
                onClick={prevSlide}
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto transition active:scale-90 border border-white/20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm pointer-events-auto transition active:scale-90 border border-white/20"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Dots Indicator Beneath Banner */}
          <div className="flex items-center justify-center gap-1.5 pt-2 sm:pt-2.5">
            {HERO_SLIDES.map((_, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? 'w-5 sm:w-6 h-1.5 bg-chonky-red dark:bg-chonky-peach'
                      : 'w-1.5 h-1.5 bg-chonky-border dark:bg-white/25 hover:bg-chonky-red/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
