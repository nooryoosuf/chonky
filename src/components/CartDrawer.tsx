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
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#080404] text-chonky-text dark:text-[#F7F3EE] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-chonky-border/70 dark:border-white/10">
        
        {/* Header */}
        <div className="p-5 border-b border-chonky-border dark:border-white/10 flex items-center justify-between bg-chonky-peach-light/40 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-chonky-red text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-chonky-text dark:text-white">Your Crave Cart</h2>
              <p className="text-xs text-chonky-muted dark:text-gray-400">
                {items.length === 0 ? 'No items yet' : `${items.reduce((s, i) => s + i.quantity, 0)} items in bag`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                title="Clear all items"
              >
                Clear
              </button>
            )}
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Free Delivery Progress Meter */}
        {orderType === 'delivery' && items.length > 0 && (
          <div className="bg-chonky-subtle dark:bg-white/5 p-3.5 border-b border-chonky-border/70 dark:border-white/10 text-xs">
            <div className="flex items-center justify-between font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-chonky-text dark:text-white">
                <Bike className="w-4 h-4 text-chonky-red dark:text-chonky-peach" />
                {freeDeliveryRemaining === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    You unlocked FREE Delivery!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-chonky-red dark:text-[#ff6666]">MVR {freeDeliveryRemaining}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-chonky-muted dark:text-gray-400">{Math.round(freeDeliveryPercent)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
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
              <div className="w-20 h-20 rounded-full bg-chonky-peach/50 dark:bg-white/5 flex items-center justify-center text-chonky-red/60 dark:text-chonky-peach">
                <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-chonky-text dark:text-white">Your cart is hungry!</h3>
                <p className="text-xs sm:text-sm text-chonky-muted dark:text-gray-400 mt-1 max-w-xs leading-relaxed">
                  Explore our juicy smash burgers, toasted subs, and hot pizzas to fill it up.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 rounded-full bg-chonky-red text-white text-xs sm:text-sm font-bold hover:bg-chonky-red-light transition shadow-glow-red"
              >
                Browse Menu Now
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-chonky-border/80 dark:border-white/10 bg-white dark:bg-[#0E0606] hover:border-chonky-border dark:hover:border-white/20 transition shadow-xs flex flex-col gap-2.5"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-chonky-subtle dark:bg-black/40"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-sm text-chonky-text dark:text-white leading-snug line-clamp-1 font-sans">
                        {item.productName}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-chonky-muted dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 -mr-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs font-black text-chonky-red dark:text-[#ff6666] mt-0.5">
                      MVR {item.totalPrice}
                    </p>

                    {/* Selected Options & Extras Tags */}
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.selectedOptions.map((opt) => (
                        <span
                          key={opt.groupId}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-chonky-peach-light dark:bg-white/10 text-chonky-text dark:text-gray-300 border border-chonky-peach-dark/30 dark:border-white/10"
                        >
                          {opt.choiceName}
                        </span>
                      ))}
                      {item.selectedExtras.map((extra) => (
                        <span
                          key={extra.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                        >
                          +{extra.name}
                        </span>
                      ))}
                    </div>

                    {item.specialInstructions && (
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400 italic mt-1 bg-chonky-subtle dark:bg-white/5 px-2 py-1 rounded">
                        Note: "{item.specialInstructions}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Edit & Quantity Stepper */}
                <div className="flex items-center justify-between pt-2 border-t border-chonky-border/40 dark:border-white/10">
                  <button
                    onClick={() => {
                      closeCart();
                      openEditCustomizer(item);
                    }}
                    className="text-[11px] font-bold text-chonky-muted dark:text-gray-400 hover:text-chonky-red dark:hover:text-chonky-peach flex items-center gap-1 transition"
                  >
                    <Edit2 className="w-3 h-3" />
                    Customize
                  </button>

                  <div className="flex items-center border border-chonky-border dark:border-white/15 rounded-full bg-chonky-subtle dark:bg-white/10 px-1 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-full bg-white dark:bg-[#160B0B] text-chonky-text dark:text-white hover:bg-chonky-peach flex items-center justify-center transition shadow-xs text-xs"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-chonky-text dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-full bg-white dark:bg-[#160B0B] text-chonky-text dark:text-white hover:bg-chonky-peach flex items-center justify-center transition shadow-xs text-xs"
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
          <div className="p-5 border-t border-chonky-border dark:border-white/10 bg-white dark:bg-[#0A0505] safe-bottom shadow-sheet space-y-3">
            {/* Breakdown */}
            <div className="space-y-1.5 text-xs text-chonky-muted dark:text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-chonky-text dark:text-white">MVR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-chonky-text dark:text-white">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[11px]">Free</span>
                  ) : (
                    `MVR ${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Packaging & Eco-Box</span>
                <span className="font-semibold text-chonky-text dark:text-white">MVR {packagingFee}</span>
              </div>
              <div className="pt-2 border-t border-chonky-border dark:border-white/10 flex justify-between text-base font-black text-chonky-text dark:text-white">
                <span>Total Amount</span>
                <span className="text-chonky-red dark:text-[#ff4d4d]">MVR {total}</span>
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
