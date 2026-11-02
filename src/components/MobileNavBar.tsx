import React from 'react';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import { Utensils, Tag, ShoppingBag, User } from 'lucide-react';

interface MobileNavBarProps {
  activeTab?: 'menu' | 'deals' | 'cart' | 'profile';
}

export const MobileNavBar: React.FC<MobileNavBarProps> = () => {
  const { itemCount, subtotal, openCart, isCheckoutOpen, customizingProduct } = useCart();
  const { openProfile, closeProfile, isProfileOpen, profile } = useProfile();

  // If product customizer or checkout is full-screen on mobile, we can keep or hide.
  // When modal is open, keep hidden to avoid stacking
  if (customizingProduct || isCheckoutOpen) {
    return null;
  }

  const scrollToMenu = () => {
    if (isProfileOpen) {
      closeProfile();
    }
    setTimeout(() => {
      const el = document.getElementById('menu-section');
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        window.scrollTo({
          top: elementRect - bodyRect - offset,
          behavior: 'smooth'
        });
      }
    }, isProfileOpen ? 50 : 0);
  };

  const scrollToDeals = () => {
    if (isProfileOpen) {
      closeProfile();
    }
    setTimeout(() => {
      const el = document.getElementById('deals-section');
      if (el) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        window.scrollTo({
          top: elementRect - bodyRect - offset,
          behavior: 'smooth'
        });
      }
    }, isProfileOpen ? 50 : 0);
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#080404]/95 backdrop-blur-xl border-t border-chonky-border/70 dark:border-white/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,12px))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
        
        {/* 1. Menu Tab */}
        <button
          onClick={scrollToMenu}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-chonky-muted dark:text-gray-400 hover:text-chonky-red dark:hover:text-chonky-peach active:scale-95 transition"
        >
          <div className="p-1">
            <Utensils className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] font-extrabold tracking-tight">Menu</span>
        </button>

        {/* 2. Deals & Combos Tab */}
        <button
          onClick={scrollToDeals}
          className="relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-chonky-muted dark:text-gray-400 hover:text-chonky-red dark:hover:text-chonky-peach active:scale-95 transition"
        >
          <div className="p-1 relative">
            <Tag className="w-5 h-5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-2 bg-chonky-red text-white text-[8px] font-black px-1 rounded-full animate-pulse">
              HOT
            </span>
          </div>
          <span className="text-[10px] font-extrabold tracking-tight">Deals</span>
        </button>

        {/* 3. Cart Tab */}
        <button
          onClick={openCart}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition active:scale-95 ${
            itemCount > 0 
              ? 'text-chonky-red dark:text-chonky-peach' 
              : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-red dark:hover:text-chonky-peach'
          }`}
        >
          <div className="p-1 relative">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-chonky-red text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs animate-badge-pop">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight">
            {itemCount > 0 ? `MVR ${subtotal}` : 'Cart'}
          </span>
        </button>

        {/* 4. Profile Tab */}
        <button
          onClick={() => openProfile('overview')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition active:scale-95 ${
            isProfileOpen
              ? 'text-chonky-red dark:text-chonky-peach'
              : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-red dark:hover:text-chonky-peach'
          }`}
        >
          <div className="p-1 relative">
            <User className="w-5 h-5 stroke-[2.2]" />
            {profile.loyaltyPoints > 0 && (
              <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#080404]" />
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight">Profile</span>
        </button>

      </div>
    </nav>
  );
};
