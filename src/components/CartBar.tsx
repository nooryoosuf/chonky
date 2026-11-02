import React from 'react';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const CartBar: React.FC = () => {
  const { itemCount, subtotal, openCart, isCartOpen, isCheckoutOpen, customizingProduct } = useCart();
  const { isProfileOpen } = useProfile();

  // Hide bar if cart is empty or if modal/drawer is already open or profile page is active
  if (itemCount === 0 || isCartOpen || isCheckoutOpen || customizingProduct || isProfileOpen) {
    return null;
  }

  return (
    <>
      {/* Soft Bottom Gradient Fade behind floating dock */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-32 pointer-events-none z-30 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-[#050303] dark:via-[#050303]/80 dark:to-transparent" 
        aria-hidden="true" 
      />

      {/* Floating Cart Action Pill with Guaranteed Bottom Clearance on Mobile (comfortably above bottom nav) and Desktop */}
      <aside 
        key={itemCount > 0 ? 'cart-bar-active' : 'cart-bar-empty'}
        className="fixed left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none flex justify-center bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:bottom-8"
        aria-label="Floating cart action"
      >
        <div className="w-full max-w-md sm:max-w-lg pointer-events-auto animate-fluid-cart-pop">
          <button
            onClick={openCart}
            className="w-full h-[60px] sm:h-[66px] px-5 sm:px-6 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black shadow-[0_12px_36px_rgba(112,8,8,0.5)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.9)] flex items-center justify-between active:scale-[0.98] transition-all transform duration-200 border border-white/20 group animate-glow-pulse"
            aria-label={`View cart with ${itemCount} items, total MVR ${subtotal}`}
          >
            {/* Left badge & count */}
            <div className="flex items-center gap-3.5">
              <div className="relative w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span 
                  key={itemCount}
                  className="absolute -top-1 -right-1 bg-chonky-peach text-chonky-red text-[11px] font-black min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center shadow-xs animate-badge-pop"
                >
                  {itemCount}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-white/80 font-bold uppercase tracking-wider leading-none">View Cart</p>
                <p className="text-lg sm:text-xl font-black text-white leading-tight mt-0.5">MVR {subtotal}</p>
              </div>
            </div>

            {/* Right action */}
            <div className="flex items-center gap-2 font-black text-xs sm:text-sm bg-white text-chonky-red px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-xs group-hover:bg-chonky-peach transition-colors shrink-0">
              <span>Checkout</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
