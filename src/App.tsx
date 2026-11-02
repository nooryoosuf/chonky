import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider } from './context/ProfileContext';
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
import { MobileNavBar } from './components/MobileNavBar';
import { ProfileModal } from './components/ProfileModal';
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
    <div className="relative min-h-screen flex flex-col bg-chonky-bg dark:bg-[#050303] text-chonky-text dark:text-[#F7F3EE] transition-colors duration-500 selection:bg-chonky-peach selection:text-chonky-red">
      
      {/* Subtle Crimson Ambient Background Glows (Active in Dark Mode) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden dark:opacity-100 opacity-0 transition-opacity duration-700">
        {/* Glow 1: Top-Left Ambient Halo */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-chonky-red/16 via-transparent to-transparent blur-[160px]" />
        
        {/* Glow 2: Center-Right Warm Red Flame */}
        <div className="absolute top-[35%] -right-40 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-chonky-red/13 via-transparent to-transparent blur-[160px]" />
        
        {/* Glow 3: Bottom-Left Food Hearth Glow */}
        <div className="absolute top-[75%] -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-chonky-red/10 via-transparent to-transparent blur-[160px]" />
        
        {/* Subtle dot/mesh pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-screen"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
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
        <MobileNavBar />
        <ProfileModal />
        <CheckoutModal />
        <LocationSelectorModal />
      </div>
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
