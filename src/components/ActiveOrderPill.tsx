import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Bike, Flame, CheckCircle2, Sparkles, ChevronRight, X } from 'lucide-react';

export const ActiveOrderPill: React.FC = () => {
  const { 
    completedOrder, 
    activeOrder, 
    isCheckoutOpen, 
    isCartOpen, 
    customizingProduct,
    openTracking,
    isTrackingOpen
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
        return <Flame className="w-4 h-4 text-amber-500 animate-bounce" />;
      case 'on_the_way':
        return <Bike className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'delivered':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'Kitchen Preparing 🔥';
      case 'on_the_way':
        return 'Out for Delivery 🛵';
      case 'delivered':
        return 'Delivered 🎉';
      default:
        return 'Order Confirmed ✓';
    }
  };

  return (
    <div className="fixed bottom-18 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-auto z-40 animate-in slide-in-from-bottom duration-300">
      <div 
        onClick={() => openTracking(currentOrder)}
        className="w-full sm:w-auto bg-[#0F0808]/95 dark:bg-[#160B0B]/95 text-white backdrop-blur-xl border border-red-500/30 hover:border-red-500/60 rounded-2xl sm:rounded-full p-2.5 sm:px-4 sm:py-2.5 shadow-2xl flex items-center justify-between gap-3 cursor-pointer group transition-all transform hover:scale-102 active:scale-98"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/50 flex items-center justify-center shrink-0">
            {getStatusIcon(currentOrder.status || 'received')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-red-300">
                {currentOrder.orderId}
              </span>
              <span className="text-[11px] font-black text-white truncate">
                {getStatusText(currentOrder.status || 'received')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 truncate">
              {currentOrder.orderType === 'delivery' ? `To ${currentOrder.area}` : 'Counter Pickup'} · Tap to track live
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span className="hidden sm:inline-block text-[11px] font-extrabold text-chonky-peach group-hover:underline">
            Track Live
          </span>
          <ChevronRight className="w-4 h-4 text-chonky-peach group-hover:translate-x-0.5 transition-transform" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition ml-1"
            title="Dismiss tracker pill"
            aria-label="Dismiss tracker pill"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
