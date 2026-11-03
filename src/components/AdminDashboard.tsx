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
  Radio
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStorefront: () => void;
  onOpenCustomerTracking?: (order: OrderDetails) => void;
}

type AdminTab = 'kds' | 'fleet' | 'orders';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onBackToStorefront,
  onOpenCustomerTracking
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
        statusText: `Simulated Fleet Telemetry (${Math.round(progress * 100)}%)`
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

  const selectedFleetOrder = orders.find(o => o.orderId === selectedFleetOrderId) || orders[0];

  const getElapsedMinutes = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    return Math.max(0, diff);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F7F3EE] flex flex-col font-sans selection:bg-[#E53945] selection:text-white">
      
      {/* 1. TOP ADMIN APP BAR */}
      <header className="sticky top-0 z-40 bg-[#121417]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        
        {/* Left: Brand & Return Button */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onBackToStorefront}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#F2E2C7] transition active:scale-95"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#700808] to-[#E53945] flex items-center justify-center shadow-md">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide text-white uppercase">Chonky HQ</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[#E53945]/20 text-[#E53945] border border-[#E53945]/30">
                  Kitchen & Fleet
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#F2E2C7]/70">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live System Active · {metrics.active} in queue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Primary Tab Switcher */}
        <div className="flex items-center bg-[#181B1E] p-1 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('kds')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'kds'
                ? 'bg-gradient-to-r from-[#700808] to-[#9E0D0D] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Kitchen KDS</span>
            {orders.filter(o => o.status === 'received' || o.status === 'preparing').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-[#700808] font-black">
                {orders.filter(o => o.status === 'received' || o.status === 'preparing').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'fleet'
                ? 'bg-gradient-to-r from-[#700808] to-[#9E0D0D] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fleet & Live Map</span>
            {orders.filter(o => o.orderType === 'delivery' && o.status === 'on_the_way').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-black">
                {orders.filter(o => o.orderType === 'delivery' && o.status === 'on_the_way').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#700808] to-[#9E0D0D] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <span>All Orders ({orders.length})</span>
          </button>
        </div>

        {/* Right: Quick Action Buttons (Chime, Simulate Order, Reset) */}
        <div className="flex items-center gap-2">
          {/* Sound Mute / Unmute */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) orderStoreService.playKitchenChime();
            }}
            className={`p-2 rounded-xl border transition ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}
            title={soundEnabled ? 'Kitchen chime active' : 'Kitchen chime muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Simulate Order */}
          <button
            onClick={handleCreateTestOrder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#E53945] to-[#C02631] text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition"
            title="Create a sample incoming customer order"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
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
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition"
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
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#141619] p-4 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                <div>
                  <h2 className="text-base font-black text-white">Live Kitchen Prep Line</h2>
                  <p className="text-xs text-gray-400">Smash grill & hearth stations. Click cards to advance cooking stages.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-[#251010] text-amber-400 border border-amber-500/20 font-bold">
                  🔥 {orders.filter(o => o.status === 'preparing').length} Burgers Sizzling
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#102518] text-emerald-400 border border-emerald-500/20 font-bold">
                  🛵 {orders.filter(o => o.status === 'on_the_way').length} With Riders
                </span>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* COLUMN 1: NEW / RECEIVED */}
              <div className="flex flex-col rounded-3xl bg-[#121417] border border-white/10 overflow-hidden shadow-lg">
                <div className="p-4 bg-[#1A1112] border-b border-[#E53945]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E53945] animate-ping" />
                    <h3 className="font-black text-sm uppercase text-white">1. New Orders</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#E53945]/20 text-[#E53945] text-xs font-black">
                    {orders.filter(o => o.status === 'received').length}
                  </span>
                </div>

                <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {orders.filter(o => o.status === 'received').length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs">
                      No pending orders. Good job!
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
              <div className="flex flex-col rounded-3xl bg-[#121417] border border-white/10 overflow-hidden shadow-lg">
                <div className="p-4 bg-[#1A1811] border-b border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                    <h3 className="font-black text-sm uppercase text-white">2. Sizzling on Grill</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-xs font-black">
                    {orders.filter(o => o.status === 'preparing').length}
                  </span>
                </div>

                <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {orders.filter(o => o.status === 'preparing').length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs">
                      Grill is idle.
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
              <div className="flex flex-col rounded-3xl bg-[#121417] border border-white/10 overflow-hidden shadow-lg">
                <div className="p-4 bg-[#111A15] border-b border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h3 className="font-black text-sm uppercase text-white">3. With Riders / Counter</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-black">
                    {orders.filter(o => o.status === 'on_the_way').length}
                  </span>
                </div>

                <div className="p-3.5 space-y-3.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {orders.filter(o => o.status === 'on_the_way').length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-xs">
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
        {/* TAB 2: FLEET & LIVE MAP TRACKING                                          */}
        {/* ========================================================================= */}
        {activeTab === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            
            {/* Left Column: Active Rides List (5 cols) */}
            <div className="lg:col-span-5 flex flex-col bg-[#121417] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="p-4 bg-[#181B1E] border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    <span>Delivery Ride Dispatch</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">Select order to inspect GPS & turn-by-turn route</p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  {orders.filter(o => o.orderType === 'delivery' && o.status === 'on_the_way').length} Active
                </span>
              </div>

              {/* List of Deliveries */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {orders.filter(o => o.orderType === 'delivery').map(order => {
                  const isSelected = order.orderId === selectedFleetOrderId;
                  const isSimulating = !!isSimulatingGps[order.orderId];
                  const isRealGps = isRealGpsActive === order.orderId;

                  return (
                    <div
                      key={order.orderId}
                      onClick={() => setSelectedFleetOrderId(order.orderId)}
                      className={`p-4 rounded-2xl border transition cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-[#1D2126] border-[#E53945] shadow-lg ring-1 ring-[#E53945]/40' 
                          : 'bg-[#16181B] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-black/40 text-[#F2E2C7] border border-white/10">
                              {order.orderId}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              order.status === 'on_the_way'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : order.status === 'preparing'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : order.status === 'delivered'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-black text-sm text-white mt-1.5">{order.customerName}</h4>
                          <div className="flex items-center gap-1.5 text-xs text-[#F2E2C7]/80 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-[#E53945] shrink-0" />
                            <span className="truncate">{order.area}</span>
                          </div>
                          {order.address && (
                            <p className="text-[11px] text-gray-400 truncate pl-5">{order.address}</p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black text-xs text-white">MVR {order.total}</p>
                          <p className="text-[10px] text-gray-400 font-mono capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {/* Driver & Telemetry Controls if Selected */}
                      {isSelected && (
                        <div className="mt-3.5 pt-3.5 border-t border-white/10 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400 flex items-center gap-1">
                              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                              Rider: <strong>Ali (Scooter AB1B-1234)</strong>
                            </span>
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-[#F2E2C7] hover:text-white flex items-center gap-1 font-bold bg-white/5 px-2 py-1 rounded-lg"
                            >
                              <Phone className="w-3 h-3 text-[#E53945]" />
                              <span>Call Customer</span>
                            </a>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            {/* Live Simulation Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleGpsSimulation(order.orderId);
                              }}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                isSimulating 
                                  ? 'bg-amber-500 text-black font-black' 
                                  : 'bg-white/10 text-white hover:bg-white/15'
                              }`}
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>{isSimulating ? 'Simulating...' : 'Simulate GPS'}</span>
                            </button>

                            {/* Real Phone GPS Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRealGps(order.orderId);
                              }}
                              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                                isRealGps 
                                  ? 'bg-emerald-500 text-black font-black' 
                                  : 'bg-white/10 text-white hover:bg-white/15'
                              }`}
                            >
                              <Radio className="w-3.5 h-3.5" />
                              <span>{isRealGps ? 'Phone GPS On' : 'Use Phone GPS'}</span>
                            </button>
                          </div>

                          {/* Status changer buttons */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            {order.status !== 'on_the_way' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(order.orderId, 'on_the_way');
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                              >
                                Dispatch Rider 🛵
                              </button>
                            )}
                            {order.status === 'on_the_way' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateStatus(order.orderId, 'delivered');
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                              >
                                Complete Delivery ✓
                              </button>
                            )}
                            {onOpenCustomerTracking && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenCustomerTracking(order);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F2E2C7] text-xs font-bold transition"
                                title="Open customer tracking view"
                              >
                                Customer View ↗
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Map (7 cols) */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0F1012] flex flex-col">
              {selectedFleetOrder ? (
                <div className="relative w-full h-full flex-1">
                  <ChonkyLiveMap
                    orderId={selectedFleetOrder.orderId}
                    customerArea={selectedFleetOrder.area}
                    customerAddress={selectedFleetOrder.address}
                    orderStatus={selectedFleetOrder.status}
                    isFullPage={false}
                  />

                  {/* Floating Map Info Overlay Pill */}
                  <div className="absolute top-4 left-4 z-10 bg-[#121417]/90 backdrop-blur-md border border-white/15 p-3 rounded-2xl shadow-xl max-w-sm pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#F2E2C7]">
                        {selectedFleetOrder.orderId}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {selectedFleetOrder.customerName}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 truncate mt-0.5">
                      Destination: {selectedFleetOrder.area}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Select an active delivery ride from the left list.
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
            
            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#121417] p-4 rounded-3xl border border-white/10 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Today Revenue
                </p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  MVR {metrics.revenue.toLocaleString()}
                </p>
                <p className="text-[11px] text-emerald-400 mt-0.5">✓ Verified orders</p>
              </div>

              <div className="bg-[#121417] p-4 rounded-3xl border border-white/10 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Active Queue
                </p>
                <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  {metrics.active}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Needs prep/dispatch</p>
              </div>

              <div className="bg-[#121417] p-4 rounded-3xl border border-white/10 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Delivered
                </p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  {metrics.delivered}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Completed rides</p>
              </div>

              <div className="bg-[#121417] p-4 rounded-3xl border border-white/10 shadow-sm">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-400" />
                  Total Orders
                </p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1">
                  {metrics.totalOrders}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Lifetime in registry</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121417] p-3.5 rounded-3xl border border-white/10">
              
              {/* Search */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1A1C20] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#E53945]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-[#1A1C20] p-1 rounded-2xl border border-white/5">
                {(['all', 'active', 'delivery', 'pickup', 'delivered'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilterType(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                      filterType === tab 
                        ? 'bg-[#E53945] text-white shadow-sm' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

            </div>

            {/* Orders Table */}
            <div className="bg-[#121417] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#16181C] text-gray-400 uppercase font-bold text-[10px] border-b border-white/10 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Type & Area</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          No matching orders found.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.orderId} className="hover:bg-white/[0.02] transition">
                          
                          {/* Order ID */}
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                              {order.orderId}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </td>

                          {/* Customer */}
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-white">{order.customerName}</p>
                            <a href={`tel:${order.customerPhone}`} className="text-gray-400 hover:text-[#E53945] text-[11px] font-mono">
                              {order.customerPhone}
                            </a>
                          </td>

                          {/* Type & Area */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              order.orderType === 'delivery' 
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}>
                              {order.orderType}
                            </span>
                            <p className="text-gray-300 text-[11px] truncate max-w-[150px] mt-0.5">
                              {order.area}
                            </p>
                          </td>

                          {/* Items Summary */}
                          <td className="py-3.5 px-4">
                            <p className="text-white font-bold">{order.items.length} items</p>
                            <p className="text-gray-400 text-[11px] truncate max-w-[180px]">
                              {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                            </p>
                          </td>

                          {/* Payment */}
                          <td className="py-3.5 px-4">
                            <p className="font-black text-white">MVR {order.total}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400 uppercase font-mono">
                                {order.paymentMethod.replace('_', ' ')}
                              </span>
                              {order.transferSlip && (
                                <button
                                  type="button"
                                  onClick={() => setViewingSlipUrl(order.transferSlip || null)}
                                  className="text-[10px] text-[#E53945] underline font-bold flex items-center gap-0.5"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Slip</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Status Dropdown */}
                          <td className="py-3.5 px-4">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.orderId, e.target.value as OrderDetails['status'])}
                              className={`text-xs font-bold px-2.5 py-1 rounded-xl border bg-[#1A1C20] focus:outline-none ${
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
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {order.orderType === 'delivery' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFleetOrderId(order.orderId);
                                    setActiveTab('fleet');
                                  }}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 transition"
                                  title="View on Fleet Map"
                                >
                                  <Bike className="w-4 h-4" />
                                </button>
                              )}
                              {onOpenCustomerTracking && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCustomerTracking(order)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F2E2C7] transition"
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
            className="bg-[#141619] border border-white/20 rounded-3xl p-5 max-w-md w-full relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>BML Transfer Slip Verification</span>
              </h4>
              <button
                onClick={() => setViewingSlipUrl(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
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

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewingSlipUrl(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
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
// SUBCOMPONENT: KDS TICKET CARD
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
    <div className={`rounded-2xl border p-4 bg-[#181B1E] transition shadow-md ${
      isLate 
        ? 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
        : isWarning 
        ? 'border-amber-500/60' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Top Bar: Order ID, Type & Timer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-black/50 text-[#F2E2C7] border border-white/10">
            {order.orderId}
          </span>
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
            order.orderType === 'delivery' 
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {order.orderType}
          </span>
        </div>

        {/* Elapsed Timer */}
        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded flex items-center gap-1 ${
          isLate ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-300'
        }`}>
          <Clock className="w-3 h-3" />
          <span>{elapsedMinutes}m</span>
        </span>
      </div>

      {/* Customer Info */}
      <div className="mt-2 text-xs">
        <p className="font-bold text-white">{order.customerName}</p>
        <p className="text-[11px] text-gray-400 truncate">{order.area}</p>
      </div>

      {/* Items List */}
      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-xs">
            <div className="flex items-start justify-between font-black text-white">
              <span>{item.quantity}x {item.productName}</span>
            </div>
            {/* Options */}
            {item.selectedOptions && item.selectedOptions.length > 0 && (
              <p className="text-[11px] text-gray-400 pl-4">
                {item.selectedOptions.map(o => o.choiceName).join(', ')}
              </p>
            )}
            {/* Extras */}
            {item.selectedExtras && item.selectedExtras.length > 0 && (
              <p className="text-[11px] text-[#F2E2C7]/80 pl-4">
                + {item.selectedExtras.map(e => e.name).join(', ')}
              </p>
            )}
            {/* Special Instructions */}
            {item.specialInstructions && (
              <div className="mt-1 ml-3 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10.5px] text-amber-300 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
                <span>Note: {item.specialInstructions}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delivery Notes */}
      {order.deliveryNotes && (
        <div className="mt-2.5 p-2 rounded-xl bg-white/5 text-[11px] text-gray-300 border border-white/5">
          <span className="font-bold text-white">Delivery Note: </span>
          {order.deliveryNotes}
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
        {onRollback ? (
          <button
            type="button"
            onClick={onRollback}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
            title="Step back to previous stage"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        ) : <div />}

        <div className="flex items-center gap-2">
          {onFleetMap && (
            <button
              type="button"
              onClick={onFleetMap}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F2E2C7] text-xs font-bold transition flex items-center gap-1"
            >
              <Bike className="w-3.5 h-3.5 text-emerald-400" />
              <span>Map</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAdvance}
            className={`px-4 py-2 rounded-xl bg-gradient-to-r ${advanceColor} text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition flex items-center gap-1.5`}
          >
            <span>{advanceLabel}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
