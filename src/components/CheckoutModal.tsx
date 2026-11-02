import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import { PaymentMethod } from '../types';
import { 
  X, 
  Bike, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Banknote, 
  QrCode, 
  ArrowRightLeft,
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowLeft,
  ArrowRight 
} from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    items,
    isCheckoutOpen,
    closeCheckout,
    orderType,
    setOrderType,
    selectedLocation,
    openLocationSelector,
    subtotal,
    deliveryFee,
    packagingFee,
    total,
    placeOrder,
    completedOrder,
    resetCompletedOrder,
    paymentMethod: cartPaymentMethod,
    setPaymentMethod: setCartPaymentMethod
  } = useCart();

  const { profile, recordNewOrder } = useProfile();

  // Helper for human-readable payment method
  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method) {
      case 'bml_pay':
        return 'BML Pay';
      case 'card':
      case 'card_pos':
        return 'Card on Delivery';
      case 'cash':
        return 'Cash on Delivery';
      case 'transfer':
      case 'bml_transfer':
        return 'BML Account Transfer';
      default:
        return 'BML Pay';
    }
  };

  // Form states initialized with profile defaults
  const [customerName, setCustomerName] = useState(profile.name);
  const [customerPhone, setCustomerPhone] = useState(profile.phone);
  const defaultAddr = profile.addresses.find(a => a.isDefault) || profile.addresses[0];
  const [address, setAddress] = useState(defaultAddr?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState(defaultAddr?.notes || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(cartPaymentMethod || 'bml_pay');

  // Sync profile & payment method when opened
  useEffect(() => {
    if (isCheckoutOpen) {
      if (!customerName) setCustomerName(profile.name);
      if (!customerPhone) setCustomerPhone(profile.phone);
      if (!address && defaultAddr) {
        setAddress(defaultAddr.address);
        if (defaultAddr.notes) setDeliveryNotes(defaultAddr.notes);
      }
      if (cartPaymentMethod) {
        setPaymentMethod(cartPaymentMethod);
      }
    }
  }, [isCheckoutOpen, profile, cartPaymentMethod]);

  // Validation and Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isCheckoutOpen && !completedOrder) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) {
      errs.customerName = 'Please enter your name.';
    }
    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (!cleanPhone) {
      errs.customerPhone = 'Please enter your contact number.';
    } else if (!/^[0-9+]{7,13}$/.test(cleanPhone)) {
      errs.customerPhone = 'Please enter a valid phone number (e.g. 7xxxxxx or 9xxxxxx).';
    }

    if (orderType === 'delivery') {
      if (!address.trim()) {
        errs.address = 'Please enter road/street and apartment/floor.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate ordering submission
    setTimeout(() => {
      const placed = placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: profile.email,
        address: orderType === 'delivery' ? address.trim() : undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod
      });
      recordNewOrder(placed);
      setIsSubmitting(false);
    }, 900);
  };

  const handleCopySummary = () => {
    if (!completedOrder) return;
    const text = `🍽️ CHONKY ORDER #${completedOrder.orderId}
👤 ${completedOrder.customerName} (${completedOrder.customerPhone})
📍 Type: ${completedOrder.orderType.toUpperCase()} - ${completedOrder.area}
${completedOrder.address ? `🏠 Address: ${completedOrder.address}\n` : ''}
Items:
${completedOrder.items.map(i => `• ${i.quantity}x ${i.productName} (MVR ${i.totalPrice})`).join('\n')}
Total: MVR ${completedOrder.total} (${getPaymentLabel(completedOrder.paymentMethod)})`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 1. ORDER CONFIRMATION VIEW
  if (completedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 font-sans overflow-hidden">
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={() => {
            resetCompletedOrder();
            closeCheckout();
          }}
        />

        <div className="relative w-full max-w-lg bg-white dark:bg-[#080404] text-chonky-text dark:text-[#F7F3EE] rounded-3xl shadow-modal dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col border border-chonky-border/70 dark:border-white/10">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 text-center border-b border-emerald-100 dark:border-emerald-900/40 relative shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-2.5 shadow-md">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100">
              Order Received
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-2">Order Confirmed!</h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
              Order Reference: <strong className="font-mono text-emerald-950 dark:text-emerald-100">{completedOrder.orderId}</strong>
            </p>
          </div>

          {/* Details */}
          <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-5 text-sm overscroll-contain">
            <div className="p-3.5 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10 text-xs flex items-center justify-between">
              <div>
                <p className="text-chonky-muted dark:text-gray-400">Estimated Prep & Delivery</p>
                <p className="font-bold text-chonky-text dark:text-white text-sm">
                  {completedOrder.orderType === 'delivery' ? '25–35 minutes' : '15–20 minutes'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-chonky-muted dark:text-gray-400">Status</p>
                <p className="font-bold text-amber-600 dark:text-amber-400">Kitchen Preparing 🔥</p>
              </div>
            </div>

            {/* Order Items summary */}
            <div>
              <h4 className="font-bold text-chonky-text dark:text-white mb-2 text-xs uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                Order Items ({completedOrder.items.length})
              </h4>
              <div className="space-y-2 border border-chonky-border dark:border-white/10 rounded-2xl p-3 bg-white dark:bg-[#0D0707]">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-chonky-border/40 dark:border-white/10 last:border-b-0">
                    <span className="font-medium text-chonky-text dark:text-gray-200">
                      <strong className="text-chonky-red dark:text-chonky-peach font-bold">{item.quantity}x</strong> {item.productName}
                    </span>
                    <span className="font-bold text-chonky-text dark:text-white">MVR {item.totalPrice}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-black text-sm text-chonky-text dark:text-white border-t border-dashed border-chonky-border dark:border-white/10">
                  <span>Grand Total</span>
                  <span className="text-chonky-red dark:text-[#ff4d4d]">MVR {completedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-1 text-xs text-chonky-muted dark:text-gray-300 bg-chonky-peach-light/40 dark:bg-white/5 p-3.5 rounded-2xl border border-chonky-peach-dark/30 dark:border-white/10">
              <p><strong className="text-chonky-text dark:text-white">Customer:</strong> {completedOrder.customerName} ({completedOrder.customerPhone})</p>
              <p><strong className="text-chonky-text dark:text-white">Zone:</strong> {completedOrder.area}</p>
              {completedOrder.address && (
                <p><strong className="text-chonky-text dark:text-white">Address:</strong> {completedOrder.address}</p>
              )}
              {completedOrder.deliveryNotes && (
                <p><strong className="text-chonky-text dark:text-white">Notes:</strong> {completedOrder.deliveryNotes}</p>
              )}
              <p><strong className="text-chonky-text dark:text-white">Payment:</strong> {getPaymentLabel(completedOrder.paymentMethod)}</p>
            </div>

            {/* Clear Demo Notice */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Customer Preview Mode:</strong> This frontend order flow demonstrates real validation, fee calculations, and persistent cart management. A live kitchen POS or SMS gateway integration would attach to this confirmation trigger.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 p-4 sm:p-5 border-t border-chonky-border dark:border-white/10 bg-white/95 dark:bg-[#0A0505]/95 backdrop-blur-xl flex items-center gap-3">
            <button
              onClick={handleCopySummary}
              className="flex-1 h-[48px] sm:h-[52px] px-4 rounded-full border border-chonky-border dark:border-white/10 hover:bg-chonky-subtle dark:hover:bg-white/5 text-chonky-text dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Summary Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={() => {
                resetCompletedOrder();
                closeCheckout();
              }}
              className="flex-1 h-[48px] sm:h-[52px] px-4 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-bold text-xs sm:text-sm text-center transition shadow-glow-red active:scale-95"
            >
              Order More Food
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. CHECKOUT FORM VIEW
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-5 font-sans overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeCheckout}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#080404] text-chonky-text dark:text-[#F7F3EE] rounded-3xl shadow-modal dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col border border-chonky-border/70 dark:border-white/10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-chonky-border dark:border-white/10 flex items-center justify-between bg-chonky-peach-light/40 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={closeCheckout}
              className="p-1 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-extrabold text-lg sm:text-xl text-chonky-text dark:text-white">
              Checkout & Delivery
            </h2>
          </div>
          <button
            onClick={closeCheckout}
            className="p-1.5 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="checkout-form" onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
          
          {/* Order Type Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-chonky-muted dark:text-gray-400 mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-chonky-subtle dark:bg-white/5 rounded-2xl border border-chonky-border dark:border-white/10">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                  orderType === 'delivery'
                    ? 'bg-white dark:bg-[#160B0B] text-chonky-red dark:text-chonky-peach shadow-sm'
                    : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
                }`}
              >
                <Bike className="w-4 h-4" />
                Delivery to Door
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition ${
                  orderType === 'pickup'
                    ? 'bg-white dark:bg-[#160B0B] text-chonky-red dark:text-chonky-peach shadow-sm'
                    : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                Store Pickup
              </button>
            </div>
          </div>

          {/* Delivery Location Zone */}
          {orderType === 'delivery' ? (
            <div className="p-3.5 rounded-2xl border border-chonky-border dark:border-white/10 bg-chonky-peach-light/20 dark:bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-chonky-red dark:text-chonky-peach" />
                <div>
                  <p className="text-[11px] text-chonky-muted dark:text-gray-400 font-medium">Selected Zone</p>
                  <p className="text-xs sm:text-sm font-bold text-chonky-text dark:text-white">{selectedLocation.area}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openLocationSelector}
                className="text-xs font-bold text-chonky-red dark:text-chonky-peach hover:underline"
              >
                Change Zone
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-chonky-border dark:border-white/10 bg-chonky-subtle dark:bg-white/5 text-xs text-chonky-muted dark:text-gray-300">
              <strong className="text-chonky-text dark:text-white">Chonky Kitchen Pickup:</strong> Roashanee Magu, Henveiru, Malé. Ready in approx 15–20 mins.
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-chonky-muted dark:text-gray-400">
              Contact Information
            </h3>

            <div>
              <label htmlFor="customerName" className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <input
                  id="customerName"
                  type="text"
                  placeholder="e.g. Ahmed Fayaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition bg-white dark:bg-[#0E0707] text-chonky-text dark:text-white placeholder:text-chonky-muted/60 dark:placeholder:text-gray-500 ${
                    errors.customerName
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-chonky-border dark:border-white/15 focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20'
                  }`}
                />
                <User className="w-4 h-4 text-chonky-muted dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.customerName && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                Phone Number (for delivery rider) *
              </label>
              <div className="relative">
                <input
                  id="customerPhone"
                  type="tel"
                  placeholder="e.g. 7991234 or +960 7991234"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition bg-white dark:bg-[#0E0707] text-chonky-text dark:text-white placeholder:text-chonky-muted/60 dark:placeholder:text-gray-500 ${
                    errors.customerPhone
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-chonky-border dark:border-white/15 focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20'
                  }`}
                />
                <Phone className="w-4 h-4 text-chonky-muted dark:text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.customerPhone && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Address Fields (only for Delivery) */}
          {orderType === 'delivery' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                Delivery Address in {selectedLocation.area}
              </h3>

              <div>
                <label htmlFor="address" className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                  Road Name, House/Building & Apartment/Floor *
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="e.g. Ma. Coral Reef, 3rd Floor, Apt 302, Majeedhee Magu"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition bg-white dark:bg-[#0E0707] text-chonky-text dark:text-white placeholder:text-chonky-muted/60 dark:placeholder:text-gray-500 ${
                    errors.address
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-chonky-border dark:border-white/15 focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                  Delivery Landmark / Gate Code (Optional)
                </label>
                <input
                  id="notes"
                  type="text"
                  placeholder="e.g. Near Redwave Plaza, ring doorbell 302"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/15 bg-white dark:bg-[#0E0707] text-chonky-text dark:text-white placeholder:text-chonky-muted/60 dark:placeholder:text-gray-500 focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20 transition"
                />
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-chonky-muted dark:text-gray-400">
              Payment Method
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* 1. BML Pay */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('bml_pay');
                  setCartPaymentMethod('bml_pay');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'bml_pay' || paymentMethod === 'bml_transfer'
                    ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-2 ring-chonky-red shadow-sm'
                    : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:bg-chonky-subtle dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <QrCode className="w-5 h-5 text-chonky-red dark:text-chonky-peach" />
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-red-500 text-white">Fast</span>
                </div>
                <div>
                  <span className="font-extrabold text-xs text-chonky-text dark:text-white block">BML Pay</span>
                  <span className="text-[10px] text-chonky-muted dark:text-gray-400 leading-tight block">App QR Pay</span>
                </div>
              </button>

              {/* 2. Card */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('card');
                  setCartPaymentMethod('card');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'card' || paymentMethod === 'card_pos'
                    ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-2 ring-chonky-red shadow-sm'
                    : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:bg-chonky-subtle dark:hover:bg-white/10'
                }`}
              >
                <CreditCard className="w-5 h-5 text-chonky-red dark:text-chonky-peach mb-1.5" />
                <div>
                  <span className="font-extrabold text-xs text-chonky-text dark:text-white block">Card</span>
                  <span className="text-[10px] text-chonky-muted dark:text-gray-400 leading-tight block">POS on Delivery</span>
                </div>
              </button>

              {/* 3. Cash on Delivery */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cash');
                  setCartPaymentMethod('cash');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'cash'
                    ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-2 ring-chonky-red shadow-sm'
                    : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:bg-chonky-subtle dark:hover:bg-white/10'
                }`}
              >
                <Banknote className="w-5 h-5 text-chonky-red dark:text-chonky-peach mb-1.5" />
                <div>
                  <span className="font-extrabold text-xs text-chonky-text dark:text-white block">Cash on Delivery</span>
                  <span className="text-[10px] text-chonky-muted dark:text-gray-400 leading-tight block">Pay driver directly</span>
                </div>
              </button>

              {/* 4. Transfer */}
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('transfer');
                  setCartPaymentMethod('transfer');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'transfer'
                    ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-2 ring-chonky-red shadow-sm'
                    : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:bg-chonky-subtle dark:hover:bg-white/10'
                }`}
              >
                <ArrowRightLeft className="w-5 h-5 text-chonky-red dark:text-chonky-peach mb-1.5" />
                <div>
                  <span className="font-extrabold text-xs text-chonky-text dark:text-white block">Transfer</span>
                  <span className="text-[10px] text-chonky-muted dark:text-gray-400 leading-tight block">Bank of Maldives</span>
                </div>
              </button>
            </div>

            {/* Contextual instruction for Transfer */}
            {paymentMethod === 'transfer' && (
              <div className="p-3.5 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border dark:border-white/10 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-chonky-text dark:text-white">
                  <span>BML Account Details</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 px-2 py-0.5 rounded-full font-bold">MVR</span>
                </div>
                <p className="text-chonky-muted dark:text-gray-300">Name: <strong className="text-chonky-text dark:text-white">Chonky Burgers MV</strong></p>
                <p className="text-chonky-muted dark:text-gray-300">Account: <strong className="text-chonky-text dark:text-white font-mono text-sm">7730000123456</strong></p>
                <p className="text-[11px] text-chonky-red dark:text-chonky-peach font-medium pt-0.5">Please add your phone number in transfer remarks.</p>
              </div>
            )}

            {/* Contextual instruction for BML Pay */}
            {(paymentMethod === 'bml_pay' || paymentMethod === 'bml_transfer') && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-[10px] shadow-xs shrink-0">
                    BML
                  </div>
                  <div>
                    <p className="font-bold text-chonky-text dark:text-white">Instant BML Mobile Pay</p>
                    <p className="text-[11px] text-chonky-muted dark:text-gray-400">Scan QR or tap to open Bank of Maldives App</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full shrink-0">
                  Instant
                </span>
              </div>
            )}
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border dark:border-white/10 space-y-2 text-xs">
            <h4 className="font-bold text-chonky-text dark:text-white uppercase tracking-wider text-[11px]">
              Order Summary ({items.length} items)
            </h4>
            <div className="flex justify-between text-chonky-muted dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-semibold text-chonky-text dark:text-white">MVR {subtotal}</span>
            </div>
            <div className="flex justify-between text-chonky-muted dark:text-gray-400">
              <span>Delivery Fee ({orderType === 'delivery' ? selectedLocation.area : 'Pickup'})</span>
              <span className="font-semibold text-chonky-text dark:text-white">
                {deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Free</span> : `MVR ${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-chonky-muted dark:text-gray-400">
              <span>Eco-Packaging Fee</span>
              <span className="font-semibold text-chonky-text dark:text-white">MVR {packagingFee}</span>
            </div>
            <div className="pt-2 border-t border-chonky-border dark:border-white/10 flex justify-between text-sm sm:text-base font-black text-chonky-text dark:text-white">
              <span>Final Total</span>
              <span className="text-chonky-red dark:text-[#ff4d4d]">MVR {total}</span>
            </div>
          </div>
        </form>

        {/* Sticky Bottom Action Dock - Clean Equal Margin */}
        <div className="shrink-0 p-4 sm:p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-5 border-t border-chonky-border/70 dark:border-white/10 bg-white/95 dark:bg-[#0A0505]/95 backdrop-blur-xl">
          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting}
            className="w-full h-[54px] sm:h-[56px] px-6 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-sm sm:text-base flex items-center justify-between transition-all transform active:scale-98 shadow-glow-red disabled:opacity-60"
          >
            <span>
              {isSubmitting ? 'Submitting Order...' : 'Confirm & Place Order'}
            </span>
            <div className="flex items-center gap-2">
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="font-black text-base sm:text-lg">MVR {total}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
