import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrderDetails } from '../types';
import { CardBrandRow } from './CardBrandLogos';
import { ChonkyLiveMap } from './ChonkyLiveMap';
import { 
  startDriverGpsTracking, 
  stopDriverTracking, 
  publishDriverLocation,
  CHONKY_KITCHEN_COORDS,
  getDestinationCoordinates
} from '../services/driverLocationService';
import { fetchRoadRoute } from '../services/routingService';
import { 
  X, 
  Bike, 
  Phone, 
  MapPin, 
  Copy, 
  Check, 
  ShoppingBag, 
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Key,
  Maximize2,
  Minimize2,
  Radio,
  Play,
  Square
} from 'lucide-react';

interface OrderTrackingModalProps {
  order: OrderDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: OrderDetails['status']) => void;
  onOrderMore?: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onOrderMore
}) => {
  const [currentStatus, setCurrentStatus] = useState<OrderDetails['status']>(order?.status || 'received');
  const [copiedId, setCopiedId] = useState(false);
  const [isReceiptExpanded, setIsReceiptExpanded] = useState(false);
  const [isFullPageMap, setIsFullPageMap] = useState(false);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(true);
  
  // Real GPS & simulation state
  const [isSharingDeviceGps, setIsSharingDeviceGps] = useState(false);
  const [isSimulatingDrive, setIsSimulatingDrive] = useState(false);
  const [roadEtaMin, setRoadEtaMin] = useState<number | null>(null);
  const [roadDistKm, setRoadDistKm] = useState<number | null>(null);

  const simulationIntervalRef = useRef<number | null>(null);
  const stopGpsWatchRef = useRef<(() => void) | null>(null);

  // Touch Drag gestures for Mobile Bottom Sheet (swipe up to expand, swipe down to compact)
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null && touchCurrentY.current !== null) {
      const deltaY = touchCurrentY.current - touchStartY.current;
      if (deltaY > 40) {
        // Swiped down -> compact
        setIsSheetCollapsed(true);
      } else if (deltaY < -30) {
        // Swiped up -> show full
        setIsSheetCollapsed(false);
      }
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status || 'received');
    }
  }, [order]);

  // Clean up GPS tracking & simulations on unmount or close
  const cleanupTracking = useCallback(() => {
    if (simulationIntervalRef.current !== null) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (stopGpsWatchRef.current) {
      stopGpsWatchRef.current();
      stopGpsWatchRef.current = null;
    }
    setIsSharingDeviceGps(false);
    setIsSimulatingDrive(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      cleanupTracking();
    }
  }, [isOpen, cleanupTracking]);

  // Stop tracking when order completes
  useEffect(() => {
    if (currentStatus === 'delivered') {
      cleanupTracking();
      if (order) {
        stopDriverTracking(order.orderId);
      }
    }
  }, [currentStatus, cleanupTracking, order]);

  if (!isOpen || !order) return null;

  const isDelivery = order.orderType === 'delivery';

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleStatusChange = (status: OrderDetails['status']) => {
    setCurrentStatus(status);
    if (onUpdateStatus) {
      onUpdateStatus(order.orderId, status);
    }
  };

  // 1. Start Real Driver GPS Tracking using browser Geolocation API
  const handleToggleDeviceGps = () => {
    if (isSharingDeviceGps) {
      cleanupTracking();
      return;
    }

    // Stop simulation if running
    if (simulationIntervalRef.current !== null) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
      setIsSimulatingDrive(false);
    }

    handleStatusChange('on_the_way');
    setIsSharingDeviceGps(true);

    const stopFn = startDriverGpsTracking(
      order.orderId,
      () => {},
      (err) => {
        console.warn('Driver device GPS error:', err);
        alert('Could not access device GPS. Please grant location permissions in your browser.');
        setIsSharingDeviceGps(false);
      }
    );
    stopGpsWatchRef.current = stopFn;
  };

  // 2. Start Real OSRM Road Coordinate Waypoint Simulation (for indoor/demo testing)
  const handleToggleSimulation = async () => {
    if (isSimulatingDrive) {
      cleanupTracking();
      return;
    }

    // Stop device GPS if running
    if (stopGpsWatchRef.current) {
      stopGpsWatchRef.current();
      stopGpsWatchRef.current = null;
      setIsSharingDeviceGps(false);
    }

    handleStatusChange('on_the_way');
    setIsSimulatingDrive(true);

    const destCoords = getDestinationCoordinates(order.area, order.address);
    const route = await fetchRoadRoute(CHONKY_KITCHEN_COORDS, destCoords);

    if (!route || route.coordinates.length === 0) {
      setIsSimulatingDrive(false);
      return;
    }

    const waypoints = route.coordinates;
    let step = 0;

    // Publish initial waypoint
    publishDriverLocation({
      orderId: order.orderId,
      longitude: waypoints[0][0],
      latitude: waypoints[0][1],
      isRealGps: true,
      timestamp: Date.now(),
      statusText: 'Driver dispatched on road'
    });

    simulationIntervalRef.current = window.setInterval(() => {
      step++;
      if (step >= waypoints.length) {
        // Arrived at destination
        publishDriverLocation({
          orderId: order.orderId,
          longitude: waypoints[waypoints.length - 1][0],
          latitude: waypoints[waypoints.length - 1][1],
          isRealGps: true,
          timestamp: Date.now(),
          statusText: 'Driver arrived'
        });
        cleanupTracking();
        handleStatusChange('delivered');
        return;
      }

      publishDriverLocation({
        orderId: order.orderId,
        longitude: waypoints[step][0],
        latitude: waypoints[step][1],
        isRealGps: true,
        timestamp: Date.now(),
        statusText: `En route (${Math.round(((step) / waypoints.length) * 100)}%)`
      });
    }, 1500);
  };

  // Status index for progress calculation
  const statusLevels: Record<OrderDetails['status'], number> = {
    received: 1,
    preparing: 2,
    on_the_way: 3,
    delivered: 4
  };

  const activeLevel = statusLevels[currentStatus] || 1;

  // Uber / Grab status copy
  const getHeadline = () => {
    switch (currentStatus) {
      case 'received':
        return 'Order Confirmed';
      case 'preparing':
        return 'Kitchen is Sizzling & Preparing';
      case 'on_the_way':
        return isDelivery ? 'Ali is Heading Your Way' : 'Ready for Counter Pickup';
      case 'delivered':
        return isDelivery ? 'Order Delivered!' : 'Order Collected!';
      default:
        return 'Order Received';
    }
  };

  const getSubHeadline = () => {
    switch (currentStatus) {
      case 'received':
        return 'Kitchen received your crave bag and queued it for the grill.';
      case 'preparing':
        return 'Smashing fresh beef patties & crisping gourmet fries with chef care.';
      case 'on_the_way':
        return isDelivery 
          ? `Hot insulated bag secured. Rider is navigating ${order.area.split(',')[0]} streets.`
          : 'Your warm craving is packaged and ready at the Chonky pickup counter.';
      case 'delivered':
        return 'Enjoy every single bite! Don’t forget to leave a review.';
      default:
        return 'Tracking your order in real time.';
    }
  };

  const getEstimatedMinutes = () => {
    if (currentStatus === 'delivered') return '0';
    if (currentStatus === 'on_the_way' && roadEtaMin !== null) {
      return `${roadEtaMin}`;
    }
    switch (currentStatus) {
      case 'received':
        return isDelivery ? '25–35' : '15–20';
      case 'preparing':
        return isDelivery ? '15–20' : '8–12';
      case 'on_the_way':
        return isDelivery ? '5–10' : 'Ready';
      default:
        return '25–35';
    }
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'bml_pay':
      case 'bml_transfer':
        return 'BML Pay (Instant QR)';
      case 'card':
      case 'card_pos':
        return 'Card on Delivery';
      case 'transfer':
        return 'Bank Transfer (BML MVR)';
      case 'cash':
        return 'Cash on Delivery';
      default:
        return 'Card / Cash';
    }
  };

  // Reusable bottom sheet order contents
  const renderTrackingContent = () => (
    <div className="p-5 sm:p-7 overflow-y-auto space-y-6 overscroll-contain flex-1">
      {/* 1. Uber/Grab Big Arrival Time & Dynamic Headline */}
      <div className="flex items-start justify-between gap-4 pb-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-chonky-text dark:text-white tracking-tight leading-none">
              {getEstimatedMinutes()}
            </span>
            <span className="text-base sm:text-lg font-extrabold text-chonky-muted dark:text-gray-400">
              {currentStatus === 'delivered' ? 'Completed' : 'mins'}
            </span>
            {roadDistKm !== null && currentStatus === 'on_the_way' && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 ml-1">
                {roadDistKm} km away
              </span>
            )}
          </div>
          <h3 className="font-extrabold text-lg sm:text-xl text-chonky-text dark:text-white mt-1.5 leading-snug">
            {getHeadline()}
          </h3>
          <p className="text-xs sm:text-sm text-chonky-muted dark:text-gray-400 mt-1 leading-relaxed">
            {getSubHeadline()}
          </p>
        </div>

        {/* Quick Order ID Badge */}
        <button
          onClick={handleCopyOrderId}
          className="px-3 py-2 rounded-2xl bg-white dark:bg-white/10 border border-chonky-border/80 dark:border-white/15 text-xs font-mono font-bold text-chonky-muted dark:text-gray-300 hover:text-chonky-red transition flex items-center gap-1.5 shrink-0 shadow-2xs active:scale-95"
          title="Copy Order Reference"
        >
          <span>{order.orderId}</span>
          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Uber/Grab Segmented Linear Progress Meter */}
      <div className="py-2 space-y-2.5">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((level) => {
            const isPassed = activeLevel >= level;
            const isCurrent = activeLevel === level;
            return (
              <div 
                key={level}
                className={`h-2.5 rounded-full transition-all duration-500 overflow-hidden ${
                  isPassed 
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-2xs' 
                    : 'bg-gray-200 dark:bg-white/15'
                }`}
              >
                {isCurrent && (
                  <div className="h-full w-full bg-white/40 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400 px-0.5">
          <span className={activeLevel >= 1 ? 'text-emerald-700 dark:text-emerald-400' : ''}>Confirmed</span>
          <span className={activeLevel >= 2 ? 'text-emerald-700 dark:text-emerald-400' : ''}>Preparing</span>
          <span className={activeLevel >= 3 ? 'text-emerald-700 dark:text-emerald-400' : ''}>{isDelivery ? 'On the Way' : 'Ready'}</span>
          <span className={activeLevel >= 4 ? 'text-emerald-700 dark:text-emerald-400' : ''}>Delivered</span>
        </div>
      </div>

      {/* 3. Uber / Grab Courier Driver Card - Generous & Spacious */}
      {isDelivery && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#140C0C] border border-chonky-border/70 dark:border-white/10 shadow-sm flex items-center justify-between gap-4 sm:gap-5 transition-all">
          <div className="flex items-center gap-4 min-w-0">
            {/* Driver Avatar with Vehicle Badge */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-md border-2 border-white dark:border-[#140C0C]">
                AS
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#140C0C] shadow-xs">
                <Bike className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-chonky-text dark:text-white leading-tight">
                  Ali Shafeeq
                </span>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 flex items-center gap-1 shadow-2xs">
                  <span>★</span>
                  <span>4.9</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-chonky-muted dark:text-gray-400 flex-wrap">
                <span>Honda Wave 125</span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 font-mono font-bold text-chonky-text dark:text-gray-200 text-xs tracking-wider">
                  AB1B-1234
                </span>
              </div>
            </div>
          </div>

          {/* Call & WhatsApp Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a
              href="tel:+9607771234"
              className="w-12 h-12 rounded-2xl bg-chonky-subtle dark:bg-white/10 hover:bg-chonky-peach dark:hover:bg-white/15 text-chonky-text dark:text-white flex items-center justify-center transition border border-chonky-border/60 dark:border-white/10 shadow-xs active:scale-95"
              title="Call Driver Ali"
              aria-label="Call Driver Ali"
            >
              <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </a>
            <a
              href={`https://wa.me/9607889900?text=Hi%20Ali%2C%20checking%20on%20my%20Chonky%20order%20${order.orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-xs active:scale-95"
              title="Message on WhatsApp"
              aria-label="Message on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      {/* 5. Grab / Uber Delivery Security PIN Note */}
      <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Key className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <p className="font-extrabold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
              Delivery PIN: <span className="font-mono text-sm sm:text-base tracking-wider underline">4921</span>
            </p>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300 mt-0.5">
              Share with rider upon arrival for contactless handoff
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-200 bg-amber-500/20 px-2.5 py-0.5 rounded-full shrink-0">
          Verified
        </span>
      </div>

      {/* 6. Delivery Address Details */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 text-xs space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-chonky-muted dark:text-gray-400">
          <span className="font-extrabold flex items-center gap-1.5 text-chonky-text dark:text-white uppercase tracking-wider text-[11px]">
            <MapPin className="w-4 h-4 text-chonky-red dark:text-chonky-peach" />
            <span>Delivery Destination</span>
          </span>
          <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
            {order.area}
          </span>
        </div>
        <p className="font-bold text-sm text-chonky-text dark:text-white pt-1">
          {order.address || `${order.area}, Malé City`}
        </p>
        {order.deliveryNotes && (
          <p className="text-xs text-chonky-muted dark:text-gray-400 italic bg-chonky-subtle dark:bg-white/5 p-2.5 rounded-xl border border-chonky-border/50 dark:border-white/5">
            Note: {order.deliveryNotes}
          </p>
        )}
      </div>

      {/* 7. Expandable Order Receipt Drawer */}
      <div className="border border-chonky-border/70 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-[#120808] shadow-sm">
        <button
          type="button"
          onClick={() => setIsReceiptExpanded(!isReceiptExpanded)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-chonky-subtle dark:hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-chonky-peach/60 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-chonky-text dark:text-white block">
                Order Receipt
              </span>
              <span className="text-[11px] text-chonky-muted dark:text-gray-400">
                {order.items.reduce((s, i) => s + i.quantity, 0)} items in bag
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-base text-chonky-red dark:text-[#ff6666]">
              MVR {order.total}
            </span>
            {isReceiptExpanded ? <ChevronUp className="w-4 h-4 text-chonky-muted" /> : <ChevronDown className="w-4 h-4 text-chonky-muted" />}
          </div>
        </button>

        {isReceiptExpanded && (
          <div className="p-4 sm:p-5 pt-0 border-t border-chonky-border/40 dark:border-white/10 space-y-3 text-xs">
            {order.items.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-chonky-border/30 dark:border-white/5 last:border-b-0 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {it.image && (
                    <img 
                      src={it.image} 
                      alt={it.productName} 
                      className="w-10 h-10 rounded-xl object-cover border border-chonky-border/40 shrink-0" 
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-chonky-text dark:text-white truncate">
                      {it.quantity}x {it.productName}
                    </p>
                    {it.selectedOptions?.length > 0 && (
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400 truncate mt-0.5">
                        {it.selectedOptions.map(o => o.choiceName).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-sm text-chonky-text dark:text-white shrink-0">
                  MVR {it.totalPrice}
                </span>
              </div>
            ))}

            {/* Subtotals & Payment Info */}
            <div className="pt-3 space-y-1.5 text-xs text-chonky-muted dark:text-gray-400 border-t border-dashed border-chonky-border/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-chonky-text dark:text-white">MVR {order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-chonky-text dark:text-white">
                  {order.deliveryFee === 0 ? 'Free' : `MVR ${order.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Eco Packaging</span>
                <span className="font-semibold text-chonky-text dark:text-white">MVR {order.packagingFee}</span>
              </div>
              <div className="flex justify-between text-base font-black text-chonky-text dark:text-white pt-2 border-t border-dashed border-chonky-border/50">
                <span>Total Paid</span>
                <span className="text-chonky-red dark:text-[#ff4d4d]">MVR {order.total}</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-chonky-border/40 dark:border-white/10 flex items-center justify-between text-xs">
              <span>Paid With: <strong className="text-chonky-text dark:text-white">{getPaymentName(order.paymentMethod)}</strong></span>
              {order.paymentMethod === 'card' && <CardBrandRow size="xs" />}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-chonky-muted dark:text-gray-400 pt-2 pb-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Bank of Maldives Verified · Live Kitchen POS</span>
      </div>
    </div>
  );

  // Reusable footer buttons
  const renderFooterActions = () => (
    <div className="p-4 sm:p-5 border-t border-chonky-border dark:border-white/10 bg-white/95 dark:bg-[#0A0505]/95 backdrop-blur-xl shrink-0 flex items-center gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom,16px))] sm:pb-5">
      <button
        onClick={handleCopyOrderId}
        className="flex-1 h-[48px] sm:h-[52px] px-4 rounded-full border border-chonky-border dark:border-white/10 hover:bg-chonky-subtle dark:hover:bg-white/5 text-chonky-text dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
      >
        {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        <span>{copiedId ? 'Order Ref Copied!' : 'Copy Order Ref'}</span>
      </button>
      <button
        onClick={() => {
          cleanupTracking();
          if (onOrderMore) onOrderMore();
          onClose();
        }}
        className="flex-1 h-[48px] sm:h-[52px] px-4 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-glow-red active:scale-95"
      >
        <span>Order More Food</span>
        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );

  // =====================================================================
  // VIEW MODE A: FULL PAGE TRACKING VIEW ("you can make the map full page")
  // =====================================================================
  if (isFullPageMap) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#101112] overflow-hidden font-sans">
        {/* Full-Page MapLibre Canvas */}
        <div className="absolute inset-0 z-0">
          <ChonkyLiveMap
            orderId={order.orderId}
            orderStatus={currentStatus}
            customerArea={order.area}
            customerAddress={order.address}
            isFullPage={true}
            onToggleFullPage={() => setIsFullPageMap(false)}
            onRouteCalculated={(distKm, durMin) => {
              setRoadDistKm(distKm);
              setRoadEtaMin(durMin);
            }}
            className="w-full h-full"
          />
        </div>

        {/* Floating Top Header: Close & Back to standard view */}
        <div className="relative z-30 p-3.5 sm:p-4 flex items-center justify-between pointer-events-none">
          <button
            onClick={() => setIsFullPageMap(false)}
            className="px-3.5 py-2 rounded-full bg-[#101112]/90 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/15 flex items-center gap-2 shadow-lg transition active:scale-95 pointer-events-auto"
          >
            <Minimize2 className="w-3.5 h-3.5 text-chonky-peach" />
            <span>Card View</span>
          </button>

          <button
            onClick={() => {
              cleanupTracking();
              onClose();
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#101112]/90 hover:bg-black text-white flex items-center justify-center shadow-lg border border-white/15 transition active:scale-95 pointer-events-auto"
            aria-label="Close tracking"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Spacer to allow full map visibility */}
        <div className="flex-1 pointer-events-none" />

        {/* Floating Uber / Grab Style Slide-Up Bottom Drawer with Drag & Compact/Expand toggle */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`relative z-20 w-full max-w-xl mx-auto bg-[#FAF8F5] dark:bg-[#0A0505] text-chonky-text dark:text-[#F7F3EE] rounded-t-[2.5rem] shadow-2xl border-t border-x border-chonky-border/70 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
            isSheetCollapsed ? 'max-h-[145px] pb-safe' : 'max-h-[70vh] sm:max-h-[64vh]'
          }`}
        >
          {/* Subtle Clean Grab Handle (Draggable & Tappable, No text clutter) */}
          <div
            onClick={() => setIsSheetCollapsed(!isSheetCollapsed)}
            className="w-full pt-3 pb-2 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5 transition"
            aria-label="Drag or tap to toggle order details"
          >
            <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-white/25 hover:bg-gray-400 transition-colors" />
          </div>

          {isSheetCollapsed ? (
            /* Compact Mode: Card with Estimate Time, Headline, Driver Icon, and Call Button */
            <div 
              onClick={() => setIsSheetCollapsed(false)}
              className="px-5 pb-5 pt-1 flex items-center justify-between gap-4 cursor-pointer select-none active:bg-black/5 dark:active:bg-white/5 transition-colors"
            >
              {/* Estimated Time & Dynamic Status Headline */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-chonky-text dark:text-white leading-none tracking-tight">
                    {getEstimatedMinutes()}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-chonky-muted dark:text-gray-400">
                    {currentStatus === 'delivered' ? 'Completed' : 'mins'}
                  </span>
                  {roadDistKm !== null && currentStatus === 'on_the_way' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {roadDistKm} km
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-extrabold text-chonky-text dark:text-white truncate mt-1">
                  {getHeadline()}
                </p>
                <p className="text-[11px] text-chonky-muted dark:text-gray-400 truncate">
                  {isDelivery ? `To ${order.area.split(',')[0]} · Swipe up for full details` : 'Counter Pickup'}
                </p>
              </div>

              {/* Driver Icon & Call Button */}
              {isDelivery ? (
                <div className="flex items-center gap-3 shrink-0">
                  {/* Driver Avatar with Vehicle Badge */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-sm shadow-md border-2 border-white dark:border-[#0A0505]">
                      AS
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#0A0505] shadow-xs">
                      <Bike className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Direct Call Button */}
                  <a
                    href="tel:+9607771234"
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center transition shadow-md shrink-0"
                    title="Call Driver Ali"
                    aria-label="Call Driver Ali"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-chonky-subtle dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              )}
            </div>
          ) : (
            /* Expanded Mode: Full Order Details */
            <>
              {renderTrackingContent()}
              {renderFooterActions()}
            </>
          )}
        </div>
      </div>
    );
  }

  // =====================================================================
  // VIEW MODE B: STANDARD MODAL VIEW (Preserves original card dimensions)
  // =====================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => {
          cleanupTracking();
          onClose();
        }}
      />

      {/* Main Container / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#0A0505] text-chonky-text dark:text-[#F7F3EE] rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-chonky-border/70 dark:border-white/10 max-h-[94vh] flex flex-col">
        
        {/* ========================================================= */}
        {/* TOP SECTION: LIVE MAPLIBRE GL JS TRACKING MAP             */}
        {/* ========================================================= */}
        <div className="relative w-full h-64 sm:h-72 bg-[#101112] overflow-hidden select-none shrink-0 border-b border-chonky-border/70 dark:border-white/10">
          
          {/* Live Interactive MapLibre GL Map */}
          <ChonkyLiveMap
            orderId={order.orderId}
            orderStatus={currentStatus}
            customerArea={order.area}
            customerAddress={order.address}
            isFullPage={false}
            onToggleFullPage={() => setIsFullPageMap(true)}
            onRouteCalculated={(distKm, durMin) => {
              setRoadDistKm(distKm);
              setRoadEtaMin(durMin);
            }}
            className="w-full h-full"
          />

          {/* Close Button Top Right (Clear of vertical map controls) */}
          <button
            onClick={() => {
              cleanupTracking();
              onClose();
            }}
            className="absolute top-3.5 right-3.5 z-30 w-8.5 h-8.5 rounded-full bg-[#101112]/95 hover:bg-black text-gray-200 hover:text-white flex items-center justify-center shadow-lg border border-white/15 transition active:scale-90"
            aria-label="Close tracking"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Expand Full Page Button */}
          <button
            onClick={() => setIsFullPageMap(true)}
            className="absolute bottom-2.5 right-3 z-20 px-2.5 py-1 rounded-xl bg-[#101112]/90 hover:bg-black text-white text-[10.5px] font-extrabold flex items-center gap-1.5 border border-white/15 shadow-md transition active:scale-95"
            title="Open Full Page Live Map"
          >
            <Maximize2 className="w-3 h-3 text-chonky-peach" />
            <span>Full Map</span>
          </button>

          {/* Order Milestones & Live Test Switcher Strip */}
          <div className="absolute bottom-2.5 left-3 z-20 flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 rounded-xl border border-white/10 max-w-[calc(100%-100px)] overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 px-1 text-[8.5px] font-black uppercase text-amber-400 tracking-wider shrink-0">
              <RotateCcw className="w-2.5 h-2.5" />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(['received', 'preparing', 'on_the_way', 'delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-1.5 py-0.5 rounded-lg text-[9.5px] font-extrabold transition-all whitespace-nowrap ${
                    currentStatus === st
                      ? 'bg-chonky-red text-white shadow-xs'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {st === 'received' ? '1. Confirmed' : st === 'preparing' ? '2. Prep 🔥' : st === 'on_the_way' ? '3. En Route 🛵' : '4. Done ✓'}
                </button>
              ))}
            </div>

            {/* Test Drive & Live Device GPS Shortcuts */}
            <div className="flex items-center gap-1 pl-1 ml-0.5 border-l border-white/20 shrink-0">
              <button
                type="button"
                onClick={handleToggleSimulation}
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 transition-all whitespace-nowrap ${
                  isSimulatingDrive ? 'bg-[#E53945] text-white shadow-xs' : 'text-amber-300 hover:text-white hover:bg-white/10'
                }`}
                title="Test Drive along real roads"
              >
                {isSimulatingDrive ? <Square className="w-2 h-2" /> : <Play className="w-2 h-2" />}
                <span>{isSimulatingDrive ? 'Stop' : 'Drive'}</span>
              </button>
              <button
                type="button"
                onClick={handleToggleDeviceGps}
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-black flex items-center gap-1 transition-all whitespace-nowrap ${
                  isSharingDeviceGps ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-400 hover:text-white hover:bg-white/10'
                }`}
                title="Broadcast Device GPS"
              >
                <Radio className="w-2 h-2" />
                <span>{isSharingDeviceGps ? 'GPS On' : 'GPS'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: UBER / GRAB STYLE BOTTOM SHEET TRACKING   */}
        {/* ========================================================= */}
        {renderTrackingContent()}

        {/* Footer Actions */}
        {renderFooterActions()}
      </div>
    </div>
  );
};
