import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const CartBar: React.FC = () => {
  const { itemCount, subtotal, openCart, isCartOpen, isCheckoutOpen, customizingProduct } = useCart();

  // Hide bar if cart is empty or if modal/drawer is already open
  if (itemCount === 0 || isCartOpen || isCheckoutOpen || customizingProduct) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:hidden safe-bottom bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none">
      <div className="pointer-events-auto max-w-md mx-auto">
        <button
          onClick={openCart}
          className="w-full py-3.5 px-5 rounded-2xl bg-chonky-red text-white font-bold text-sm shadow-sheet flex items-center justify-between active:scale-98 transition transform"
          aria-label={`View cart with ${itemCount} items, total MVR ${subtotal}`}
        >
          {/* Left badge & count */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 bg-chonky-peach text-chonky-red text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            </div>
            <div className="text-left">
              <p className="text-[11px] text-white/80 font-medium leading-none">View Cart</p>
              <p className="text-base font-black text-white leading-tight">MVR {subtotal}</p>
            </div>
          </div>

          {/* Right action */}
          <div className="flex items-center gap-1.5 font-bold text-xs bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-xs">
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
};
