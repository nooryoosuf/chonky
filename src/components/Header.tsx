import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { 
  Search, 
  MapPin, 
  ChevronDown,
  Sparkles,
  User,
  X
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  activeSection: _activeSection,
  setActiveSection: _setActiveSection
}) => {
  const { 
    selectedLocation, 
    openLocationSelector,
    orderType 
  } = useCart();

  const { theme } = useTheme();
  const { openProfile, profile } = useProfile();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-chonky-peach dark:bg-[#120505] text-chonky-text dark:text-chonky-peach text-xs py-1.5 px-4 text-center font-medium border-b border-chonky-peach-dark/30 dark:border-chonky-red/30 flex items-center justify-center gap-2 transition-colors">
        <Sparkles className="w-3.5 h-3.5 text-chonky-red dark:text-amber-400 animate-pulse" />
        <span>Hot fresh smash burgers & stone-baked pizza · Free delivery over MVR 350</span>
        <span className="hidden sm:inline text-chonky-muted dark:text-chonky-peach/70">| Open today 12:00 PM – 1:00 AM</span>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-chonky-bg/95 dark:bg-[#070404]/90 backdrop-blur-md shadow-soft dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-2.5 border-b border-chonky-border/70 dark:border-white/10'
            : 'bg-chonky-bg/80 dark:bg-[#050303]/85 backdrop-blur-sm py-4 border-b border-chonky-border/40 dark:border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Brand Logo & Desktop Location */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Chonky Official Typography Wordmark */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center group select-none py-1"
                aria-label="Chonky Home"
              >
                <img
                  src={theme === 'dark' ? '/chonky-typography-peach.svg' : '/chonky-typography.svg'}
                  alt="CHONKY"
                  className="h-7 sm:h-8 w-auto transform group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                />
              </a>

              {/* Desktop Location Selector */}
              <button
                onClick={openLocationSelector}
                className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-chonky-subtle dark:bg-white/5 hover:bg-chonky-peach-light/70 dark:hover:bg-white/10 border border-chonky-border dark:border-white/10 transition text-left text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-chonky-muted dark:text-gray-400 font-medium">
                    {orderType === 'delivery' ? 'Delivering to' : 'Pick up at'}
                  </span>
                  <span className="font-bold text-chonky-text dark:text-white truncate max-w-[130px]">
                    {orderType === 'delivery' ? selectedLocation.area : 'Malé Kitchen'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-chonky-muted dark:text-gray-400 ml-1" />
              </button>
            </div>

            {/* Middle: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-black text-chonky-text dark:text-gray-200">
              <button
                onClick={() => scrollToSection('menu-section')}
                className="hover:text-chonky-red dark:hover:text-chonky-peach transition relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-chonky-red dark:after:bg-chonky-peach after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('deals-section')}
                className="hover:text-chonky-red dark:hover:text-chonky-peach transition relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-chonky-red dark:after:bg-chonky-peach after:absolute after:bottom-0 after:left-0 after:transition-all flex items-center gap-1.5"
              >
                <span>Deals</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-chonky-red text-white uppercase tracking-wider shadow-xs">
                  Combos
                </span>
              </button>
              <button
                onClick={() => scrollToSection('about-section')}
                className="hover:text-chonky-red dark:hover:text-chonky-peach transition relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-chonky-red dark:after:bg-chonky-peach after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                About Chonky
              </button>
            </nav>

            {/* Right: Search, Theme Toggle & Cart Trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Expandable Search */}
              <div className="relative">
                {isSearchExpanded ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search burgers, pizza, sides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 sm:w-64 pl-9 pr-8 py-2 text-sm bg-white dark:bg-[#1A1111] border border-chonky-red/50 dark:border-chonky-red/40 rounded-full focus:outline-none focus:ring-2 focus:ring-chonky-red/20 text-chonky-text dark:text-white shadow-sm"
                    />
                    <Search className="w-4 h-4 text-chonky-muted dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchExpanded(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 sm:px-3 sm:py-2 rounded-full border border-chonky-border dark:border-white/10 hover:border-chonky-red/40 dark:hover:border-chonky-peach/40 hover:bg-chonky-peach-light/40 dark:hover:bg-white/10 transition flex items-center gap-2 text-chonky-muted dark:text-gray-300 hover:text-chonky-text dark:hover:text-white text-sm"
                    aria-label="Search food"
                  >
                    <Search className="w-4 h-4 text-chonky-text dark:text-gray-200" />
                    <span className="hidden sm:inline text-xs font-semibold">Search</span>
                  </button>
                )}
              </div>

              {/* Mobile Location Pill */}
              <button
                onClick={openLocationSelector}
                className="lg:hidden p-2 rounded-full border border-chonky-border dark:border-white/10 hover:bg-chonky-peach-light/40 dark:hover:bg-white/10 text-chonky-text dark:text-white"
                aria-label="Change location"
              >
                <MapPin className="w-4 h-4 text-chonky-red dark:text-chonky-peach" />
              </button>

              {/* Profile Account Icon Button */}
              <button
                onClick={() => openProfile('overview')}
                className="relative p-2 rounded-full border border-chonky-border dark:border-white/10 hover:border-chonky-red/40 dark:hover:border-chonky-peach/40 hover:bg-chonky-peach-light/50 dark:hover:bg-white/10 transition text-chonky-text dark:text-white flex items-center justify-center shadow-xs active:scale-90"
                aria-label="Open User Profile & Account Settings"
                title="Account, Orders & Loyalty Points"
              >
                <User className="w-4 h-4" />
                {profile.loyaltyPoints > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white dark:border-[#070404]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
