import React, { useState, useEffect } from 'react';
import { OrderDetails } from '../types';
import { CardBrandRow } from './CardBrandLogos';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Bike, 
  Sparkles, 
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
  RotateCcw
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
  const [isItemsExpanded, setIsItemsExpanded] = useState(true);

  // Sync state if order prop changes
  useEffect(() => {
    if (order) {
      setCurrentStatus(order.status || 'received');
    }
  }, [order]);

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

  // Steps definition
  const steps: {
    id: OrderDetails['status'];
    title: string;
    subtitle: string;
    time: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    glowColor: string;
  }[] = [
    {
      id: 'received',
      title: 'Order Confirmed',
      subtitle: 'Kitchen received your crave bag and sent to queue',
      time: 'Just now',
      icon: CheckCircle2,
      accentColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500',
      glowColor: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
    },
    {
      id: 'preparing',
      title: 'Kitchen Sizzling & Preparing',
      subtitle: 'Smashing fresh beef patties & crisping gourmet fries',
      time: '~10 mins',
      icon: Flame,
      accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500',
      glowColor: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]'
    },
    {
      id: 'on_the_way',
      title: isDelivery ? 'Out for Delivery' : 'Ready for Counter Pickup',
      subtitle: isDelivery 
        ? 'Rider picked up hot bag & heading to your address'
        : 'Your bag is packed hot & waiting at Chonky counter',
      time: '~15 mins',
      icon: isDelivery ? Bike : ShoppingBag,
      accentColor: 'text-blue-500 bg-blue-500/10 border-blue-500',
      glowColor: 'shadow-[0_0_15px_rgba(59,130,246,0.35)]'
    },
    {
      id: 'delivered',
      title: isDelivery ? 'Delivered & Enjoy!' : 'Collected & Enjoy!',
      subtitle: 'Handed over fresh and piping hot. Crave satisfied!',
      time: 'Complete',
      icon: Sparkles,
      accentColor: 'text-emerald-600 bg-emerald-600/10 border-emerald-600',
      glowColor: 'shadow-[0_0_15px_rgba(5,150,105,0.35)]'
    }
  ];

  const statusOrder: OrderDetails['status'][] = ['received', 'preparing', 'on_the_way', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getEstimatedTime = () => {
    switch (currentStatus) {
      case 'received':
        return isDelivery ? '25–35 mins' : '15–20 mins';
      case 'preparing':
        return isDelivery ? '15–20 mins' : '8–12 mins';
      case 'on_the_way':
        return isDelivery ? '5–10 mins' : 'Ready Now';
      case 'delivered':
        return 'Delivered';
      default:
        return '25–35 mins';
    }
  };

  const getPaymentName = (method: string) => {
    switch (method) {
      case 'bml_pay':
      case 'bml_transfer':
        return 'BML Pay (App)';
      case 'card':
      case 'card_pos':
        return 'Card (POS on Delivery)';
      case 'transfer':
        return 'BML Bank Transfer';
      case 'cash':
        return 'Cash on Delivery';
      default:
        return 'Card / Cash';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#0A0505] text-chonky-text dark:text-[#F7F3EE] rounded-t-[2.2rem] sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-chonky-border/70 dark:border-white/10 max-h-[92vh] flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-chonky-border/70 dark:border-white/10 flex items-center justify-between bg-chonky-peach-light/40 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-chonky-red text-white flex items-center justify-center shadow-xs shrink-0">
              <Bike className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-chonky-text dark:text-white leading-tight">
                  Track Order
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs text-chonky-muted dark:text-gray-400">
                  Ref: <strong className="font-mono text-chonky-text dark:text-white">{order.orderId}</strong>
                </p>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 hover:text-chonky-red dark:hover:text-chonky-peach text-chonky-muted dark:text-gray-400 transition"
                  title="Copy Order ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 overscroll-contain flex-1">
          
          {/* Estimated Delivery / Time Hero Card */}
          <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#700808] via-[#8c0c0c] to-[#400404] text-white shadow-lg border border-red-500/20">
            {/* Background glowing rings */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-red-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs mb-1.5">
                  <Clock className="w-3 h-3" />
                  Estimated Arrival
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {getEstimatedTime()}
                </p>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  {isDelivery ? `Dispatching to ${order.area}` : `Pickup at Chonky Kitchen`}
                </p>
              </div>

              {/* Status Graphic & Label (No circle or boundary box, pure icon and text) */}
              <div className="flex flex-col items-center sm:items-end justify-center shrink-0">
                <div className="flex items-center justify-center">
                  {currentStatus === 'received' && <CheckCircle2 className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-300 stroke-[2.3] drop-shadow-md" />}
                  {currentStatus === 'preparing' && <Flame className="w-10 h-10 sm:w-11 sm:h-11 text-amber-300 animate-bounce stroke-[2.3] drop-shadow-md" />}
                  {currentStatus === 'on_the_way' && <Bike className="w-10 h-10 sm:w-11 sm:h-11 text-blue-200 animate-pulse stroke-[2.3] drop-shadow-md" />}
                  {currentStatus === 'delivered' && <Sparkles className="w-10 h-10 sm:w-11 sm:h-11 text-emerald-300 stroke-[2.3] drop-shadow-md" />}
                </div>
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white mt-1.5 drop-shadow-xs">
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Live Progress Bar Indicator */}
            <div className="mt-4 pt-3 border-t border-white/15">
              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-xs"
                  style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/70 font-semibold mt-1.5 px-0.5">
                <span>Received</span>
                <span>Prep 🔥</span>
                <span>En Route 🛵</span>
                <span>Delivered ✓</span>
              </div>
            </div>
          </div>

          {/* Interactive Status Simulation Switcher (Customer Preview / Real-time test) */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-chonky-muted dark:text-gray-400 uppercase tracking-wider text-[10px]">
                Simulate Order Status (Tap to test UI)
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                Live Demo
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {steps.map((st) => {
                const isSelected = currentStatus === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id)}
                    className={`py-1.5 px-1 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'bg-chonky-red text-white shadow-xs ring-2 ring-chonky-red/30 scale-102'
                        : 'bg-white dark:bg-white/10 text-chonky-text dark:text-gray-300 hover:bg-chonky-peach/60 dark:hover:bg-white/15 border border-chonky-border/50 dark:border-white/5'
                    }`}
                  >
                    <span>{st.title.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Timeline Steps with 100% Solid, Opaque Circles */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-1 border-b border-chonky-border/40 dark:border-white/10">
              <h4 className="font-black text-xs uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                Live Order Milestones
              </h4>
              <span className="text-[11px] font-bold text-chonky-red dark:text-chonky-peach">
                Step {currentIndex + 1} of {steps.length}
              </span>
            </div>

            <div className="relative pt-1 pb-1">
              {/* Background Connecting Track Line (Sits behind the solid circles) */}
              <div className="absolute left-[18px] top-4 bottom-4 w-1 bg-gray-200 dark:bg-white/15 z-0 rounded-full" />

              {/* Active Progress Track Line */}
              <div 
                className="absolute left-[18px] top-4 w-1 bg-gradient-to-b from-emerald-500 to-chonky-red z-0 rounded-full transition-all duration-500"
                style={{ 
                  height: `${currentIndex === 0 ? 0 : (currentIndex / (steps.length - 1)) * 100}%`,
                  maxHeight: 'calc(100% - 32px)'
                }}
              />

              <div className="space-y-6 relative z-10">
                {steps.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx < currentIndex;
                  const isCurrent = idx === currentIndex;
                  const isPending = idx > currentIndex;

                  return (
                    <div key={step.id} className="flex items-start gap-3.5">
                      {/* 100% SOLID CIRCLE NODE */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all font-black shadow-xs ring-4 ring-white dark:ring-[#120808] ${
                        isCurrent
                          ? 'bg-chonky-red text-white shadow-md scale-110 ring-chonky-red/25'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 dark:bg-[#251515] text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-white/20'
                      }`}>
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Icon className="w-4 h-4 stroke-[2.3]" />
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-extrabold text-sm ${
                            isCurrent 
                              ? 'text-chonky-red dark:text-chonky-peach' 
                              : isCompleted 
                              ? 'text-chonky-text dark:text-white' 
                              : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {step.title}
                          </span>
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            isCurrent
                              ? 'bg-chonky-red text-white shadow-2xs'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500'
                          }`}>
                            {isCurrent ? 'In Progress' : isCompleted ? 'Completed' : step.time}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 leading-relaxed ${
                          isPending 
                            ? 'text-gray-400 dark:text-gray-600' 
                            : 'text-chonky-muted dark:text-gray-300'
                        }`}>
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Delivery Rider / Kitchen Contact Card */}
          {isDelivery && currentStatus !== 'delivered' && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/80 dark:border-blue-900/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  AS
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-sm text-blue-950 dark:text-blue-100">
                      Ali Shafeeq
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                      ⭐ 4.9 Driver
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-900/70 dark:text-blue-300 mt-0.5 truncate">
                    Honda Wave 125 · Hot Insulated Crave Box
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href="tel:+9607771234"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs text-xs"
                  title="Call Driver"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <a
                  href={`https://wa.me/9607889900?text=Hi%20Chonky%20Kitchen%2C%20checking%20on%20my%20order%20${order.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5 shadow-xs text-xs"
                  title="WhatsApp Support"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </div>
            </div>
          )}

          {/* Delivery Address Details */}
          <div className="p-4 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-chonky-muted dark:text-gray-400 uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5 text-chonky-text dark:text-white">
                <MapPin className="w-3.5 h-3.5 text-chonky-red dark:text-chonky-peach" />
                <span>{isDelivery ? 'Delivery Destination' : 'Counter Pickup Store'}</span>
              </span>
              <span className="text-[10px] bg-chonky-peach/80 text-chonky-red dark:bg-white/10 dark:text-chonky-peach px-2 py-0.5 rounded-full font-black">
                {order.area}
              </span>
            </div>

            <div className="space-y-1 bg-white dark:bg-black/20 p-3 rounded-xl border border-chonky-border/40 dark:border-white/5">
              <p><strong className="text-chonky-text dark:text-white">Customer:</strong> {order.customerName} ({order.customerPhone})</p>
              {order.address && (
                <p><strong className="text-chonky-text dark:text-white">Address:</strong> {order.address}</p>
              )}
              {order.deliveryNotes && (
                <p><strong className="text-chonky-text dark:text-white">Landmark / Note:</strong> {order.deliveryNotes}</p>
              )}
              <div className="pt-1.5 mt-1.5 border-t border-chonky-border/40 dark:border-white/5 flex items-center justify-between">
                <span>Payment: <strong className="text-chonky-text dark:text-white">{getPaymentName(order.paymentMethod)}</strong></span>
                {order.paymentMethod === 'card' && <CardBrandRow size="xs" />}
              </div>
            </div>
          </div>

          {/* Collapsible Order Items */}
          <div className="border border-chonky-border/70 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#120808]">
            <button
              type="button"
              onClick={() => setIsItemsExpanded(!isItemsExpanded)}
              className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left hover:bg-chonky-subtle dark:hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-chonky-red dark:text-chonky-peach" />
                <span className="font-extrabold text-xs sm:text-sm text-chonky-text dark:text-white">
                  Order Items ({order.items.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs text-chonky-red dark:text-[#ff6666]">
                  MVR {order.total}
                </span>
                {isItemsExpanded ? <ChevronUp className="w-4 h-4 text-chonky-muted" /> : <ChevronDown className="w-4 h-4 text-chonky-muted" />}
              </div>
            </button>

            {isItemsExpanded && (
              <div className="p-3.5 sm:p-4 pt-0 border-t border-chonky-border/40 dark:border-white/10 space-y-2 text-xs">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5 border-b border-chonky-border/30 dark:border-white/5 last:border-b-0 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {it.image && (
                        <img 
                          src={it.image} 
                          alt={it.productName} 
                          className="w-9 h-9 rounded-lg object-cover border border-chonky-border/40 shrink-0" 
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-chonky-text dark:text-white truncate">
                          {it.quantity}x {it.productName}
                        </p>
                        {it.selectedOptions?.length > 0 && (
                          <p className="text-[10px] text-chonky-muted dark:text-gray-400 truncate">
                            {it.selectedOptions.map(o => o.choiceName).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-chonky-text dark:text-white shrink-0">
                      MVR {it.totalPrice}
                    </span>
                  </div>
                ))}

                {/* Subtotals */}
                <div className="pt-2 space-y-1 text-[11px] text-chonky-muted dark:text-gray-400">
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
                    <span>Packaging</span>
                    <span className="font-semibold text-chonky-text dark:text-white">MVR {order.packagingFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-chonky-text dark:text-white pt-1.5 border-t border-dashed border-chonky-border/50">
                    <span>Grand Total</span>
                    <span className="text-chonky-red dark:text-[#ff4d4d]">MVR {order.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-chonky-muted dark:text-gray-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Chonky Live Kitchen POS & Dispatch Tracker</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-chonky-border dark:border-white/10 bg-white/95 dark:bg-[#0A0505]/95 backdrop-blur-xl shrink-0 flex items-center gap-3 pb-[max(1.25rem,env(safe-area-inset-bottom,16px))] sm:pb-5">
          <button
            onClick={handleCopyOrderId}
            className="flex-1 h-[48px] sm:h-[52px] px-4 rounded-full border border-chonky-border dark:border-white/10 hover:bg-chonky-subtle dark:hover:bg-white/5 text-chonky-text dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
          >
            {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId ? 'Order ID Copied!' : 'Copy Order ID'}</span>
          </button>
          <button
            onClick={() => {
              if (onOrderMore) onOrderMore();
              onClose();
            }}
            className="flex-1 h-[48px] sm:h-[52px] px-4 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-glow-red active:scale-95"
          >
            <span>Order More Food</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </div>
  );
};
