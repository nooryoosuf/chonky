import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HERO_SLIDES } from '../data/menuData';
import { ArrowRight, Flame, Sparkles, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react';
import { CategoryId } from '../types';

interface HeroCarouselProps {
  onSelectCategory: (category: CategoryId) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const SLIDE_DURATION = 6000; // ms

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
  }, []);

  // Smooth progress bar tick
  useEffect(() => {
    if (isPaused) return;

    const interval = 50; // ms
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleCtaClick = (category: string) => {
    onSelectCategory(category as CategoryId);
    const element = document.getElementById('menu-section');
    if (element) {
      const offset = 85;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({
        top: elementRect - bodyRect - offset,
        behavior: 'smooth'
      });
    }
  };

  const slide = HERO_SLIDES[currentSlide];

  // Key perks/tags per slide
  const slideHighlights: Record<number, string[]> = {
    0: ['100% Angus Beef', 'Double Smashed', 'Potato Bun'],
    1: ['Prime Shaved Ribeye', 'Toasted Hearth Roll', 'Real Provolone Melt'],
    2: ['48-hr Sourdough', 'Cupping Pepperoni', 'Hot Honey Drizzle']
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-gradient-to-b from-chonky-peach-light/50 via-chonky-bg to-chonky-bg pt-4 pb-8 sm:pt-6 sm:pb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional highlights carousel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Fluid Carousel Card Container */}
        <div className="relative rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-[#1E1B18] via-[#2A1212] to-[#140606] text-white overflow-hidden shadow-hover border border-white/10 min-h-[460px] sm:min-h-[490px] md:min-h-[520px] flex flex-col justify-between p-6 sm:p-10 md:p-12 transition-all">
          
          {/* Subtle Ambient Radial Glow Behind Food */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-chonky-red/30 rounded-full blur-3xl pointer-events-none -mr-20" />
          <div className="absolute left-10 top-10 w-72 h-72 bg-chonky-peach/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Row: Slide Switcher Tabs with Progress Bars */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
            {/* Slide Category Pills */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              {HERO_SLIDES.map((s, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setProgress(0);
                    }}
                    className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                      isActive
                        ? 'bg-white/15 text-white shadow-xs border border-white/20'
                        : 'bg-black/20 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {/* Live Progress Bar Fill inside active pill */}
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-chonky-peach/20 origin-left transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-chonky-peach' : 'bg-gray-500'}`} />
                      <span className="capitalize">{s.category}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Micro rating & prep pill */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                4.9 / 5.0
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-chonky-peach" />
                25-35m Island Delivery
              </span>
            </div>
          </div>

          {/* Center Stage: Split Grid Layout */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6 sm:py-8 my-auto">
            
            {/* Left Column: Dynamic Typography & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left animate-in fade-in duration-500 key={slide.id}">
              
              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chonky-peach/15 border border-chonky-peach/30 text-chonky-peach text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Flame className="w-3.5 h-3.5 text-chonky-peach animate-pulse" />
                <span>{slide.tagline}</span>
              </div>

              {/* Punchy Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] font-sans">
                {slide.headline}
              </h1>

              {/* Supporting sentence */}
              <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed font-normal">
                {slide.description}
              </p>

              {/* Ingredient Highlight Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {slideHighlights[currentSlide]?.map((hl, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-gray-200 border border-white/10"
                  >
                    {hl}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleCtaClick(slide.category)}
                  className="px-7 py-3.5 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-extrabold text-sm sm:text-base flex items-center gap-3 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-glow-red group"
                >
                  <span>{slide.cta}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => handleCtaClick('all')}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all duration-200 border border-white/15"
                >
                  Explore All Menu
                </button>
              </div>

            </div>

            {/* Right Column: Hero Visual Frame (5 cols) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Layered Decorative Backdrop Pill */}
              <div className="relative w-full max-w-md aspect-square sm:aspect-[4/3] lg:aspect-square rounded-[2.5rem] overflow-hidden p-3 bg-gradient-to-tr from-white/10 to-white/5 border border-white/15 shadow-2xl backdrop-blur-md group">
                
                {/* Photo with subtle hover tilt */}
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                  <img
                    src={slide.image}
                    alt={slide.headline}
                    className="w-full h-full object-cover object-center transform scale-102 group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                  {/* Floating Price Pill */}
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-left">
                    <p className="text-[10px] uppercase font-bold text-chonky-peach tracking-wider">Starting at</p>
                    <p className="text-base font-black text-white">MVR 135</p>
                  </div>

                  {/* Floating Chef Badge */}
                  <div className="absolute top-4 right-4 bg-chonky-red/90 text-white backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-soft">
                    <Sparkles className="w-3 h-3 text-chonky-peach" />
                    <span>Top Rated</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Bottom Bar: Prev/Next Quick Controls & Counter */}
          <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-white font-black text-sm">
                0{currentSlide + 1}
              </span>
              <span>/</span>
              <span className="font-mono">
                0{HERO_SLIDES.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition border border-white/10 active:scale-90"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition border border-white/10 active:scale-90"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
