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
        return 'bg-chonky-red text-white';
      case 'Chef\'s Pick':
        return 'bg-amber-900 text-amber-50';
      case 'Hot':
      case 'Spicy':
        return 'bg-rose-600 text-white';
      case 'New':
        return 'bg-emerald-800 text-emerald-50';
      default:
        return 'bg-chonky-peach-dark text-chonky-text';
    }
  };

  return (
    <article
      onClick={() => openCustomizer(product)}
      className="group relative bg-white rounded-2xl border border-chonky-border/70 overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Image Container with consistent 4:3 or 16:10 aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-chonky-subtle overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badge Pill */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${getBadgeStyle(product.badge)}`}>
              {product.badge === 'Bestseller' && <Flame className="w-3 h-3" />}
              {product.badge === 'Chef\'s Pick' && <Sparkles className="w-3 h-3" />}
              {product.badge}
            </span>
          </div>
        )}

        {/* Prep Time pill if present */}
        {product.prepTime && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{product.prepTime}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-chonky-text group-hover:text-chonky-red transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-chonky-muted line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Bottom Price & Customize Button */}
        <div className="flex items-center justify-between pt-1 border-t border-chonky-border/40">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-chonky-muted tracking-wider">
              Price
            </span>
            <span className="text-base sm:text-lg font-black text-chonky-red tracking-tight leading-none">
              MVR {product.basePrice}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCustomizer(product);
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-chonky-subtle hover:bg-chonky-red text-chonky-text hover:text-white border border-chonky-border hover:border-chonky-red flex items-center justify-center transition-all duration-200 transform group-hover:bg-chonky-red group-hover:text-white group-hover:border-chonky-red shadow-xs active:scale-95"
            aria-label={`Customize and add ${product.name}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </article>
  );
};
