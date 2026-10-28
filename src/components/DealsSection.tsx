import React from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/menuData';
import { Tag, Sparkles, Plus } from 'lucide-react';

export const DealsSection: React.FC = () => {
  const { openCustomizer } = useCart();
  const dealProducts = PRODUCTS.filter(p => p.category === 'deals');

  return (
    <section id="deals-section" className="bg-chonky-peach-light/60 border-y border-chonky-peach-dark/30 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chonky-red text-white text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
              <Tag className="w-3.5 h-3.5" />
              <span>Limited Time Combos</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-chonky-text tracking-tight font-sans">
              Chonky Value Bundles
            </h2>
            <p className="text-xs sm:text-sm text-chonky-muted mt-1">
              Curated crave feasts designed for sharing, late-night squad cravings, and movie nights.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-chonky-red">
            <Sparkles className="w-4 h-4" />
            <span>Save up to MVR 85 on Combos</span>
          </div>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dealProducts.map((deal) => (
            <div
              key={deal.id}
              onClick={() => openCustomizer(deal)}
              className="bg-white rounded-3xl border border-chonky-border/80 p-5 sm:p-6 shadow-card hover:shadow-modal transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] sm:w-48 sm:aspect-square rounded-2xl overflow-hidden bg-chonky-subtle shrink-0">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 bg-chonky-red text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  Value Deal
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-chonky-text group-hover:text-chonky-red transition-colors">
                    {deal.name}
                  </h3>
                  <p className="text-xs text-chonky-muted mt-1.5 leading-relaxed">
                    {deal.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-chonky-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-chonky-muted tracking-wider">
                      Bundle Price
                    </span>
                    <p className="text-xl font-black text-chonky-red leading-none">
                      MVR {deal.basePrice}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCustomizer(deal);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-chonky-red text-white text-xs font-bold hover:bg-chonky-red-light transition shadow-xs group-hover:scale-102"
                  >
                    <span>Customize & Add</span>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
