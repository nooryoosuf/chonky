import React, { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { Bike, Flame, Sparkles, ChevronRight, ChevronDown, ChevronUp, X, Radio } from 'lucide-react';

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
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Fluid vertical drag positioning
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartY = useRef<number>(0);
  const startOffsetY = useRef<number>(0);
  const hasMoved = useRef<boolean>(false);

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
        return 'Live GPS active · Drag or minimize';
      case 'preparing':
        return 'Fresh patties on the grill · Drag or minimize';
      case 'delivered':
        return 'Enjoy your meal! Drag or minimize';
      default:
        return `${currentOrder.orderType === 'delivery' ? `Delivery to ${currentOrder.area}` : 'Counter Pickup'}`;
    }
  };

  // =========================================================================
  // VIEW MODE 1: MINIMIZED RECTANGULAR FULL-WIDTH BANNER (Above bottom nav)
  // =========================================================================
  if (isMinimized) {
    const bannerBottomClass = itemCount > 0
      ? 'bottom-[calc(8.4rem+env(safe-area-inset-bottom,8px))] md:bottom-16'
      : 'bottom-[calc(3.85rem+env(safe-area-inset-bottom,10px))] md:bottom-0';

    return (
      <div 
        className={`fixed ${bannerBottomClass} left-0 right-0 w-full z-40 animate-in slide-in-from-bottom duration-200 pointer-events-auto`}
      >
        <div 
          onClick={() => openTracking(currentOrder)}
          className="w-full bg-gradient-to-r from-[#700808] via-[#850B0B] to-[#990D0D] border-t-2 border-[#E53945] shadow-[0_-4px_25px_rgba(229,57,69,0.45)] text-white py-2.5 px-4 sm:px-6 cursor-pointer select-none transition-colors"
          role="button"
          tabIndex={0}
          aria-label="Active order tracking banner. Tap to open live tracking."
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Live Indicator Beacon & Order Status */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
              </span>
              <span className="text-[10.5px] font-mono font-black px-2 py-0.5 rounded-md bg-black/40 text-[#F2E2C7] border border-white/10 shrink-0">
                {currentOrder.orderId}
              </span>
              <span className="text-xs sm:text-sm font-black text-white truncate">
                {getStatusText(currentOrder.status || 'received')}
              </span>
              <span className="hidden sm:inline text-xs text-[#F2E2C7]/80 truncate">
                · {currentOrder.orderType === 'delivery' ? `Delivery to ${currentOrder.area}` : 'Counter Pickup'}
              </span>
            </div>

            {/* Right: Expand to card, Track button & Dismiss */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Expand to Full Card */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                }}
                className="h-8 px-2.5 rounded-lg bg-black/30 hover:bg-black/50 text-[#F2E2C7] flex items-center gap-1 text-[11px] font-bold transition active:scale-95"
                title="Expand to full card"
                aria-label="Expand to full card"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Card</span>
              </button>

              {/* Glowing Track Pill */}
              <div className="h-8 px-3 rounded-lg bg-white text-[#700808] font-black text-xs shadow-sm flex items-center gap-1 hover:bg-[#F2E2C7] transition-colors">
                <span>Track</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3] text-[#700808]" />
              </div>

              {/* Dismiss X */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                className="w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-black/30 flex items-center justify-center transition active:scale-95"
                title="Dismiss banner"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: FULL DRAGGABLE CARD (Can be moved up/down or minimized)
  // =========================================================================
  const bottomPositionClass = itemCount > 0
    ? 'bottom-[calc(9.75rem+env(safe-area-inset-bottom,16px))] sm:bottom-28'
    : 'bottom-[calc(5.25rem+env(safe-area-inset-bottom,14px))] sm:bottom-8';

  // --- Fluid Drag Gesture Handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    dragStartY.current = e.clientY;
    startOffsetY.current = offsetY;
    hasMoved.current = false;
    setIsDragging(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    if (Math.abs(delta) > 5) {
      hasMoved.current = true;
    }

    // Clamp vertical drag: can move up to 75% of viewport height, and down slightly
    const maxUp = -(window.innerHeight * 0.76);
    const maxDown = 35;
    const clamped = Math.min(maxDown, Math.max(maxUp, startOffsetY.current + delta));
    setOffsetY(clamped);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // If dragged strongly downward near bottom boundary, auto-minimize to banner!
    if (offsetY >= 25) {
      setIsMinimized(true);
      setOffsetY(0);
    }
  };

  const handleCardClick = () => {
    if (!hasMoved.current) {
      openTracking(currentOrder);
    }
  };

  return (
    <div 
      className={`fixed ${bottomPositionClass} left-4 right-4 sm:left-auto sm:right-8 sm:w-auto z-40 max-w-md mx-auto sm:max-w-none pointer-events-auto`}
      style={{
        transform: `translate3d(0, ${offsetY}px, 0)`,
        touchAction: 'none',
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)'
      }}
    >
      {/* Outer Glowing Red Card with Fluid Drag Affordance */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardClick}
        className={`relative w-full sm:w-auto bg-gradient-to-r from-[#700808] via-[#8A0A0A] to-[#A30D0D] text-white rounded-3xl sm:rounded-full p-3.5 sm:px-5 sm:py-3.5 shadow-[0_12px_40px_rgba(229,57,69,0.55),0_0_24px_rgba(229,57,69,0.35)] hover:shadow-[0_16px_50px_rgba(229,57,69,0.7),0_0_30px_rgba(229,57,69,0.5)] border-2 border-[#E53945]/80 hover:border-[#E53945] flex items-center justify-between gap-2.5 sm:gap-4 select-none ${
          isDragging ? 'cursor-grabbing scale-[1.02] shadow-[0_20px_50px_rgba(229,57,69,0.75)]' : 'cursor-grab hover:scale-[1.01] active:scale-[0.99]'
        }`}
        role="button"
        tabIndex={0}
        aria-label="View live order tracking map. Drag up or down to reposition."
      >
        {/* Drag Grip Handle Affordance */}
        <div className="flex flex-col gap-1 py-1 opacity-50 shrink-0 cursor-grab active:cursor-grabbing pl-0.5 pr-1">
          <div className="w-1 h-1 rounded-full bg-white" />
          <div className="w-1 h-1 rounded-full bg-white" />
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>

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

        {/* Right Action Buttons: Track, Minimize, Dismiss */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          {/* Glowing Track Live Pill */}
          <div className="px-3.5 py-1.5 rounded-full bg-white text-[#700808] font-black text-xs shadow-md flex items-center gap-1 group-hover:bg-[#F2E2C7] transition-colors pointer-events-none">
            <span>Track</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3] text-[#700808]" />
          </div>

          {/* Minimize Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(true);
            }}
            className="w-7 h-7 rounded-full bg-black/25 hover:bg-black/45 text-white/90 hover:text-white flex items-center justify-center transition active:scale-90"
            title="Minimize to bottom banner"
            aria-label="Minimize to bottom banner"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

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
