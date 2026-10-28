import React from 'react';
import { useCart } from '../context/CartContext';
import { PRODUCTS } from '../data/menuData';
import { Tag, Sparkles, Plus } from 'lucide-react';

export const DealsSection: React.FC = () => {
  const { openCustomizer } = useCart();
  const dealProducts = PRODUCTS.filter(p => p.category === 'deals');

  return (
    <section id="deals-section" className="bg-gradient-to-b from-chonky-peach-light/60 to-chonky-bg border-y border-chonky-peach-dark/30 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-chonky-red text-white text-xs font-black uppercase tracking-wider shadow-glow-red">
              <Tag className="w-3.5 h-3.5" />
              <span>Limited Crave Combos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-chonky-text tracking-tight font-sans">
              Curated Squad Feasts
            </h2>
            <p className="text-xs sm:text-sm text-chonky-muted max-w-lg">
              Designed for sharing, late-night squad cravings, and movie nights. Handpicked with guaranteed savings.
            </p>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-chonky-border text-xs font-black text-chonky-red shadow-xs">
            <Sparkles className="w-4 h-4" />
            <span>Save up to MVR 85 on Combos</span>
          </div>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {dealProducts.map((deal) => (
            <div
              key={deal.id}
              onClick={() => openCustomizer(deal)}
              className="bg-white rounded-[2.5rem] border border-chonky-border/70 p-6 sm:p-7 shadow-card hover:shadow-hover transition-all duration-300 flex flex-col sm:flex-row gap-6 cursor-pointer group hover:-translate-y-1 active:scale-[0.99]"
            >
              {/* Image with Squircle Frame */}
              <div className="relative aspect-[16/10] sm:w-52 sm:aspect-square rounded-[2rem] overflow-hidden bg-chonky-subtle shrink-0">
                <img
                  src={deal.image}
                  alt={deal.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-3 left-3 bg-chonky-red text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-glow-red">
                  Value Deal
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-chonky-text group-hover:text-chonky-red transition-colors font-sans">
                    {deal.name}
                  </h3>
                  <p className="text-xs text-chonky-muted leading-relaxed font-normal">
                    {deal.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-chonky-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-chonky-muted tracking-wider block">
                      Bundle Price
                    </span>
                    <p className="text-2xl font-black text-chonky-red leading-none">
                      MVR {deal.basePrice}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCustomizer(deal);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-chonky-red text-white text-xs font-black hover:bg-chonky-red-light transition-all transform group-hover:scale-105 active:scale-95 shadow-glow-red"
                  >
                    <span>Customize</span>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
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
