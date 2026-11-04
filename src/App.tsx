import { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { ProductGrid } from './components/ProductGrid';
import { DealsSection } from './components/DealsSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { CartDrawer } from './components/CartDrawer';
import { CartBar } from './components/CartBar';
import { ActiveOrderPill } from './components/ActiveOrderPill';
import { MobileNavBar } from './components/MobileNavBar';
import { ProfilePage } from './components/ProfilePage';
import { CheckoutModal } from './components/CheckoutModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { DriverPortal } from './components/DriverPortal';
import { PRODUCTS } from './data/menuData';
import { CategoryId } from './types';

export function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('menu');
  
  const [portalMode, setPortalMode] = useState<'customer' | 'admin' | 'driver'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = window.location.search;
      if (hash === '#driver' || hash === '#rider' || search.includes('driver')) {
        return 'driver';
      }
      if (hash === '#admin' || search.includes('admin')) {
        return 'admin';
      }
    }
    return 'customer';
  });

  const { isProfileOpen, closeProfile } = useProfile();
  const { isTrackingOpen, trackingOrder, closeTracking, updateOrderStatus, openTracking } = useCart();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#driver' || hash === '#rider') {
        setPortalMode('driver');
      } else if (hash === '#admin') {
        setPortalMode('admin');
      } else {
        setPortalMode('customer');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openAdmin = () => {
    window.location.hash = '#admin';
    setPortalMode('admin');
  };

  const openDriver = () => {
    window.location.hash = '#driver';
    setPortalMode('driver');
  };

  const closeToStorefront = () => {
    window.location.hash = '';
    setPortalMode('customer');
  };

  const handleCategorySelect = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // reset search when explicitly choosing category
  };

  // If in Driver Portal mode, show dedicated Rider Delivery App
  if (portalMode === 'driver') {
    return (
      <div className="relative min-h-screen bg-[#07080A]">
        <DriverPortal
          onBackToStorefront={closeToStorefront}
          onOpenAdminHQ={openAdmin}
          onOpenCustomerTracking={(order) => openTracking(order)}
        />
        <OrderTrackingModal
          order={trackingOrder}
          isOpen={isTrackingOpen}
          onClose={closeTracking}
          onUpdateStatus={updateOrderStatus}
          onOrderMore={closeTracking}
        />
      </div>
    );
  }

  // If in Kitchen / Fleet Admin mode, show the full Admin Dashboard
  if (portalMode === 'admin') {
    return (
      <div className="relative min-h-screen bg-[#0A0B0D]">
        <AdminDashboard
          onBackToStorefront={closeToStorefront}
          onOpenCustomerTracking={(order) => openTracking(order)}
          onOpenDriverPortal={openDriver}
        />
        {/* Customer Tracking Modal for admin preview */}
        <OrderTrackingModal
          order={trackingOrder}
          isOpen={isTrackingOpen}
          onClose={closeTracking}
          onUpdateStatus={updateOrderStatus}
          onOrderMore={closeTracking}
        />
      </div>
    );
  }

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
          onOpenAdmin={openAdmin}
          onOpenDriver={openDriver}
        />

        {/* Conditional View: Dedicated Profile Page vs Home Storefront */}
        {isProfileOpen ? (
          <ProfilePage
            onBackToHome={() => closeProfile()}
            onSelectCategory={(catId) => {
              handleCategorySelect(catId);
              closeProfile();
              setTimeout(() => {
                const el = document.getElementById('menu-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }, 50);
            }}
            onOpenAdmin={openAdmin}
            onOpenDriver={openDriver}
          />
        ) : (
          <>
            {/* 2. Hero Promotional Carousel */}
            <HeroCarousel onSelectCategory={handleCategorySelect} />

            {/* 3. Main Menu & Food Merchandising */}
            <main className="flex-1">
              <ProductGrid
                products={PRODUCTS}
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
              />

              {/* 4. Combos & Deals Section */}
              <DealsSection />

              {/* 5. Editorial Brand Story & About */}
              <AboutSection />
            </main>

            {/* 6. Footer */}
            <Footer onOpenAdmin={openAdmin} onOpenDriver={openDriver} />
          </>
        )}

        {/* Modals & Overlays */}
        <ProductDetailSheet />
        <CartDrawer />
        <CartBar />
        <ActiveOrderPill />
        <MobileNavBar onOpenAdmin={openAdmin} />
        <CheckoutModal />
        <LocationSelectorModal />
        <OrderTrackingModal
          order={trackingOrder}
          isOpen={isTrackingOpen}
          onClose={closeTracking}
          onUpdateStatus={updateOrderStatus}
          onOrderMore={closeTracking}
        />
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
