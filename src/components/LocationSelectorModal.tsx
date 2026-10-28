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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeLocationSelector}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-modal overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-chonky-border/60 bg-chonky-peach-light/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-chonky-red/10 text-chonky-red flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-chonky-text">Delivery Location</h3>
              <p className="text-xs text-chonky-muted">Select where you'd like your order delivered</p>
            </div>
          </div>
          <button 
            onClick={closeLocationSelector}
            className="p-1.5 rounded-full text-chonky-muted hover:text-chonky-text hover:bg-black/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Type Toggle */}
        <div className="p-5 pb-3">
          <div className="grid grid-cols-2 gap-2 p-1 bg-chonky-subtle rounded-xl border border-chonky-border/70">
            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition ${
                orderType === 'delivery'
                  ? 'bg-white text-chonky-red shadow-sm'
                  : 'text-chonky-muted hover:text-chonky-text'
              }`}
            >
              <Bike className="w-4 h-4" />
              Delivery
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition ${
                orderType === 'pickup'
                  ? 'bg-white text-chonky-red shadow-sm'
                  : 'text-chonky-muted hover:text-chonky-text'
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
              <p className="text-xs font-semibold uppercase tracking-wider text-chonky-muted mb-2">
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
                    className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-chonky-red bg-chonky-red/5 ring-1 ring-chonky-red'
                        : 'border-chonky-border hover:border-chonky-red/40 hover:bg-chonky-peach-light/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-chonky-text text-sm sm:text-base">
                          {loc.area}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-chonky-red text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-chonky-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {loc.estTime}
                        </span>
                        <span>•</span>
                        <span>Delivery fee: MVR {loc.deliveryFee}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected 
                        ? 'bg-chonky-red border-chonky-red text-white' 
                        : 'border-chonky-border'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <div className="p-4 rounded-xl bg-chonky-peach/40 border border-chonky-peach-dark/30 text-center">
              <div className="w-10 h-10 rounded-full bg-chonky-red/10 text-chonky-red flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-chonky-text">Chonky Kitchen — Flagship</h4>
              <p className="text-xs text-chonky-muted mt-1 leading-relaxed">
                Roashanee Magu, Henveiru, Malé, Maldives.<br />
                Ready for collection in 15–20 mins after order confirmation.
              </p>
              <button
                onClick={closeLocationSelector}
                className="mt-4 w-full py-2.5 bg-chonky-red text-white text-sm font-semibold rounded-xl hover:bg-chonky-red-light transition"
              >
                Confirm Pickup Store
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-chonky-subtle text-center border-t border-chonky-border text-xs text-chonky-muted">
          Free delivery on all orders above <strong className="text-chonky-text">MVR 350</strong>!
        </div>
      </div>
    </div>
  );
};
