import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { Plus, Flame, Clock, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openCustomizer } = useCart();

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'Bestseller':
        return 'bg-gradient-to-r from-chonky-red to-[#9b1515] text-white shadow-glow-red';
      case 'Chef\'s Pick':
        return 'bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50';
      case 'Hot':
      case 'Spicy':
        return 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm';
      case 'New':
        return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-sm';
      default:
        return 'bg-chonky-peach text-chonky-red';
    }
  };

  return (
    <article
      onClick={() => openCustomizer(product)}
      className="group relative bg-white rounded-[1.75rem] sm:rounded-[2rem] p-3 sm:p-3.5 border border-chonky-border/70 hover:border-chonky-red/30 shadow-card hover:shadow-hover transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1.5 active:scale-[0.99] select-none"
    >
      <div>
        {/* Floating Image Stage with Squircle Frame */}
        <div className="relative aspect-[4/3] w-full rounded-[1.35rem] sm:rounded-[1.5rem] overflow-hidden bg-chonky-subtle">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Badge Pill */}
          {product.badge && (
            <div className="absolute top-2.5 left-2.5">
              <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs ${getBadgeStyle(product.badge)}`}>
                {product.badge === 'Bestseller' && <Flame className="w-3 h-3 fill-current" />}
                {product.badge === 'Chef\'s Pick' && <Sparkles className="w-3 h-3" />}
                {product.badge}
              </span>
            </div>
          )}

          {/* Prep Time Glass Pill */}
          {product.prepTime && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow-xs">
              <Clock className="w-2.5 h-2.5 text-chonky-peach" />
              <span>{product.prepTime}</span>
            </div>
          )}

          {/* Subtle Category Micro-tag */}
          <div className="absolute top-2.5 right-2.5 bg-white/80 backdrop-blur-md text-chonky-text text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            {product.category}
          </div>
        </div>

        {/* Content Box */}
        <div className="pt-3.5 pb-1 px-1 space-y-1.5">
          <h3 className="font-extrabold text-sm sm:text-base text-chonky-text group-hover:text-chonky-red transition-colors line-clamp-1 font-sans">
            {product.name}
          </h3>
          <p className="text-xs text-chonky-muted line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>
        </div>
      </div>

      {/* Bottom Price & Add Action Row */}
      <div className="pt-3 px-1 mt-2 border-t border-chonky-border/50 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-chonky-muted tracking-wider block leading-none">
            MVR
          </span>
          <span className="text-lg sm:text-xl font-black text-chonky-red tracking-tight leading-tight">
            {product.basePrice}
          </span>
        </div>

        {/* Tactile Circular Plus Action Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openCustomizer(product);
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-chonky-peach-light group-hover:bg-chonky-red text-chonky-text group-hover:text-white border border-chonky-border group-hover:border-chonky-red flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 active:scale-90 shadow-xs group-hover:shadow-glow-red"
          aria-label={`Customize and add ${product.name}`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </article>
  );
};
