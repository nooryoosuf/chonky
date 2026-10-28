import React from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Bike, 
  Sparkles,
  Edit2
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    openCheckout,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    packagingFee,
    total,
    freeDeliveryThreshold,
    freeDeliveryRemaining,
    openEditCustomizer,
    orderType
  } = useCart();

  if (!isCartOpen) return null;

  const freeDeliveryPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-chonky-border flex items-center justify-between bg-chonky-peach-light/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-chonky-red text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-chonky-text">Your Crave Cart</h2>
              <p className="text-xs text-chonky-muted">
                {items.length === 0 ? 'No items yet' : `${items.reduce((s, i) => s + i.quantity, 0)} items in bag`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 transition"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-chonky-muted hover:text-chonky-text hover:bg-black/5 transition"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Progress Meter */}
        {orderType === 'delivery' && items.length > 0 && (
          <div className="bg-chonky-subtle p-3.5 border-b border-chonky-border/70 text-xs">
            <div className="flex items-center justify-between font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-chonky-text">
                <Bike className="w-4 h-4 text-chonky-red" />
                {freeDeliveryRemaining === 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked FREE Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-chonky-red">MVR {freeDeliveryRemaining}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-chonky-muted">{Math.round(freeDeliveryPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  freeDeliveryRemaining === 0 ? 'bg-emerald-600' : 'bg-chonky-red'
                }`}
                style={{ width: `${freeDeliveryPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item List or Empty State */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-chonky-peach/50 flex items-center justify-center text-chonky-red/60">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-chonky-text">Your cart is hungry!</h3>
                <p className="text-xs sm:text-sm text-chonky-muted mt-1 max-w-xs leading-relaxed">
                  Explore our juicy smash burgers, toasted subs, and hot pizzas to fill it up.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 rounded-full bg-chonky-red text-white text-xs sm:text-sm font-bold hover:bg-chonky-red-light transition shadow-sm"
              >
                Browse Menu Now
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-chonky-border/80 bg-white hover:border-chonky-border transition shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-chonky-subtle"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm text-chonky-text leading-snug line-clamp-1">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-chonky-muted hover:text-rose-600 p-1 -mr-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs font-black text-chonky-red mt-0.5">
                      MVR {item.totalPrice}
                    </p>

                    {/* Selected Options & Extras Tags */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt.groupId}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-chonky-peach-light text-chonky-text border border-chonky-peach-dark/30"
                        >
                          {opt.choiceName}
                        </span>
                      ))}
                      {item.selectedExtras.map((extra) => (
                        <span
                          key={extra.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200"
                        >
                          +{extra.name}
                        </span>
                      ))}
                    </div>

                    {item.specialInstructions && (
                      <p className="text-[11px] text-chonky-muted italic mt-1 bg-chonky-subtle px-2 py-1 rounded">
                        Note: "{item.specialInstructions}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Edit & Quantity Stepper */}
                <div className="flex items-center justify-between pt-2 border-t border-chonky-border/40">
                  <button
                    onClick={() => {
                      closeCart();
                      openEditCustomizer(item);
                    }}
                    className="text-[11px] font-bold text-chonky-muted hover:text-chonky-red flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    Customize
                  </button>

                  <div className="flex items-center border border-chonky-border rounded-full bg-chonky-subtle px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full bg-white text-chonky-text hover:bg-chonky-peach flex items-center justify-center transition shadow-xs text-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-chonky-text">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full bg-white text-chonky-text hover:bg-chonky-peach flex items-center justify-center transition shadow-xs text-xs"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Order Summary & Checkout Trigger */}
        {items.length > 0 && (
          <div className="p-5 border-t border-chonky-border bg-white safe-bottom shadow-sheet space-y-3">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs text-chonky-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-chonky-text">MVR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-chonky-text">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    `MVR ${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Packaging & Eco-Box</span>
                <span className="font-semibold text-chonky-text">MVR {packagingFee}</span>
              </div>
              <div className="pt-2 border-t border-chonky-border flex justify-between text-base font-black text-chonky-text">
                <span>Total Amount</span>
                <span className="text-chonky-red">MVR {total}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={openCheckout}
              className="w-full py-4 px-6 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-sm sm:text-base flex items-center justify-between transition-all transform active:scale-98 shadow-glow-red"
            >
              <span>Proceed to Checkout</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg">MVR {total}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
