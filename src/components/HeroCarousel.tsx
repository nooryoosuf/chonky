import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HERO_SLIDES } from '../data/menuData';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { CategoryId } from '../types';

interface HeroCarouselProps {
  onSelectCategory: (category: CategoryId) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelectCategory }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Automatic slide rotation
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

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
    if (diff > 50) {
      // Swiped left -> next
      nextSlide();
    } else if (diff < -50) {
      // Swiped right -> prev
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleCtaClick = (category: string) => {
    onSelectCategory(category as CategoryId);
    const element = document.getElementById('menu-section');
    if (element) {
      const offset = 90;
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
    <section
      className="relative w-full overflow-hidden bg-chonky-text text-white select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Promotional highlights carousel"
    >
      {/* Viewport container with calculated responsive height: ~45vh on desktop, compact on mobile */}
      <div className="relative h-[380px] sm:h-[420px] md:h-[460px] lg:h-[500px] w-full">
        {HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              {/* Background Image with subtle zoom */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.headline}
                  className={`w-full h-full object-cover object-center transform transition-transform duration-10000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {/* Multi-stage dark gradient overlay to guarantee text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/85 via-black/55 to-black/25 md:to-transparent" />
                <div className="absolute inset-0 bg-chonky-red/15 mix-blend-multiply" />
              </div>

              {/* Content Box */}
              <div className="relative max-w-7xl mx-auto h-full px-5 sm:px-8 lg:px-12 flex flex-col justify-end md:justify-center pb-12 md:pb-0">
                <div className="max-w-xl text-left space-y-3 sm:space-y-4">
                  
                  {/* Tagline Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-chonky-peach/90 text-chonky-red text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-chonky-red" />
                    {slide.tagline}
                  </div>

                  {/* Headline */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight sm:leading-tight tracking-tight drop-shadow-sm font-sans">
                    {slide.headline}
                  </h1>

                  {/* Supporting Sentence */}
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 line-clamp-2 sm:line-clamp-none font-medium leading-relaxed">
                    {slide.description}
                  </p>

                  {/* CTA Action Button */}
                  <div className="pt-2 sm:pt-3">
                    <button
                      onClick={() => handleCtaClick(slide.category)}
                      className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-chonky-red text-white text-sm font-bold hover:bg-chonky-red-light transform active:scale-95 transition-all shadow-md group"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls (Arrows) */}
      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm items-center justify-center transition border border-white/20"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm items-center justify-center transition border border-white/20"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators (Dots & category tabs) */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => setCurrentSlide(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentSlide
                ? 'w-7 sm:w-8 h-2 bg-chonky-peach'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}: ${slide.headline}`}
          />
        ))}
      </div>
    </section>
  );
};
