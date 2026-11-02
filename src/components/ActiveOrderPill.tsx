import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Bike, Flame, Sparkles, ChevronRight, X, Radio } from 'lucide-react';

export const ActiveOrderPill: React.FC = () => {
  const { 
    completedOrder, 
    activeOrder, 
    isCheckoutOpen, 
    isCartOpen, 
    customizingProduct,
    openTracking,
    isTrackingOpen,
    itemCount
  } = useCart();

  const [isDismissed, setIsDismissed] = useState(false);

  // The displayed order is either completedOrder or activeOrder
  const currentOrder = completedOrder || activeOrder;

  // Don't show if dismissed, or if tracking modal / checkout / cart is already open, or no order
  if (isDismissed || !currentOrder || isTrackingOpen || isCheckoutOpen || isCartOpen || customizingProduct) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Flame className="w-5 h-5 text-amber-300 animate-bounce" />;
      case 'on_the_way':
        return <Bike className="w-5 h-5 text-white animate-pulse" />;
      case 'delivered':
        return <Sparkles className="w-5 h-5 text-[#F2E2C7]" />;
      default:
        return <Radio className="w-5 h-5 text-emerald-300 animate-pulse" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Kitchen Sizzling 🔥';
      case 'on_the_way':
        return 'Ali is Heading Your Way 🛵';
      case 'delivered':
        return 'Order Delivered! 🎉';
      default:
        return 'Order Confirmed ✓';
    }
  };

  const getSubText = (status: string) => {
    switch (status) {
      case 'on_the_way':
        return 'Live GPS active · Tap to track route';
      case 'preparing':
        return 'Fresh patties on the grill · Tap to track';
      case 'delivered':
        return 'Enjoy your meal! Tap for receipt';
      default:
        return `${currentOrder.orderType === 'delivery' ? `Delivery to ${currentOrder.area}` : 'Counter Pickup'} · Live Map`;
    }
  };

  // Safe bottom clearance on mobile:
  // If cart bar is visible (itemCount > 0), float above the cart bar; otherwise float comfortably above the mobile bottom navigation bar with ample margin
  const bottomPositionClass = itemCount > 0
    ? 'bottom-[calc(9.75rem+env(safe-area-inset-bottom,16px))] sm:bottom-28'
    : 'bottom-[calc(5.25rem+env(safe-area-inset-bottom,14px))] sm:bottom-8';

  return (
    <div 
      className={`fixed ${bottomPositionClass} left-4 right-4 sm:left-auto sm:right-8 sm:w-auto z-40 max-w-md mx-auto sm:max-w-none animate-in slide-in-from-bottom duration-300 pointer-events-auto`}
    >
      {/* Outer Glowing Red Card */}
      <div 
        onClick={() => openTracking(currentOrder)}
        className="relative w-full sm:w-auto bg-gradient-to-r from-[#700808] via-[#8A0A0A] to-[#A30D0D] text-white rounded-3xl sm:rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-[0_12px_40px_rgba(229,57,69,0.55),0_0_24px_rgba(229,57,69,0.35)] hover:shadow-[0_16px_50px_rgba(229,57,69,0.7),0_0_30px_rgba(229,57,69,0.5)] border-2 border-[#E53945]/80 hover:border-[#E53945] flex items-center justify-between gap-3 sm:gap-4 cursor-pointer group transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        role="button"
        tabIndex={0}
        aria-label="View live order tracking map"
      >
        {/* Left Icon with Live Radar Beacon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-11 h-11 rounded-2xl sm:rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
            {getStatusIcon(currentOrder.status || 'received')}
            
            {/* Live GPS Radar Pulse Beacon */}
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#700808] shadow-xs" />
            </span>
          </div>

          {/* Headline & Subtext */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded-md bg-black/35 text-[#F2E2C7] border border-white/10 shrink-0">
                {currentOrder.orderId}
              </span>
              <span className="text-xs sm:text-sm font-black text-white tracking-tight truncate">
                {getStatusText(currentOrder.status || 'received')}
              </span>
            </div>
            <p className="text-[11px] text-[#F2E2C7]/90 font-medium truncate mt-0.5">
              {getSubText(currentOrder.status || 'received')}
            </p>
          </div>
        </div>

        {/* Right Action Button & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Glowing Track Live Pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-white text-[#700808] font-black text-xs shadow-md flex items-center gap-1 group-hover:bg-[#F2E2C7] transition-colors">
            <span>Track</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3] text-[#700808] group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/45 text-white/80 hover:text-white flex items-center justify-center transition active:scale-90 ml-0.5"
            title="Dismiss tracker popup"
            aria-label="Dismiss tracker popup"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
