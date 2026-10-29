import React from 'react';
import { useCart } from '../context/CartContext';
import { DELIVERY_LOCATIONS } from '../data/menuData';
import { MapPin, X, Check, Clock, Bike } from 'lucide-react';

export const LocationSelectorModal: React.FC = () => {
  const { 
    isLocationSelectorOpen, 
    closeLocationSelector, 
    selectedLocation, 
    setSelectedLocation,
    orderType,
    setOrderType 
  } = useCart();

  if (!isLocationSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={closeLocationSelector}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#160D0D] text-chonky-text dark:text-[#F7F3EE] rounded-3xl shadow-modal dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 border border-chonky-border/70 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-chonky-border/60 dark:border-white/10 bg-chonky-peach-light/40 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-chonky-text dark:text-white">Delivery Location</h3>
              <p className="text-xs text-chonky-muted dark:text-gray-400">Select where you'd like your order delivered</p>
            </div>
          </div>
          <button 
            onClick={closeLocationSelector}
            className="p-1.5 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="p-5 pb-3">
          <div className="grid grid-cols-2 gap-2 p-1 bg-chonky-subtle dark:bg-white/5 rounded-2xl border border-chonky-border/70 dark:border-white/10">
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                orderType === 'delivery'
                  ? 'bg-white dark:bg-[#251515] text-chonky-red dark:text-chonky-peach shadow-sm'
                  : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
              }`}
            >
              <Bike className="w-4 h-4" />
              Delivery
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                orderType === 'pickup'
                  ? 'bg-white dark:bg-[#251515] text-chonky-red dark:text-chonky-peach shadow-sm'
                  : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              Pickup (Self)
            </button>
          </div>
        </div>

        {/* Location List */}
        <div className="p-5 pt-2 max-h-[60vh] overflow-y-auto space-y-2">
          {orderType === 'delivery' ? (
            <>
              <p className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400 mb-2">
                Available Delivery Zones
              </p>
              {DELIVERY_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedLocation(loc);
                      closeLocationSelector();
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-1 ring-chonky-red'
                        : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:border-chonky-red/40 hover:bg-chonky-peach-light/30 dark:hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-chonky-text dark:text-white text-sm sm:text-base font-sans">
                          {loc.area}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-chonky-red text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-chonky-muted dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-chonky-peach" />
                          {loc.estTime}
                        </span>
                        <span>•</span>
                        <span>Delivery: MVR {loc.deliveryFee}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected 
                        ? 'bg-chonky-red border-chonky-red text-white' 
                        : 'border-chonky-border dark:border-white/20'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <div className="p-5 rounded-2xl bg-chonky-peach/30 dark:bg-white/5 border border-chonky-peach-dark/30 dark:border-white/10 text-center">
              <div className="w-10 h-10 rounded-full bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-chonky-text dark:text-white">Chonky Kitchen — Flagship</h4>
              <p className="text-xs text-chonky-muted dark:text-gray-300 mt-1 leading-relaxed">
                Roashanee Magu, Henveiru, Malé, Maldives.<br />
                Ready for collection in 15–20 mins after order confirmation.
              </p>
              <button
                onClick={closeLocationSelector}
                className="mt-4 w-full py-2.5 bg-chonky-red text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-chonky-red-light transition shadow-glow-red"
              >
                Confirm Pickup Store
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-chonky-subtle dark:bg-white/5 text-center border-t border-chonky-border dark:border-white/10 text-xs text-chonky-muted dark:text-gray-400">
          Free delivery on all orders above <strong className="text-chonky-text dark:text-white">MVR 350</strong>!
        </div>
      </div>
    </div>
  );
};
