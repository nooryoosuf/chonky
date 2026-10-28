import React from 'react';
import { Product, CategoryId } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/menuData';
import { Sparkles, SearchX, Flame } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  selectedCategory: CategoryId;
  searchQuery: string;
  onClearSearch: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  searchQuery,
  onClearSearch
}) => {
  // Filter products by search query
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && product.category === selectedCategory;
  });

  // Fan favourites (popular products for top highlight)
  const popularProducts = products.filter(p => p.isPopular);

  return (
    <div id="menu-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* 1. FAN FAVOURITES / WORTH THE CRAVING SECTION (Show only when no search is active and category is 'all') */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1 border-b border-chonky-border pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-chonky-red text-xs font-black uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 fill-chonky-red" />
                <span>Fan Favourites</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-chonky-text tracking-tight font-sans">
                Worth the Craving
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-chonky-muted">
              Most ordered smash burgers, loaded subs, and stone-baked slices
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {popularProducts.slice(0, 4).map((product) => (
              <ProductCard key={`fav-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 2. FULL MENU OR FILTERED SEARCH RESULTS */}
      <section className="space-y-8">
        
        {/* Section Heading & Result count */}
        <div className="flex items-end justify-between border-b border-chonky-border pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-chonky-red text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Artisanal Kitchen</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-chonky-text tracking-tight">
              {searchQuery ? (
                <span>Search Results for "{searchQuery}"</span>
              ) : selectedCategory === 'all' ? (
                'Full Kitchen Menu'
              ) : (
                CATEGORIES.find(c => c.id === selectedCategory)?.name
              )}
            </h2>
          </div>
          <span className="text-xs font-semibold text-chonky-muted">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-chonky-peach/50 text-chonky-red flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-base text-chonky-text">No delicious matches found</h3>
              <p className="text-xs text-chonky-muted mt-1 leading-relaxed">
                We couldn't find anything matching "{searchQuery}". Try searching for burgers, pepperoni, fries or tenders.
              </p>
            </div>
            <button
              onClick={onClearSearch}
              className="px-5 py-2 rounded-full bg-chonky-subtle hover:bg-chonky-peach text-xs font-bold text-chonky-text border border-chonky-border transition"
            >
              Clear Search & Show All
            </button>
          </div>
        ) : selectedCategory === 'all' && !searchQuery ? (
          // Grouped by Category when 'All' is selected
          <div className="space-y-12">
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
              const catProducts = products.filter(p => p.category === cat.id);
              if (catProducts.length === 0) return null;

              return (
                <div key={cat.id} id={`cat-${cat.id}`} className="space-y-4 pt-4 scroll-mt-28">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-chonky-border/60 pb-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-chonky-text tracking-tight">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="text-xs text-chonky-muted">{cat.description}</p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-chonky-muted">
                      {catProducts.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {catProducts.map((prod) => (
                      <ProductCard key={prod.id} product={prod} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat Grid for filtered category or search
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </section>

    </div>
  );
};
