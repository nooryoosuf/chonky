import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
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
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowLeft 
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
    resetCompletedOrder
  } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

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
      placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: orderType === 'delivery' ? address.trim() : undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentMethod
      });
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
Total: MVR ${completedOrder.total} (${completedOrder.paymentMethod.replace('_', ' ').toUpperCase()})`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 1. ORDER CONFIRMATION VIEW
  if (completedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => {
            resetCompletedOrder();
            closeCheckout();
          }}
        />

        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modal z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="p-6 bg-emerald-50 text-emerald-950 text-center border-b border-emerald-100 relative">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
              Order Received
            </span>
            <h2 className="text-2xl font-black mt-2">Order Confirmed!</h2>
            <p className="text-xs text-emerald-800 mt-1">
              Order Reference: <strong className="font-mono text-emerald-950">{completedOrder.orderId}</strong>
            </p>
          </div>

          {/* Details */}
          <div className="p-6 overflow-y-auto space-y-5 text-sm">
            <div className="p-3.5 rounded-2xl bg-chonky-subtle border border-chonky-border/70 text-xs flex items-center justify-between">
              <div>
                <p className="text-chonky-muted">Estimated Prep & Delivery</p>
                <p className="font-bold text-chonky-text text-sm">
                  {completedOrder.orderType === 'delivery' ? '25–35 minutes' : '15–20 minutes'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-chonky-muted">Status</p>
                <p className="font-bold text-amber-700">Kitchen Preparing 🔥</p>
              </div>
            </div>

            {/* Order Items summary */}
            <div>
              <h4 className="font-bold text-chonky-text mb-2 text-xs uppercase tracking-wider text-chonky-muted">
                Order Items ({completedOrder.items.length})
              </h4>
              <div className="space-y-2 border border-chonky-border rounded-2xl p-3 bg-white">
                {completedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-chonky-border/40 last:border-b-0">
                    <span className="font-medium text-chonky-text">
                      <strong className="text-chonky-red font-bold">{item.quantity}x</strong> {item.productName}
                    </span>
                    <span className="font-bold text-chonky-text">MVR {item.totalPrice}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between font-black text-sm text-chonky-text border-t border-dashed border-chonky-border">
                  <span>Grand Total</span>
                  <span className="text-chonky-red">MVR {completedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-1 text-xs text-chonky-muted bg-chonky-peach-light/40 p-3.5 rounded-2xl border border-chonky-peach-dark/30">
              <p><strong className="text-chonky-text">Customer:</strong> {completedOrder.customerName} ({completedOrder.customerPhone})</p>
              <p><strong className="text-chonky-text">Zone:</strong> {completedOrder.area}</p>
              {completedOrder.address && (
                <p><strong className="text-chonky-text">Address:</strong> {completedOrder.address}</p>
              )}
              {completedOrder.deliveryNotes && (
                <p><strong className="text-chonky-text">Notes:</strong> {completedOrder.deliveryNotes}</p>
              )}
              <p><strong className="text-chonky-text">Payment:</strong> {completedOrder.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            </div>

            {/* Clear Demo Notice */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Customer Preview Mode:</strong> This frontend order flow demonstrates real validation, fee calculations, and persistent cart management. A live kitchen POS or SMS gateway integration would attach to this confirmation trigger.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-chonky-border bg-white flex items-center gap-3">
            <button
              onClick={handleCopySummary}
              className="flex-1 py-3 px-4 rounded-full border border-chonky-border hover:bg-chonky-subtle text-chonky-text font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Summary Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={() => {
                resetCompletedOrder();
                closeCheckout();
              }}
              className="flex-1 py-3 px-4 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-bold text-xs sm:text-sm text-center transition shadow-sm"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCheckout}
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-modal z-10 overflow-hidden animate-in zoom-in-95 duration-250 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-chonky-border flex items-center justify-between bg-chonky-peach-light/40">
          <div className="flex items-center gap-2">
            <button
              onClick={closeCheckout}
              className="p-1 rounded-full text-chonky-muted hover:text-chonky-text hover:bg-black/5"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-extrabold text-lg sm:text-xl text-chonky-text">
              Checkout & Delivery
            </h2>
          </div>
          <button
            onClick={closeCheckout}
            className="p-1.5 rounded-full text-chonky-muted hover:text-chonky-text hover:bg-black/5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-5">
          
          {/* Order Type Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-chonky-muted mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-chonky-subtle rounded-xl border border-chonky-border">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                  orderType === 'delivery'
                    ? 'bg-white text-chonky-red shadow-sm'
                    : 'text-chonky-muted hover:text-chonky-text'
                }`}
              >
                <Bike className="w-4 h-4" />
                Delivery to Door
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                  orderType === 'pickup'
                    ? 'bg-white text-chonky-red shadow-sm'
                    : 'text-chonky-muted hover:text-chonky-text'
                }`}
              >
                <Clock className="w-4 h-4" />
                Store Pickup
              </button>
            </div>
          </div>

          {/* Delivery Location Zone */}
          {orderType === 'delivery' ? (
            <div className="p-3.5 rounded-xl border border-chonky-border bg-chonky-peach-light/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-chonky-red" />
                <div>
                  <p className="text-[11px] text-chonky-muted font-medium">Selected Zone</p>
                  <p className="text-xs sm:text-sm font-bold text-chonky-text">{selectedLocation.area}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openLocationSelector}
                className="text-xs font-bold text-chonky-red hover:underline"
              >
                Change Zone
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl border border-chonky-border bg-chonky-subtle text-xs text-chonky-muted">
              <strong className="text-chonky-text">Chonky Kitchen Pickup:</strong> Roashanee Magu, Henveiru, Malé. Ready in approx 15–20 mins.
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-chonky-muted">
              Contact Information
            </h3>

            <div>
              <label htmlFor="customerName" className="block text-xs font-bold text-chonky-text mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <input
                  id="customerName"
                  type="text"
                  placeholder="e.g. Ahmed Fayaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition ${
                    errors.customerName
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-chonky-border focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20'
                  }`}
                />
                <User className="w-4 h-4 text-chonky-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.customerName && (
                <p className="text-xs font-medium text-rose-600 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-xs font-bold text-chonky-text mb-1">
                Phone Number (for delivery rider) *
              </label>
              <div className="relative">
                <input
                  id="customerPhone"
                  type="tel"
                  placeholder="e.g. 7991234 or +960 7991234"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition ${
                    errors.customerPhone
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-chonky-border focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20'
                  }`}
                />
                <Phone className="w-4 h-4 text-chonky-muted absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.customerPhone && (
                <p className="text-xs font-medium text-rose-600 mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Address Fields (only for Delivery) */}
          {orderType === 'delivery' && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-chonky-muted">
                Delivery Address in {selectedLocation.area}
              </h3>

              <div>
                <label htmlFor="address" className="block text-xs font-bold text-chonky-text mb-1">
                  Road Name, House/Building & Apartment/Floor *
                </label>
                <input
                  id="address"
                  type="text"
                  placeholder="e.g. Ma. Coral Reef, 3rd Floor, Apt 302, Majeedhee Magu"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition ${
                    errors.address
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-200'
                      : 'border-chonky-border focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20'
                  }`}
                />
                {errors.address && (
                  <p className="text-xs font-medium text-rose-600 mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-xs font-bold text-chonky-text mb-1">
                  Delivery Landmark / Gate Code (Optional)
                </label>
                <input
                  id="notes"
                  type="text"
                  placeholder="e.g. Near Redwave Plaza, ring doorbell 302"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-chonky-border focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20 transition"
                />
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-chonky-muted">
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'cash'
                    ? 'border-chonky-red bg-chonky-red/5 ring-1 ring-chonky-red'
                    : 'border-chonky-border hover:bg-chonky-subtle'
                }`}
              >
                <Banknote className="w-5 h-5 text-chonky-red mb-1.5" />
                <span className="font-bold text-xs text-chonky-text">Cash on Delivery</span>
                <span className="text-[10px] text-chonky-muted">Pay driver directly</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bml_transfer')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'bml_transfer'
                    ? 'border-chonky-red bg-chonky-red/5 ring-1 ring-chonky-red'
                    : 'border-chonky-border hover:bg-chonky-subtle'
                }`}
              >
                <QrCode className="w-5 h-5 text-chonky-red mb-1.5" />
                <span className="font-bold text-xs text-chonky-text">BML Transfer / QR</span>
                <span className="text-[10px] text-chonky-muted">Bank of Maldives App</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card_pos')}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'card_pos'
                    ? 'border-chonky-red bg-chonky-red/5 ring-1 ring-chonky-red'
                    : 'border-chonky-border hover:bg-chonky-subtle'
                }`}
              >
                <CreditCard className="w-5 h-5 text-chonky-red mb-1.5" />
                <span className="font-bold text-xs text-chonky-text">Card on Delivery</span>
                <span className="text-[10px] text-chonky-muted">Rider brings POS terminal</span>
              </button>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-4 rounded-2xl bg-chonky-subtle border border-chonky-border space-y-2 text-xs">
            <h4 className="font-bold text-chonky-text uppercase tracking-wider text-[11px]">
              Order Summary ({items.length} items)
            </h4>
            <div className="flex justify-between text-chonky-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-chonky-text">MVR {subtotal}</span>
            </div>
            <div className="flex justify-between text-chonky-muted">
              <span>Delivery Fee ({orderType === 'delivery' ? selectedLocation.area : 'Pickup'})</span>
              <span className="font-semibold text-chonky-text">
                {deliveryFee === 0 ? <span className="text-emerald-700 font-bold uppercase">Free</span> : `MVR ${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between text-chonky-muted">
              <span>Eco-Packaging Fee</span>
              <span className="font-semibold text-chonky-text">MVR {packagingFee}</span>
            </div>
            <div className="pt-2 border-t border-chonky-border flex justify-between text-sm sm:text-base font-black text-chonky-text">
              <span>Final Total</span>
              <span className="text-chonky-red">MVR {total}</span>
            </div>
          </div>

          {/* Sticky Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition shadow-md disabled:opacity-60 active:scale-98"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Order...</span>
                </div>
              ) : (
                <span>Confirm & Place Order · MVR {total}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
