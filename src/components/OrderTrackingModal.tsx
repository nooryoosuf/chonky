import React, { useState, useEffect } from 'react';
import { OrderDetails } from '../types';
import { CardBrandRow } from './CardBrandLogos';
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
  Key
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
          ? 'Hot insulated bag secured. Rider is navigating Malé streets.'
          : 'Your warm craving is packaged and ready at the Chonky pickup counter.';
      case 'delivered':
        return 'Enjoy every single bite! Don’t forget to leave a review.';
      default:
        return 'Tracking your order in real time.';
    }
  };

  const getEstimatedMinutes = () => {
    switch (currentStatus) {
      case 'received':
        return isDelivery ? '25–35' : '15–20';
      case 'preparing':
        return isDelivery ? '15–20' : '8–12';
      case 'on_the_way':
        return isDelivery ? '5–10' : 'Ready';
      case 'delivered':
        return '0';
      default:
        return '25–35';
    }
  };

  // Bike position calculation on vector map curve
  // Route from (300, 75) [Kitchen in Henveiru] -> (100, 120) [Customer address]
  const getRiderCoordinates = () => {
    switch (currentStatus) {
      case 'received':
        return { x: 300, y: 75, angle: -15, label: 'At Kitchen' };
      case 'preparing':
        return { x: 285, y: 72, angle: -25, label: 'Kitchen Hub' };
      case 'on_the_way':
        return { x: 195, y: 88, angle: -30, label: 'En Route · 6 min' };
      case 'delivered':
        return { x: 100, y: 120, angle: 0, label: 'Arrived' };
      default:
        return { x: 300, y: 75, angle: 0, label: 'At Kitchen' };
    }
  };

  const riderPos = getRiderCoordinates();

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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Container / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#0A0505] text-chonky-text dark:text-[#F7F3EE] rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-chonky-border/70 dark:border-white/10 max-h-[94vh] flex flex-col">
        
        {/* ========================================================= */}
        {/* TOP SECTION: UBER / GRAB STYLE LIVE GPS DISPATCH MAP      */}
        {/* ========================================================= */}
        <div className="relative w-full h-56 sm:h-64 bg-[#e5ecf4] dark:bg-[#120B0B] overflow-hidden select-none shrink-0 border-b border-chonky-border/70 dark:border-white/10">
          
          {/* Stylized Vector Map Graphics (Malé Island Grid) */}
          <svg className="w-full h-full object-cover" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Water / Ocean Background */}
            <rect width="400" height="210" fill="currentColor" className="text-[#d8e6f3] dark:text-[#080404]" />

            {/* Stylized Island Landmass Shape (Malé City) */}
            <path
              d="M 35,100 C 45,30 365,25 375,95 C 380,165 355,185 200,185 C 65,185 25,165 35,100 Z"
              fill="currentColor"
              className="text-[#f5f1eb] dark:text-[#180E0E]"
              stroke="currentColor"
              strokeWidth="2"
            />

            {/* Subtle Island Shoreline Wave Glow */}
            <path
              d="M 32,100 C 42,27 368,22 378,95 C 383,167 358,187 200,187 C 62,187 22,167 32,100 Z"
              stroke="#0088cc"
              strokeWidth="1.5"
              strokeOpacity="0.25"
              fill="none"
            />

            {/* Major Street Lines in Malé */}
            {/* Boduthakurufaanu Magu (Ring Road) */}
            <path
              d="M 50,105 C 60,45 350,42 360,100 C 365,155 340,172 200,172 C 75,172 45,155 50,105 Z"
              stroke="currentColor"
              strokeWidth="3.5"
              className="text-white dark:text-[#251515]"
              strokeLinecap="round"
            />

            {/* Majeedhee Magu (Central Main Arterial) */}
            <line x1="55" y1="105" x2="355" y2="100" stroke="currentColor" strokeWidth="3" className="text-white dark:text-[#281616]" />
            
            {/* Ameenee Magu (Southern Arterial) */}
            <line x1="75" y1="140" x2="335" y2="138" stroke="currentColor" strokeWidth="2.5" className="text-white dark:text-[#231313]" />

            {/* Cross Streets (Chaandhanee, Sosun, Orchid, Alikilegefaanu) */}
            <line x1="120" y1="52" x2="115" y2="160" stroke="currentColor" strokeWidth="2" className="text-white/80 dark:text-[#231313]" />
            <line x1="180" y1="46" x2="175" y2="165" stroke="currentColor" strokeWidth="2" className="text-white/80 dark:text-[#231313]" />
            <line x1="240" y1="45" x2="235" y2="163" stroke="currentColor" strokeWidth="2" className="text-white/80 dark:text-[#231313]" />
            <line x1="295" y1="50" x2="290" y2="155" stroke="currentColor" strokeWidth="2" className="text-white/80 dark:text-[#231313]" />

            {/* Street Names Labeling (Uber Style Micro-typography) */}
            <text x="200" y="96" textAnchor="middle" fill="currentColor" className="text-gray-400 dark:text-gray-600 text-[6.5px] font-bold tracking-wider select-none">
              MAJEEDHEE MAGU
            </text>
            <text x="200" y="148" textAnchor="middle" fill="currentColor" className="text-gray-400 dark:text-gray-600 text-[6px] font-bold tracking-wider select-none">
              AMEENEE MAGU
            </text>
            <text x="325" y="42" textAnchor="middle" fill="currentColor" className="text-gray-400 dark:text-gray-600 text-[6px] font-bold tracking-wider select-none">
              HENVEIRU
            </text>
            <text x="85" y="165" textAnchor="middle" fill="currentColor" className="text-gray-400 dark:text-gray-600 text-[6px] font-bold tracking-wider select-none">
              MAAFANNU
            </text>

            {/* Animated Delivery Route from Chonky Kitchen (300, 75) to Customer (100, 120) */}
            {/* Background Route Shadow Line */}
            <path
              d="M 300,75 C 240,65 170,95 100,120"
              stroke="#000000"
              strokeWidth="5"
              strokeOpacity="0.12"
              fill="none"
              strokeLinecap="round"
            />
            {/* Route Outer Track */}
            <path
              d="M 300,75 C 240,65 170,95 100,120"
              stroke="#700808"
              strokeWidth="4"
              strokeOpacity="0.4"
              fill="none"
              strokeLinecap="round"
            />
            {/* Glowing Active Route with Animated Dash Flow */}
            <path
              d="M 300,75 C 240,65 170,95 100,120"
              stroke="#E11D48"
              strokeWidth="3"
              strokeDasharray="6 4"
              fill="none"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.5s" repeatCount="indefinite" />
            </path>

            {/* RESTAURANT PIN: Chonky Kitchen (300, 75) */}
            <g transform="translate(300, 75)">
              {/* Pulsing kitchen beacon */}
              <circle r="12" fill="#700808" fillOpacity="0.25">
                <animate attributeName="r" values="8;16;8" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              {/* Store Base Pin */}
              <circle r="7.5" fill="#700808" stroke="#FFFFFF" strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
              <text x="0" y="2.5" textAnchor="middle" fontSize="6.5" fill="#FFFFFF">🍔</text>
              {/* Label */}
              <rect x="-24" y="-18" width="48" height="11" rx="3.5" fill="#1C0E0E" fillOpacity="0.9" />
              <text x="0" y="-10.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#F7F3EE">
                CHONKY HUB
              </text>
            </g>

            {/* CUSTOMER DESTINATION PIN: (100, 120) */}
            <g transform="translate(100, 120)">
              {/* Arrival ripple */}
              <circle r="14" fill="#059669" fillOpacity="0.2">
                <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Destination Pin */}
              <circle r="8" fill="#059669" stroke="#FFFFFF" strokeWidth="2" filter="drop-shadow(0 2px 5px rgba(0,0,0,0.4))" />
              <text x="0" y="3" textAnchor="middle" fontSize="7" fill="#FFFFFF">📍</text>
              {/* Destination Tag */}
              <rect x="-20" y="-19" width="40" height="11" rx="3.5" fill="#064E3B" fillOpacity="0.9" />
              <text x="0" y="-11.5" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#FFFFFF">
                YOU ({order.area.split(',')[0].slice(0, 7)})
              </text>
            </g>

            {/* LIVE RIDER MARKER (Dynamic Position along path) */}
            <g 
              transform={`translate(${riderPos.x}, ${riderPos.y})`}
              className="transition-all duration-1000 ease-in-out"
            >
              {/* Radar pulse around bike */}
              <circle r="16" fill="#2563EB" fillOpacity="0.25">
                <animate attributeName="r" values="10;20;10" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" />
              </circle>

              {/* Rider Marker Circular Badge */}
              <circle r="10" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="2.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))" />
              <text x="0" y="3.5" textAnchor="middle" fontSize="8">🛵</text>

              {/* Rider Live Callout Tooltip */}
              <g transform="translate(0, -18)">
                <rect x="-30" y="-10" width="60" height="12" rx="4" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
                <text x="0" y="-2" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#FFFFFF">
                  {riderPos.label}
                </text>
              </g>
            </g>
          </svg>

          {/* Floating Map Top Overlays */}
          {/* 1. Live GPS Radar Pill */}
          <div className="absolute top-3.5 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-black/90 backdrop-blur-md shadow-md border border-gray-200 dark:border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute left-3 top-2" />
            <span className="font-extrabold text-[11px] text-gray-900 dark:text-white tracking-wide ml-1.5">
              LIVE GPS
            </span>
            <span className="text-[10px] text-gray-400 font-medium">· Malé Grid</span>
          </div>

          {/* 2. Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-4 w-9 h-9 rounded-full bg-white/95 dark:bg-black/90 backdrop-blur-md text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white flex items-center justify-center shadow-md border border-gray-200 dark:border-white/10 transition active:scale-95"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 3. Demo simulation pill controls at bottom edge of map */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-1 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-1 px-1.5 text-[9px] font-black uppercase text-amber-400 tracking-wider">
              <RotateCcw className="w-3 h-3" />
              <span>Simulate:</span>
            </div>
            <div className="flex items-center gap-1 flex-1 justify-end">
              {(['received', 'preparing', 'on_the_way', 'delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all ${
                    currentStatus === st
                      ? 'bg-chonky-red text-white shadow-xs'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {st === 'received' ? '1. Confirmed' : st === 'preparing' ? '2. Prep 🔥' : st === 'on_the_way' ? '3. En Route 🛵' : '4. Done ✓'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM SECTION: UBER / GRAB STYLE BOTTOM SHEET TRACKING   */}
        {/* ========================================================= */}
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

          {/* 2. Uber/Grab Segmented Linear Progress Meter (With Generous Margins) */}
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

          {/* 3. Uber / Grab Signature Courier Driver Card (Ample Margins & Padding) */}
          {isDelivery && (
            <div className="p-4.5 sm:p-5 rounded-3xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Driver Avatar with Vehicle Badge */}
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-md">
                    AS
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-[#120808]">
                    <Bike className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm sm:text-base text-chonky-text dark:text-white">
                      Ali Shafeeq
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      ★ 4.9
                    </span>
                  </div>
                  <p className="text-xs text-chonky-muted dark:text-gray-400 truncate mt-1">
                    Honda Wave 125 · <strong className="text-chonky-text dark:text-gray-200 font-mono">AB1B-1234</strong>
                  </p>
                </div>
              </div>

              {/* Call & WhatsApp Quick Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="tel:+9607771234"
                  className="w-11 h-11 rounded-full bg-chonky-subtle dark:bg-white/10 hover:bg-chonky-peach text-chonky-text dark:text-white flex items-center justify-center transition border border-chonky-border/60 dark:border-white/10 shadow-xs active:scale-95"
                  title="Call Driver"
                  aria-label="Call Driver Ali"
                >
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </a>
                <a
                  href={`https://wa.me/9607889900?text=Hi%20Ali%2C%20checking%20on%20my%20Chonky%20order%20${order.orderId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-xs active:scale-95"
                  title="Message on WhatsApp"
                  aria-label="Message on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* 4. Grab / Uber Delivery Security PIN Note */}
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

          {/* 5. Delivery Address Details */}
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

          {/* 6. Expandable Order Receipt Drawer (Grab / Uber standard) */}
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

        {/* Footer Actions */}
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
