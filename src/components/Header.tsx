import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Search, 
  MapPin, 
  Menu as MenuIcon, 
  X, 
  ChevronDown,
  Sparkles,
  PhoneCall
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
    itemCount, 
    subtotal, 
    openCart, 
    selectedLocation, 
    openLocationSelector,
    orderType 
  } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
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
      <div className="bg-chonky-peach text-chonky-text text-xs py-1.5 px-4 text-center font-medium border-b border-chonky-peach-dark/30 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-chonky-red animate-pulse" />
        <span>Hot fresh smash burgers & stone-baked pizza · Free delivery over MVR 350</span>
        <span className="hidden sm:inline text-chonky-muted">| Open today 12:00 PM – 1:00 AM</span>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-chonky-bg/95 backdrop-blur-md shadow-soft py-2.5 border-b border-chonky-border/70'
            : 'bg-chonky-bg py-4 border-b border-chonky-border/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Left: Mobile hamburger & Logo */}
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-xl text-chonky-text hover:bg-chonky-subtle transition"
                aria-label="Open Navigation Menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>

              {/* Chonky Wordmark Logo */}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-chonky-red flex items-center justify-center text-chonky-peach font-extrabold text-xl sm:text-2xl tracking-tighter shadow-sm transform group-hover:scale-105 transition">
                  C
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-chonky-red uppercase leading-none font-sans">
                    CHONKY
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-chonky-muted leading-tight">
                    Burgers & Subs
                  </span>
                </div>
              </a>

              {/* Desktop Location Selector */}
              <button
                onClick={openLocationSelector}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-chonky-subtle hover:bg-chonky-peach-light/70 border border-chonky-border transition text-left text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-chonky-red/10 text-chonky-red flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-chonky-muted font-medium">
                    {orderType === 'delivery' ? 'Delivering to' : 'Pick up at'}
                  </span>
                  <span className="font-semibold text-chonky-text truncate max-w-[130px]">
                    {orderType === 'delivery' ? selectedLocation.area : 'Malé Kitchen'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-chonky-muted ml-1" />
              </button>
            </div>

            {/* Middle: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-chonky-text">
              <button
                onClick={() => scrollToSection('menu-section')}
                className="hover:text-chonky-red transition relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-chonky-red after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('deals-section')}
                className="hover:text-chonky-red transition relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-chonky-red after:absolute after:bottom-0 after:left-0 after:transition-all flex items-center gap-1.5"
              >
                <span>Deals</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-chonky-red text-white uppercase tracking-wider">
                  Combos
                </span>
              </button>
              <button
                onClick={() => scrollToSection('about-section')}
                className="hover:text-chonky-red transition relative py-1 hover:after:w-full after:w-0 after:h-0.5 after:bg-chonky-red after:absolute after:bottom-0 after:left-0 after:transition-all"
              >
                About Chonky
              </button>
            </nav>

            {/* Right: Search bar & Cart Trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Expandable / In-header Search */}
              <div className="relative">
                {isSearchExpanded ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search burgers, pizza, sides..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-48 sm:w-64 pl-9 pr-8 py-1.5 text-sm bg-white border border-chonky-red/50 rounded-full focus:outline-none focus:ring-2 focus:ring-chonky-red/20 shadow-sm"
                    />
                    <Search className="w-4 h-4 text-chonky-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setIsSearchExpanded(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-chonky-muted hover:text-chonky-text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2 sm:px-3 sm:py-2 rounded-full border border-chonky-border hover:border-chonky-red/40 hover:bg-chonky-peach-light/40 transition flex items-center gap-2 text-chonky-muted hover:text-chonky-text text-sm"
                    aria-label="Search food"
                  >
                    <Search className="w-4 h-4 text-chonky-text" />
                    <span className="hidden sm:inline text-xs font-medium">Search menu</span>
                  </button>
                )}
              </div>

              {/* Mobile Location Pill */}
              <button
                onClick={openLocationSelector}
                className="lg:hidden p-2 rounded-full border border-chonky-border hover:bg-chonky-peach-light/40 text-chonky-text"
                aria-label="Change location"
              >
                <MapPin className="w-4 h-4 text-chonky-red" />
              </button>

              {/* Shopping Cart Button */}
              <button
                onClick={openCart}
                className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-full font-bold text-sm transition-all shadow-sm ${
                  itemCount > 0
                    ? 'bg-chonky-red text-white hover:bg-chonky-red-light transform active:scale-95'
                    : 'bg-chonky-subtle text-chonky-text hover:bg-chonky-peach/60 border border-chonky-border'
                }`}
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-chonky-peach text-chonky-red text-[11px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">
                  {itemCount > 0 ? `MVR ${subtotal}` : 'Cart'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-5 border-b border-chonky-border flex items-center justify-between bg-chonky-peach-light/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-chonky-red flex items-center justify-center text-chonky-peach font-extrabold text-lg">
                  C
                </div>
                <span className="font-extrabold text-xl text-chonky-red tracking-tight">
                  CHONKY
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full text-chonky-muted hover:bg-chonky-subtle"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Location Selector Strip */}
            <div className="p-4 border-b border-chonky-border bg-chonky-subtle">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openLocationSelector();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-chonky-border text-left shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-chonky-red" />
                  <div>
                    <p className="text-[10px] text-chonky-muted uppercase font-bold">Delivery Zone</p>
                    <p className="text-xs font-bold text-chonky-text">{selectedLocation.area}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-chonky-red">Change</span>
              </button>
            </div>

            {/* Navigation links */}
            <div className="p-5 space-y-3 flex-1 overflow-y-auto">
              <button
                onClick={() => scrollToSection('menu-section')}
                className="w-full text-left py-2.5 px-3 rounded-xl font-bold text-chonky-text hover:bg-chonky-peach-light hover:text-chonky-red transition text-base"
              >
                🍔 Full Menu
              </button>
              <button
                onClick={() => scrollToSection('deals-section')}
                className="w-full text-left py-2.5 px-3 rounded-xl font-bold text-chonky-text hover:bg-chonky-peach-light hover:text-chonky-red transition text-base flex items-center justify-between"
              >
                <span>🔥 Value Deals & Combos</span>
                <span className="text-[10px] bg-chonky-red text-white px-2 py-0.5 rounded-full font-bold">
                  Save
                </span>
              </button>
              <button
                onClick={() => scrollToSection('about-section')}
                className="w-full text-left py-2.5 px-3 rounded-xl font-bold text-chonky-text hover:bg-chonky-peach-light hover:text-chonky-red transition text-base"
              >
                📖 About Chonky Story
              </button>

              <div className="pt-6 border-t border-chonky-border/70 space-y-3 text-xs text-chonky-muted">
                <div className="flex items-center gap-2 text-chonky-text font-semibold">
                  <PhoneCall className="w-4 h-4 text-chonky-red" />
                  <span>Call to order: +960 788-9900</span>
                </div>
                <p>Opening hours: Daily 12:00 PM – 1:00 AM</p>
                <p>Malé Kitchen & Delivery Hub</p>
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-4 border-t border-chonky-border bg-chonky-subtle">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCart();
                }}
                className="w-full py-3 bg-chonky-red text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Cart ({itemCount})</span>
                {itemCount > 0 && <span>· MVR {subtotal}</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
