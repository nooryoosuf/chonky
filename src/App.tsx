import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryNav } from './components/CategoryNav';
import { ProductGrid } from './components/ProductGrid';
import { DealsSection } from './components/DealsSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { CartDrawer } from './components/CartDrawer';
import { CartBar } from './components/CartBar';
import { CheckoutModal } from './components/CheckoutModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { PRODUCTS } from './data/menuData';
import { CategoryId } from './types';

export function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('menu');

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // reset search when explicitly choosing category
  };

  return (
    <div className="min-h-screen flex flex-col bg-chonky-bg selection:bg-chonky-peach selection:text-chonky-red">
      {/* 1. Sticky Navigation Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* 2. Hero Promotional Carousel */}
      <HeroCarousel onSelectCategory={handleCategorySelect} />

      {/* 3. Horizontal Category Navigation */}
      <CategoryNav
        activeCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
      />

      {/* 4. Main Menu & Food Merchandising */}
      <main className="flex-1">
        <ProductGrid
          products={PRODUCTS}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
        />

        {/* 5. Combos & Deals Section */}
        <DealsSection />

        {/* 6. Editorial Brand Story & About */}
        <AboutSection />
      </main>

      {/* 7. Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ProductDetailSheet />
      <CartDrawer />
      <CartBar />
      <CheckoutModal />
      <LocationSelectorModal />
    </div>
  );
}

export function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;
