import React, { useState, useEffect, useMemo } from 'react';
import { 
  OrderDetails 
} from '../types';
import { orderStoreService } from '../services/orderStoreService';
import { 
  publishDriverLocation, 
  startDriverGpsTracking,
  CHONKY_KITCHEN_COORDS,
  getDestinationCoordinates,
  DriverLocation 
} from '../services/driverLocationService';
import { ChonkyLiveMap } from './ChonkyLiveMap';
import { 
  ChefHat, 
  Bike, 
  Flame, 
  MapPin, 
  Phone, 
  ArrowLeft, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Plus, 
  CheckCircle, 
  Clock, 
  Search, 
  Eye, 
  AlertTriangle, 
  X, 
  ShieldCheck, 
  DollarSign, 
  Package,
  Navigation,
  Undo2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Radio,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStorefront: () => void;
  onOpenCustomerTracking?: (order: OrderDetails) => void;
  onOpenDriverPortal?: () => void;
}

type AdminTab = 'kds' | 'fleet' | 'orders';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBackToStorefront,
  onOpenCustomerTracking,
  onOpenDriverPortal
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('kds');
  const [orders, setOrders] = useState<OrderDetails[]>(() => orderStoreService.getOrders());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedFleetOrderId, setSelectedFleetOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'delivery' | 'pickup' | 'delivered'>('all');
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [isSimulatingGps, setIsSimulatingGps] = useState<Record<string, boolean>>({});
  const [isRealGpsActive, setIsRealGpsActive] = useState<string | null>(null);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

  // Subscribe to real-time order updates
  useEffect(() => {
    const unsub = orderStoreService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });
    return unsub;
  }, []);

  // Default selected fleet order to first active delivery order
  useEffect(() => {
    if (!selectedFleetOrderId) {
      const activeDelivery = orders.find(o => o.orderType === 'delivery' && (o.status === 'on_the_way' || o.status === 'preparing'));
      if (activeDelivery) {
        setSelectedFleetOrderId(activeDelivery.orderId);
      } else if (orders.length > 0) {
        setSelectedFleetOrderId(orders[0].orderId);
      }
    }
  }, [orders, selectedFleetOrderId]);

  // Status transition handler
  const handleUpdateStatus = (orderId: string, nextStatus: OrderDetails['status']) => {
    const updated = orderStoreService.updateOrderStatus(orderId, nextStatus);
    if (updated) {
      setOrders(orderStoreService.getOrders());
      if (soundEnabled && nextStatus === 'preparing') {
        orderStoreService.playKitchenChime();
      }
    }
  };

  // Add random test order for live demonstration
  const handleCreateTestOrder = () => {
    const idNum = Math.floor(1000 + Math.random() * 9000);
    const areas = ['Henveiru, Malé', 'Maafannu, Malé', 'Hulhumalé Phase 1', 'Hulhumalé Phase 2', 'Galolhu, Malé'];
    const chosenArea = areas[Math.floor(Math.random() * areas.length)];
    const names = ['Zayan Ahmed', 'Fathmath Rishfa', 'Ali Rasheed', 'Aminath Shifa', 'Hassan Shahid'];
    const chosenName = names[Math.floor(Math.random() * names.length)];

    const testOrder: OrderDetails = {
      orderId: `CHK-${idNum}`,
      orderType: 'delivery',
      customerName: chosenName,
      customerPhone: `+960 7${Math.floor(100000 + Math.random() * 900000)}`,
      customerEmail: 'customer@chonky.mv',
      area: chosenArea,
      address: `Road 4, Lot ${Math.floor(10000 + Math.random() * 90000)}`,
      deliveryNotes: 'Call on arrival. Ring bell.',
      paymentMethod: 'bml_pay',
      items: [
        {
          id: `item-${Date.now()}-1`,
          productId: 'burger-1',
          productName: 'The Chonky OG Smash',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          basePrice: 165,
          selectedOptions: [
            { groupId: 'patty', groupTitle: 'Patty Count', choiceId: 'double', choiceName: 'Double Smash Patty', priceDelta: 0 }
          ],
          selectedExtras: [
            { id: 'ex-cheese', name: 'Extra Cheddar Melt', price: 25 }
          ],
          specialInstructions: 'Extra spicy please, extra truffle sauce on side.',
          quantity: 2,
          unitPrice: 190,
          totalPrice: 380
        },
        {
          id: `item-${Date.now()}-2`,
          productId: 'side-1',
          productName: 'Animal-Style Truffle Fries',
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
          basePrice: 75,
          selectedOptions: [],
          selectedExtras: [],
          quantity: 1,
          unitPrice: 75,
          totalPrice: 75
        }
      ],
      subtotal: 455,
      deliveryFee: 25,
      packagingFee: 10,
      total: 490,
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    orderStoreService.addOrder(testOrder);
    setOrders(orderStoreService.getOrders());
    if (soundEnabled) {
      orderStoreService.playKitchenChime();
    }
  };

  // GPS Simulation toggle for fleet management
  const toggleGpsSimulation = (orderId: string) => {
    const isRunning = isSimulatingGps[orderId];
    if (isRunning) {
      setIsSimulatingGps(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    setIsSimulatingGps(prev => ({ ...prev, [orderId]: true }));
    const order = orders.find(o => o.orderId === orderId);
    const dest = getDestinationCoordinates(order?.area, order?.address);
    const start = CHONKY_KITCHEN_COORDS;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      if (progress > 1) {
        progress = 1;
        clearInterval(interval);
        setIsSimulatingGps(prev => ({ ...prev, [orderId]: false }));
      }

      // Linear interpolation along road coordinate
      const currentLng = start[0] + (dest[0] - start[0]) * progress;
      const currentLat = start[1] + (dest[1] - start[1]) * progress;

      const loc: DriverLocation = {
        orderId,
        longitude: currentLng,
        latitude: currentLat,
        timestamp: Date.now(),
        isRealGps: false,
        statusText: `Live Rider GPS (${Math.round(progress * 100)}%)`
      };
      publishDriverLocation(loc);
    }, 1500);
  };

  // Real Driver GPS Toggle
  const toggleRealGps = (orderId: string) => {
    if (isRealGpsActive === orderId) {
      setIsRealGpsActive(null);
      return;
    }

    setIsRealGpsActive(orderId);
    startDriverGpsTracking(orderId, undefined, (err) => {
      alert(`GPS Error: ${err.message}`);
      setIsRealGpsActive(null);
    });
  };

  // Metrics Calculations
  const metrics = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (o.status !== 'received' ? o.total : 0), 0);
    const activeCount = orders.filter(o => o.status === 'received' || o.status === 'preparing' || o.status === 'on_the_way').length;
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    return {
      revenue: totalRev,
      active: activeCount,
      delivered: deliveredCount,
      totalOrders: orders.length
    };
  }, [orders]);

  // Filtered orders for tab 3
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterType === 'active') {
        return order.status === 'received' || order.status === 'preparing' || order.status === 'on_the_way';
      }
      if (filterType === 'delivery') return order.orderType === 'delivery';
      if (filterType === 'pickup') return order.orderType === 'pickup';
      if (filterType === 'delivered') return order.status === 'delivered';
      return true;
    });
  }, [orders, searchQuery, filterType]);

  const deliveryOrders = useMemo(() => {
    return orders.filter(o => o.orderType === 'delivery');
  }, [orders]);

  const selectedFleetOrder = deliveryOrders.find(o => o.orderId === selectedFleetOrderId) || deliveryOrders[0] || orders[0];

  const getElapsedMinutes = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F7F3EE] flex flex-col font-sans selection:bg-[#E53945] selection:text-white">
      
      {/* 1. TOP ADMIN APP BAR (Spacious, bold, high-contrast) */}
      <header className="sticky top-0 z-40 bg-[#121417]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        
        {/* Left: Brand & Return Button */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onBackToStorefront}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-[#F2E2C7] transition active:scale-95"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#700808] to-[#E53945] flex items-center justify-center shadow-lg shadow-[#E53945]/20">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-black text-base sm:text-lg tracking-wide text-white uppercase">Chonky HQ</span>
                <span className="text-xs font-black uppercase px-2 py-0.5 rounded-lg bg-[#E53945]/25 text-[#E53945] border border-[#E53945]/30">
                  Kitchen & Fleet
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F2E2C7]/80 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live System Online · <strong className="text-white font-extrabold">{metrics.active} in prep/transit</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Primary Tab Switcher */}
        <div className="flex items-center bg-[#17191D] p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('kds')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
              activeTab === 'kds'
                ? 'bg-gradient-to-r from-[#700808] to-[#A80D0D] text-white shadow-lg shadow-[#700808]/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Kitchen KDS</span>
            {orders.filter(o => o.status === 'received' || o.status === 'preparing').length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white text-[#700808] font-black">
                {orders.filter(o => o.status === 'received' || o.status === 'preparing').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
              activeTab === 'fleet'
                ? 'bg-gradient-to-r from-[#700808] to-[#A80D0D] text-white shadow-lg shadow-[#700808]/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4 text-emerald-400" />
            <span>Fleet & Live Map</span>
            {orders.filter(o => o.orderType === 'delivery' && o.status === 'on_the_way').length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500 text-white font-black">
                {orders.filter(o => o.orderType === 'delivery' && o.status === 'on_the_way').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#700808] to-[#A80D0D] text-white shadow-lg shadow-[#700808]/40'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-blue-400" />
            <span>All Orders ({orders.length})</span>
          </button>
        </div>

        {/* Right: Quick Action Buttons (Chime, Simulate Order, Reset) */}
        <div className="flex items-center gap-2.5">
          {/* Sound Mute / Unmute */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) orderStoreService.playKitchenChime();
            }}
            className={`h-10 w-10 rounded-2xl border transition flex items-center justify-center shrink-0 ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Kitchen chime active' : 'Kitchen chime muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Switch to Rider Delivery App */}
          {onOpenDriverPortal && (
            <button
              onClick={onOpenDriverPortal}
              className="h-10 flex items-center justify-center gap-2 px-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 transition active:scale-95 shrink-0"
              title="Open Chonky Rider Delivery App"
            >
              <Bike className="w-4 h-4" />
              <span className="hidden sm:inline">Rider App</span>
            </button>
          )}

          {/* Quick Simulate Order */}
          <button
            onClick={handleCreateTestOrder}
            className="h-10 flex items-center justify-center gap-2 px-4 rounded-2xl bg-gradient-to-r from-[#E53945] to-[#B81F2B] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#E53945]/30 hover:brightness-110 active:scale-95 transition shrink-0"
            title="Create a sample incoming customer order"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden md:inline">Test Order</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (confirm('Reset orders to demo defaults?')) {
                orderStoreService.resetToDefaults();
                setOrders(orderStoreService.getOrders());
              }
            }}
            className="h-10 w-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition flex items-center justify-center shrink-0"
            title="Reset to default demo orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY VIEWS BASED ON TAB */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: KITCHEN DISPLAY SYSTEM (KDS PREP COLUMNS)                          */}
        {/* ========================================================================= */}
        {activeTab === 'kds' && (
          <div className="space-y-6">
            
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141619] p-5 rounded-3xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Live Kitchen Prep Line</h2>
                  <p className="text-xs sm:text-sm text-gray-400">Smash grill & hearth stations. Click cards to advance cooking stages.</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
                <span className="px-3.5 py-2 rounded-2xl bg-[#281212] text-amber-400 border border-amber-500/20">
                  🔥 {orders.filter(o => o.status === 'preparing').length} Burgers Sizzling
                </span>
                <span className="px-3.5 py-2 rounded-2xl bg-[#11261B] text-emerald-400 border border-emerald-500/20">
                  🛵 {orders.filter(o => o.status === 'on_the_way').length} With Riders
                </span>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* COLUMN 1: NEW / RECEIVED */}
              <div className="flex flex-col rounded-3xl bg-[#131518] border border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 bg-[#1C1213] border-b border-[#E53945]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-[#E53945] animate-ping" />
                    <h3 className="font-black text-base uppercase tracking-wide text-white">1. New Orders</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#E53945]/20 text-[#E53945] text-xs font-black">
                    {orders.filter(o => o.status === 'received').length}
                  </span>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {orders.filter(o => o.status === 'received').length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm font-bold">
                      No pending orders. Grill is clear!
                    </div>
                  ) : (
                    orders.filter(o => o.status === 'received').map(order => (
                      <KdsCard 
                        key={order.orderId}
                        order={order}
                        elapsedMinutes={getElapsedMinutes(order.createdAt)}
                        onAdvance={() => handleUpdateStatus(order.orderId, 'preparing')}
                        advanceLabel="Send to Grill 🔥"
                        advanceColor="from-[#E53945] to-[#B51E28]"
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 2: IN KITCHEN (PREPARING) */}
              <div className="flex flex-col rounded-3xl bg-[#131518] border border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 bg-[#1D1812] border-b border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                    <h3 className="font-black text-base uppercase tracking-wide text-white">2. Sizzling on Grill</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-black">
                    {orders.filter(o => o.status === 'preparing').length}
                  </span>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {orders.filter(o => o.status === 'preparing').length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm font-bold">
                      Grill is currently idle.
                    </div>
                  ) : (
                    orders.filter(o => o.status === 'preparing').map(order => (
                      <KdsCard 
                        key={order.orderId}
                        order={order}
                        elapsedMinutes={getElapsedMinutes(order.createdAt)}
                        onAdvance={() => handleUpdateStatus(order.orderId, order.orderType === 'delivery' ? 'on_the_way' : 'delivered')}
                        advanceLabel={order.orderType === 'delivery' ? 'Ready for Rider 🛵' : 'Ready for Pickup 🛍️'}
                        advanceColor="from-amber-600 to-amber-700"
                        onRollback={() => handleUpdateStatus(order.orderId, 'received')}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* COLUMN 3: OUT FOR DELIVERY / DISPATCHED */}
              <div className="flex flex-col rounded-3xl bg-[#131518] border border-white/10 overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 bg-[#121B16] border-b border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bike className="w-5 h-5 text-emerald-400 animate-pulse" />
                    <h3 className="font-black text-base uppercase tracking-wide text-white">3. With Riders / Counter</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black">
                    {orders.filter(o => o.status === 'on_the_way').length}
                  </span>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {orders.filter(o => o.status === 'on_the_way').length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-sm font-bold">
                      No active rides right now.
                    </div>
                  ) : (
                    orders.filter(o => o.status === 'on_the_way').map(order => (
                      <KdsCard 
                        key={order.orderId}
                        order={order}
                        elapsedMinutes={getElapsedMinutes(order.createdAt)}
                        onAdvance={() => handleUpdateStatus(order.orderId, 'delivered')}
                        advanceLabel="Mark Delivered ✓"
                        advanceColor="from-emerald-600 to-emerald-700"
                        onRollback={() => handleUpdateStatus(order.orderId, 'preparing')}
                        onFleetMap={() => {
                          setSelectedFleetOrderId(order.orderId);
                          setActiveTab('fleet');
                        }}
                      />
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FLEET & LIVE MAP (EXPANSIVE FULL CARD MAP EXPERIENCE)              */}
        {/* ========================================================================= */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            
            {/* Top: Active Delivery Orders Selector Bar */}
            <div className="bg-[#121417] p-3 sm:p-4 rounded-3xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2.5">
                  <Bike className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-black text-white">Active Delivery Fleet</h3>
                  <span className="text-xs text-gray-400">· Select an order to monitor road route & GPS</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {deliveryOrders.filter(o => o.status === 'on_the_way').length} in transit
                </span>
              </div>

              {/* Horizontal Scrollable Order Cards */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                {deliveryOrders.map(order => {
                  const isSelected = order.orderId === selectedFleetOrder?.orderId;
                  return (
                    <button
                      key={order.orderId}
                      type="button"
                      onClick={() => setSelectedFleetOrderId(order.orderId)}
                      className={`px-4 py-3 rounded-2xl border text-left transition shrink-0 flex items-center gap-3.5 select-none ${
                        isSelected 
                          ? 'bg-[#20242A] border-[#E53945] shadow-lg ring-2 ring-[#E53945]/40 text-white' 
                          : 'bg-[#16181B] border-white/5 hover:border-white/20 text-gray-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                        <Bike className={`w-4 h-4 ${isSelected ? 'text-[#E53945]' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-black/40 text-[#F2E2C7] border border-white/10">
                            {order.orderId}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            order.status === 'on_the_way'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-black text-white mt-1 truncate max-w-[150px]">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">
                          {order.area}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EXPANSIVE FULL-CARD MAP CONTAINER (Fills 100% of card) */}
            <div className="w-full h-[640px] sm:h-[720px] lg:h-[780px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0F1012]">
              {selectedFleetOrder ? (
                <div className="relative w-full h-full">
                  {/* The Vector Dark Map Libre Canvas - Fills 100% of Card */}
                  <ChonkyLiveMap
                    orderId={selectedFleetOrder.orderId}
                    customerArea={selectedFleetOrder.area}
                    customerAddress={selectedFleetOrder.address}
                    orderStatus={selectedFleetOrder.status}
                    isFullPage={false}
                    className="w-full h-full absolute inset-0"
                  />

                  {/* Top Floating Order Banner (Clear & Legible) */}
                  <div className="absolute top-4 left-4 z-10 bg-[#121417]/95 backdrop-blur-md border border-white/15 p-4 rounded-3xl shadow-2xl max-w-md pointer-events-auto">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black px-2.5 py-1 rounded-xl bg-black/50 text-[#F2E2C7] border border-white/10">
                          {selectedFleetOrder.orderId}
                        </span>
                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl ${
                          selectedFleetOrder.status === 'on_the_way'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {selectedFleetOrder.status.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-black text-white">
                        MVR {selectedFleetOrder.total}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <h4 className="text-base font-black text-white">{selectedFleetOrder.customerName}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E53945] shrink-0" />
                        <span className="font-bold text-white">{selectedFleetOrder.area}</span>
                        {selectedFleetOrder.address && (
                          <span className="text-gray-400 truncate">· {selectedFleetOrder.address}</span>
                        )}
                      </div>
                    </div>

                    {selectedFleetOrder.deliveryNotes && (
                      <p className="mt-2 text-[11px] text-[#F2E2C7]/80 bg-white/5 p-2 rounded-xl border border-white/5">
                        Note: {selectedFleetOrder.deliveryNotes}
                      </p>
                    )}
                  </div>

                  {/* Bottom Floating Fleet Control Console HUD (With Collapse / Expand) */}
                  <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-10 bg-[#121417]/95 backdrop-blur-md border border-white/15 p-4 sm:p-5 rounded-3xl shadow-2xl max-w-lg pointer-events-auto transition-all">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-300 pb-2">
                      <span className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>Rider: <strong className="text-white">Ali (Scooter AB1B-1234)</strong></span>
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${selectedFleetOrder.customerPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition active:scale-95 text-xs"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#E53945]" />
                          <span>Call</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                          title={isConsoleCollapsed ? 'Expand Controls' : 'Collapse Controls to See Full Map'}
                        >
                          {isConsoleCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Action Buttons Area */}
                    {!isConsoleCollapsed && (
                      <div className="pt-2 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
                        {/* GPS Telemetry Buttons - Consistent h-11 height */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* Live Simulation Button */}
                          <button
                            type="button"
                            onClick={() => toggleGpsSimulation(selectedFleetOrder.orderId)}
                            className={`h-11 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
                              isSimulatingGps[selectedFleetOrder.orderId] 
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                            }`}
                          >
                            <Navigation className="w-4 h-4" />
                            <span className="truncate">{isSimulatingGps[selectedFleetOrder.orderId] ? 'Simulating GPS...' : 'Simulate GPS'}</span>
                          </button>

                          {/* Real Phone GPS Button */}
                          <button
                            type="button"
                            onClick={() => toggleRealGps(selectedFleetOrder.orderId)}
                            className={`h-11 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition ${
                              isRealGpsActive === selectedFleetOrder.orderId 
                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                                : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                            }`}
                          >
                            <Radio className="w-4 h-4" />
                            <span className="truncate">{isRealGpsActive === selectedFleetOrder.orderId ? 'Phone GPS Active' : 'Use Phone GPS'}</span>
                          </button>
                        </div>

                        {/* Primary Status Advancement Bar - Consistent h-11 height, follows card boundaries */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                          {selectedFleetOrder.status !== 'on_the_way' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(selectedFleetOrder.orderId, 'on_the_way')}
                              className="flex-1 h-11 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                            >
                              <Bike className="w-4 h-4" />
                              <span className="truncate">Dispatch Rider 🛵</span>
                            </button>
                          )}
                          {selectedFleetOrder.status === 'on_the_way' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(selectedFleetOrder.orderId, 'delivered')}
                              className="flex-1 h-11 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 active:scale-95"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span className="truncate">Complete Delivery ✓</span>
                            </button>
                          )}
                          {onOpenCustomerTracking && (
                            <button
                              type="button"
                              onClick={() => onOpenCustomerTracking(selectedFleetOrder)}
                              className="h-11 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-[#F2E2C7] text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                              title="Open customer tracking view"
                            >
                              <span>Customer View</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-base">
                  <Bike className="w-12 h-12 text-gray-600 mb-2" />
                  <p>No delivery orders to show on the map.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ALL ORDERS & FINANCIAL METRICS                                     */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Stat Summary Cards (Larger, clearer metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Today Revenue
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                  MVR {metrics.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-400 mt-1">✓ Verified orders</p>
              </div>

              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Active Queue
                </p>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1.5">
                  {metrics.active}
                </p>
                <p className="text-xs text-gray-400 mt-1">Needs prep / dispatch</p>
              </div>

              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Delivered
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                  {metrics.delivered}
                </p>
                <p className="text-xs text-gray-400 mt-1">Completed rides</p>
              </div>

              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-extrabold uppercase tracking-wider flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  Total Orders
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                  {metrics.totalOrders}
                </p>
                <p className="text-xs text-gray-400 mt-1">Lifetime in registry</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121417] p-4 rounded-3xl border border-white/10 shadow-lg">
              
              {/* Search */}
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A1C20] border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E53945]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-[#1A1C20] p-1.5 rounded-2xl border border-white/5">
                {(['all', 'active', 'delivery', 'pickup', 'delivered'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold capitalize transition ${
                      filterType === tab 
                        ? 'bg-[#E53945] text-white shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-[#121417] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#17191D] text-gray-400 uppercase font-bold text-xs border-b border-white/10 tracking-wider">
                    <tr>
                      <th className="py-4 px-5">Order ID</th>
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-5">Type & Area</th>
                      <th className="py-4 px-5">Items</th>
                      <th className="py-4 px-5">Payment</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-gray-500 text-base font-bold">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.orderId} className="hover:bg-white/[0.03] transition">
                          
                          {/* Order ID */}
                          <td className="py-4 px-5">
                            <span className="font-mono font-black text-sm text-white bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                              {order.orderId}
                            </span>
                            <p className="text-xs text-gray-400 mt-1.5">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-5">
                            <p className="font-bold text-white text-base">{order.customerName}</p>
                            <a href={`tel:${order.customerPhone}`} className="text-gray-400 hover:text-[#E53945] text-xs font-mono">
                              {order.customerPhone}
                            </a>
                          </td>

                          {/* Type & Area */}
                          <td className="py-4 px-5">
                            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                              order.orderType === 'delivery' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {order.orderType}
                            </span>
                            <p className="text-gray-300 text-xs truncate max-w-[170px] mt-1 font-medium">
                              {order.area}
                            </p>
                          </td>

                          {/* Items Summary */}
                          <td className="py-4 px-5">
                            <p className="text-white font-black text-sm">{order.items.length} items</p>
                            <p className="text-gray-400 text-xs truncate max-w-[200px] mt-0.5">
                              {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                            </p>
                          </td>

                          {/* Payment */}
                          <td className="py-4 px-5">
                            <p className="font-black text-white text-base">MVR {order.total}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 uppercase font-mono">
                                {order.paymentMethod.replace('_', ' ')}
                              </span>
                              {order.transferSlip && (
                                <button
                                  type="button"
                                  onClick={() => setViewingSlipUrl(order.transferSlip || null)}
                                  className="text-xs text-[#E53945] underline font-bold flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Slip</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-4 px-5">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.orderId, e.target.value as OrderDetails['status'])}
                              className={`text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl border bg-[#1A1C20] focus:outline-none ${
                                order.status === 'received' 
                                  ? 'text-[#E53945] border-[#E53945]/40' 
                                  : order.status === 'preparing'
                                  ? 'text-amber-400 border-amber-500/40'
                                  : order.status === 'on_the_way'
                                  ? 'text-emerald-400 border-emerald-500/40'
                                  : 'text-gray-400 border-gray-600'
                              }`}
                            >
                              <option value="received">Received</option>
                              <option value="preparing">Preparing 🔥</option>
                              <option value="on_the_way">On the Way 🛵</option>
                              <option value="delivered">Delivered ✓</option>
                            </select>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {order.orderType === 'delivery' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFleetOrderId(order.orderId);
                                    setActiveTab('fleet');
                                  }}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 transition"
                                  title="View on Fleet Map"
                                >
                                  <Bike className="w-4 h-4" />
                                </button>
                              )}
                              {onOpenCustomerTracking && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCustomerTracking(order)}
                                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F2E2C7] transition"
                                  title="Customer tracking view"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. BML TRANSFER SLIP PREVIEW MODAL */}
      {viewingSlipUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewingSlipUrl(null)}
        >
          <div 
            className="bg-[#141619] border border-white/20 rounded-3xl p-6 max-w-md w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <h4 className="font-black text-base text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>BML Transfer Slip Verification</span>
              </h4>
              <button
                onClick={() => setViewingSlipUrl(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={viewingSlipUrl}
                alt="Payment Slip"
                className="w-full h-auto object-contain max-h-[65vh]"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingSlipUrl(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// =========================================================================
// SUBCOMPONENT: KDS TICKET CARD (Clean, large typography for kitchen staff)
// =========================================================================
interface KdsCardProps {
  order: OrderDetails;
  elapsedMinutes: number;
  onAdvance: () => void;
  advanceLabel: string;
  advanceColor: string;
  onRollback?: () => void;
  onFleetMap?: () => void;
}

const KdsCard: React.FC<KdsCardProps> = ({
  order,
  elapsedMinutes,
  onAdvance,
  advanceLabel,
  advanceColor,
  onRollback,
  onFleetMap
}) => {
  const isLate = elapsedMinutes > 15;
  const isWarning = elapsedMinutes > 8;

  return (
    <div className={`rounded-3xl border p-5 bg-[#171A1E] transition shadow-lg ${
      isLate 
        ? 'border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]' 
        : isWarning 
        ? 'border-amber-500/60' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Top Bar: Order ID, Type & Timer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="font-mono font-black text-sm px-2.5 py-1 rounded-xl bg-black/60 text-[#F2E2C7] border border-white/10">
            {order.orderId}
          </span>
          <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl ${
            order.orderType === 'delivery' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {order.orderType}
          </span>
        </div>

        {/* Elapsed Timer */}
        <span className={`text-xs sm:text-sm font-mono font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
          isLate ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-300'
        }`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{elapsedMinutes}m</span>
        </span>
      </div>

      {/* Customer Info */}
      <div className="mt-3">
        <p className="font-black text-base text-white">{order.customerName}</p>
        <p className="text-xs sm:text-sm text-gray-300 truncate mt-0.5 font-medium">{order.area}</p>
      </div>

      {/* Items List (Clear & Large) */}
      <div className="mt-4 pt-3.5 border-t border-white/10 space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-start justify-between font-black text-sm sm:text-base text-white">
              <span>{item.quantity}x {item.productName}</span>
            </div>
            {/* Options */}
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <p className="text-xs sm:text-sm text-gray-300 pl-4 font-medium">
                • {item.selectedOptions.map(o => o.choiceName).join(', ')}
              </p>
            )}
            {/* Extras */}
            {item.selectedExtras && item.selectedExtras.length > 0 && (
              <p className="text-xs sm:text-sm text-[#F2E2C7] pl-4 font-bold">
                + {item.selectedExtras.map(e => e.name).join(', ')}
              </p>
            )}
            {/* Special Instructions */}
            {item.specialInstructions && (
              <div className="mt-1.5 ml-2 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs sm:text-sm text-amber-300 font-bold flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>Note: {item.specialInstructions}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delivery Notes */}
      {order.deliveryNotes && (
        <div className="mt-3.5 p-2.5 rounded-2xl bg-white/5 text-xs text-gray-300 border border-white/5 font-medium">
          <span className="font-black text-white">Delivery Note: </span>
          {order.deliveryNotes}
        </div>
      )}

      {/* Action Footer - Strictly follows card boundaries with uniform h-11 button heights */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
        {/* Left Secondary Action Buttons: Rollback & Fleet Map */}
        {(onRollback || onFleetMap) && (
          <div className="flex items-center gap-2 shrink-0">
            {onRollback && (
              <button
                type="button"
                onClick={onRollback}
                className="h-11 w-11 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition active:scale-90 flex items-center justify-center shrink-0"
                title="Step back to previous stage"
                aria-label="Step back to previous stage"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}

            {onFleetMap && (
              <button
                type="button"
                onClick={onFleetMap}
                className="h-11 px-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-emerald-400 hover:text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                title="Open in Fleet Map"
              >
                <Bike className="w-4 h-4" />
                <span>Map</span>
              </button>
            )}
          </div>
        )}

        {/* Right Primary Action Button: Uniform h-11 height, stays strictly within card boundaries */}
        <button
          type="button"
          onClick={onAdvance}
          className={`h-11 px-4 rounded-2xl bg-gradient-to-r ${advanceColor} text-white text-xs sm:text-sm font-black shadow-md hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 min-w-0 max-w-full ${
            (onRollback || onFleetMap) ? 'flex-1 sm:flex-initial sm:ml-auto' : 'w-full'
          }`}
        >
          <span className="truncate">{advanceLabel}</span>
          <ChevronRight className="w-4 h-4 stroke-[3] shrink-0" />
        </button>
      </div>
    </div>
  );
};
