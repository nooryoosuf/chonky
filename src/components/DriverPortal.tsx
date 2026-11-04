import React, { useState, useEffect, useMemo } from 'react';
import { OrderDetails, AssignedDriver } from '../types';
import { orderStoreService, CHONKY_DEFAULT_RIDER } from '../services/orderStoreService';
import { 
  publishDriverLocation, 
  startDriverGpsTracking,
  CHONKY_KITCHEN_COORDS,
  getDestinationCoordinates,
  DriverLocation 
} from '../services/driverLocationService';
import { ChonkyLiveMap } from './ChonkyLiveMap';
import { 
  Bike, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Navigation, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink, 
  DollarSign, 
  Radio, 
  KeyRound, 
  Volume2, 
  VolumeX, 
  ChefHat, 
  Package, 
  Compass, 
  Power
} from 'lucide-react';

interface DriverPortalProps {
  onBackToStorefront: () => void;
  onOpenAdminHQ?: () => void;
  onOpenCustomerTracking?: (order: OrderDetails) => void;
}

type DriverTab = 'active' | 'available' | 'history';

export const DriverPortal: React.FC<DriverPortalProps> = ({
  onBackToStorefront,
  onOpenAdminHQ,
  onOpenCustomerTracking
}) => {
  const [activeTab, setActiveTab] = useState<DriverTab>('active');
  const [orders, setOrders] = useState<OrderDetails[]>(() => orderStoreService.getOrders());
  const [isOnline, setIsOnline] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Active rider identity
  const rider: AssignedDriver = CHONKY_DEFAULT_RIDER;

  // Selected or Active delivery order ID
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Customer PIN Verification state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  // Cash Change Calculator state
  const [cashGiven, setCashGiven] = useState<number | null>(null);

  // GPS Simulation & Real GPS Tracking
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [isRealGpsActive, setIsRealGpsActive] = useState(false);

  // Subscribe to real-time order updates
  useEffect(() => {
    const unsub = orderStoreService.subscribe((updatedOrders) => {
      setOrders(updatedOrders);
    });
    return unsub;
  }, []);

  // Determine active delivery rides
  const myActiveOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderType === 'delivery' && 
      (o.status === 'on_the_way' || o.status === 'preparing')
    );
  }, [orders]);

  // Available pickup orders at kitchen (not yet delivered or assigned)
  const availablePickupOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderType === 'delivery' && 
      (o.status === 'preparing' || o.status === 'received')
    );
  }, [orders]);

  // Today's completed delivery orders
  const completedOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderType === 'delivery' && 
      o.status === 'delivered'
    );
  }, [orders]);

  // Keep a selected active delivery order
  useEffect(() => {
    if (!selectedOrderId && myActiveOrders.length > 0) {
      setSelectedOrderId(myActiveOrders[0].orderId);
    } else if (selectedOrderId && !orders.some(o => o.orderId === selectedOrderId)) {
      setSelectedOrderId(myActiveOrders[0]?.orderId || null);
    }
  }, [myActiveOrders, selectedOrderId, orders]);

  const currentOrder = orders.find(o => o.orderId === selectedOrderId) || myActiveOrders[0];

  // Accept / Claim order from kitchen
  const handleAcceptOrder = (orderId: string) => {
    const updated = orderStoreService.assignDriver(orderId, rider);
    if (updated) {
      setSelectedOrderId(orderId);
      setActiveTab('active');
      if (soundEnabled) {
        orderStoreService.playDriverAlert();
      }
    }
  };

  // Mark order picked up from kitchen counter
  const handleMarkPickedUp = (orderId: string) => {
    orderStoreService.updateOrderStatus(orderId, 'on_the_way');
  };

  // Verify PIN and complete delivery
  const handleVerifyAndDeliver = (orderId: string) => {
    if (!enteredPin.trim()) {
      setPinError('Please enter the 4-digit customer PIN.');
      return;
    }

    const result = orderStoreService.verifyCustomerPin(orderId, enteredPin);
    if (result.success) {
      setPinError(null);
      setPinSuccess('Delivery completed! Great job Ali.');
      setTimeout(() => {
        setPinSuccess(null);
        setEnteredPin('');
        // Switch to available or history
        if (myActiveOrders.length <= 1) {
          setActiveTab('available');
        }
      }, 1500);
    } else {
      setPinError(result.message);
    }
  };

  // Skip PIN (unattended drop / emergency override)
  const handleEmergencyOverride = (orderId: string) => {
    if (confirm('Complete delivery without PIN? (Left with building reception or doorstep)')) {
      orderStoreService.updateOrderStatus(orderId, 'delivered');
      setEnteredPin('');
      setPinError(null);
    }
  };

  // Toggle Live Simulation along road route
  const toggleGpsSimulation = (orderId: string) => {
    if (isSimulatingGps) {
      setIsSimulatingGps(false);
      return;
    }

    setIsSimulatingGps(true);
    const order = orders.find(o => o.orderId === orderId);
    const dest = getDestinationCoordinates(order?.area, order?.address);
    const start = CHONKY_KITCHEN_COORDS;

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.04;
      if (progress > 1) {
        progress = 1;
        clearInterval(interval);
        setIsSimulatingGps(false);
      }

      const currentLng = start[0] + (dest[0] - start[0]) * progress;
      const currentLat = start[1] + (dest[1] - start[1]) * progress;

      const loc: DriverLocation = {
        orderId,
        longitude: currentLng,
        latitude: currentLat,
        timestamp: Date.now(),
        isRealGps: false,
        statusText: `Rider en route (${Math.round(progress * 100)}%)`
      };
      publishDriverLocation(loc);
    }, 1200);
  };

  // Toggle Phone Real GPS
  const toggleRealGps = (orderId: string) => {
    if (isRealGpsActive) {
      setIsRealGpsActive(false);
      return;
    }

    setIsRealGpsActive(true);
    startDriverGpsTracking(orderId, undefined, (err) => {
      alert(`GPS Error: ${err.message}`);
      setIsRealGpsActive(false);
    });
  };

  // Metrics for rider shift
  const shiftMetrics = useMemo(() => {
    const cashCollected = completedOrders
      .filter(o => o.paymentMethod === 'cash')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      completedCount: completedOrders.length,
      cashToRemit: cashCollected,
      activeCount: myActiveOrders.length
    };
  }, [completedOrders, myActiveOrders]);

  // Open Google Maps external navigation
  const openExternalNavigation = (area: string, address: string = '') => {
    const coords = getDestinationCoordinates(area, address);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
    window.open(url, '_blank');
  };

  // WhatsApp quick greeting
  const openWhatsApp = (phone: string, orderId: string, customerName: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(
      `Assalaamu alaikum ${customerName}! I'm Ali, your Chonky delivery rider. I have your order #${orderId} and I'm on the way to your building.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#07080A] text-[#F7F3EE] flex flex-col font-sans selection:bg-[#E53945] selection:text-white pb-12">
      
      {/* 1. RIDER APP TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-[#101215]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        
        {/* Left: Brand & Return Navigation */}
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={onBackToStorefront}
            className="h-10 flex items-center justify-center gap-2 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-bold text-[#F2E2C7] transition active:scale-95 shrink-0"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Storefront</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-black text-base sm:text-lg tracking-wide text-white uppercase">Chonky Rider</span>
                <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Fleet App
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#F2E2C7]/80 mt-0.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{rider.name} · <strong className="font-mono text-white">{rider.vehiclePlate}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Shift Primary Tabs */}
        <div className="flex items-center bg-[#16181C] p-1.5 rounded-2xl border border-white/10 shadow-inner overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition whitespace-nowrap ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4 text-cyan-300" />
            <span>Active Ride</span>
            {myActiveOrders.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white text-blue-800 font-black">
                {myActiveOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition whitespace-nowrap ${
              activeTab === 'available'
                ? 'bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Kitchen Pickups</span>
            {availablePickupOrders.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-amber-500 text-black font-black">
                {availablePickupOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Shift Cash ({completedOrders.length})</span>
          </button>
        </div>

        {/* Right: Duty Toggle & Sound */}
        <div className="flex items-center gap-2.5">
          {/* Duty Online / Offline */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`h-10 flex items-center justify-center gap-1.5 px-3.5 rounded-2xl text-xs font-black border transition shrink-0 ${
              isOnline 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25' 
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
            }`}
            title="Toggle duty status"
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isOnline ? 'On Duty' : 'Off Duty'}</span>
          </button>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) orderStoreService.playDriverAlert();
            }}
            className={`h-10 w-10 rounded-2xl border transition flex items-center justify-center shrink-0 ${
              soundEnabled 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
            title={soundEnabled ? 'Alert chimes on' : 'Alert chimes muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-300" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Switch to Kitchen HQ */}
          {onOpenAdminHQ && (
            <button
              onClick={onOpenAdminHQ}
              className="hidden lg:flex h-10 items-center justify-center gap-1.5 px-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#F2E2C7] transition shrink-0"
              title="Open Kitchen KDS & Admin HQ"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen HQ</span>
            </button>
          )}
        </div>

      </header>

      {/* 2. BODY CONTENT */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* TAB 1: ACTIVE DELIVERY RIDE SCREEN                                        */}
        {/* ========================================================================= */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            
            {/* If Rider has an active delivery */}
            {currentOrder ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Map & Route Telemetry (7 cols) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  
                  {/* Delivery Progress Step Pill */}
                  <div className="bg-[#121417] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                        <Bike className="w-5 h-5 stroke-[2.5] animate-pulse" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black px-2.5 py-0.5 rounded-lg bg-black/50 text-[#F2E2C7] border border-white/10 shrink-0">
                            {currentOrder.orderId}
                          </span>
                          <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 truncate">
                            {currentOrder.status === 'on_the_way' ? 'En Route' : 'Ready at Kitchen'}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white mt-1 truncate">
                          Delivery to {currentOrder.customerName}
                        </h3>
                      </div>
                    </div>

                    {/* Action Buttons: Consistent h-11 heights, fully contained in card boundaries */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 sm:justify-end">
                      {currentOrder.status !== 'on_the_way' && (
                        <button
                          type="button"
                          onClick={() => handleMarkPickedUp(currentOrder.orderId)}
                          className="h-11 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                          title="Confirm order picked up from kitchen counter and rider is departing"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Depart Counter</span>
                        </button>
                      )}

                      {onOpenCustomerTracking && (
                        <button
                          type="button"
                          onClick={() => onOpenCustomerTracking(currentOrder)}
                          className="h-11 px-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs text-gray-200 font-bold flex items-center justify-center gap-1.5 transition border border-white/10 shrink-0"
                          title="Preview Customer Live Tracking View"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-chonky-peach" />
                          <span className="hidden sm:inline">Tracking View</span>
                        </button>
                      )}

                      <button
                        onClick={() => openExternalNavigation(currentOrder.area, currentOrder.address)}
                        className="h-11 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition active:scale-95 shrink-0"
                        title="Open in Google Maps Navigation"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Navigate</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Map Canvas Container */}
                  <div className="w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#0F1012]">
                    <ChonkyLiveMap
                      orderId={currentOrder.orderId}
                      customerArea={currentOrder.area}
                      customerAddress={currentOrder.address}
                      orderStatus={currentOrder.status}
                      isFullPage={false}
                      className="w-full h-full absolute inset-0"
                    />

                    {/* Top Destination Floating Badge */}
                    <div className="absolute top-3.5 left-3.5 z-10 bg-[#121417]/95 backdrop-blur-md border border-white/15 p-3 rounded-2xl shadow-xl max-w-sm pointer-events-auto">
                      <div className="flex items-center gap-2 text-xs font-black text-white">
                        <MapPin className="w-4 h-4 text-[#E53945]" />
                        <span>Drop-off: {currentOrder.area}</span>
                      </div>
                      {currentOrder.address && (
                        <p className="text-[11px] text-gray-300 pl-6 truncate mt-0.5 font-medium">
                          {currentOrder.address}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Telemetry Live GPS Controls - Consistent h-11 button heights */}
                  <div className="bg-[#121417] p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs text-gray-300">
                      <Radio className={`w-4 h-4 ${isRealGpsActive || isSimulatingGps ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
                      <span>Telemetry: <strong>{isRealGpsActive ? 'Broadcasting Device GPS' : isSimulatingGps ? 'Simulating Ride' : 'Idle'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleGpsSimulation(currentOrder.orderId)}
                        className={`h-11 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isSimulatingGps ? 'bg-amber-500 text-black font-black' : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>{isSimulatingGps ? 'Simulating...' : 'Simulate Ride'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleRealGps(currentOrder.orderId)}
                        className={`h-11 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isRealGpsActive ? 'bg-emerald-500 text-black font-black' : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{isRealGpsActive ? 'Phone GPS On' : 'Use Phone GPS'}</span>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right: Customer Info, COD Calculator & Delivery PIN Verification (5 cols) */}
                <div className="lg:col-span-5 space-y-5">
                  
                  {/* Card 1: Customer Contact & Delivery Notes */}
                  <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-xl space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                          Customer
                        </span>
                        <h3 className="text-xl font-black text-white mt-0.5">{currentOrder.customerName}</h3>
                        <p className="text-xs text-gray-300 font-mono mt-0.5">{currentOrder.customerPhone}</p>
                      </div>

                      {/* Direct Action Buttons: Call & WhatsApp - Consistent h-11 heights */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`tel:${currentOrder.customerPhone}`}
                          className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-90 border border-white/10"
                          title="Call Customer"
                        >
                          <Phone className="w-4 h-4 text-emerald-400" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openWhatsApp(currentOrder.customerPhone, currentOrder.orderId, currentOrder.customerName)}
                          className="h-11 w-11 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 flex items-center justify-center transition active:scale-90"
                          title="WhatsApp Customer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Address & Delivery Notes */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                      <div className="flex items-start gap-2 text-xs">
                        <MapPin className="w-4 h-4 text-[#E53945] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-white">{currentOrder.area}</p>
                          <p className="text-gray-300">{currentOrder.address || 'Street address provided upon arrival'}</p>
                        </div>
                      </div>

                      {currentOrder.deliveryNotes && (
                        <div className="pt-2 border-t border-white/10 text-xs text-amber-300 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span><strong>Note: </strong>{currentOrder.deliveryNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Items Summary */}
                    <div className="text-xs text-gray-300 space-y-1">
                      <p className="font-bold text-white uppercase text-[11px] tracking-wider text-gray-400">Order Items ({currentOrder.items.length})</p>
                      {currentOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-0.5">
                          <span>{item.quantity}x {item.productName}</span>
                          <span className="font-mono text-gray-400">MVR {item.totalPrice}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: Cash on Delivery (COD) Assistant */}
                  <div className={`p-5 rounded-3xl border shadow-xl space-y-3 ${
                    currentOrder.paymentMethod === 'cash' 
                      ? 'bg-gradient-to-br from-[#1C1710] to-[#121417] border-amber-500/40' 
                      : 'bg-[#121417] border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <DollarSign className={`w-5 h-5 ${currentOrder.paymentMethod === 'cash' ? 'text-amber-400' : 'text-emerald-400'}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment Status</p>
                          <h4 className="text-lg font-black text-white">
                            {currentOrder.paymentMethod === 'cash' ? 'Cash on Delivery (COD)' : 'Paid Online'}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-white font-mono">
                          MVR {currentOrder.total}
                        </span>
                      </div>
                    </div>

                    {/* COD Quick Change Calculator - Consistent h-11 buttons */}
                    {currentOrder.paymentMethod === 'cash' && (
                      <div className="pt-3 border-t border-white/10 space-y-2.5">
                        <p className="text-xs text-gray-300 font-bold">Quick Change Calculator:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[currentOrder.total, Math.ceil(currentOrder.total / 100) * 100, 500, 1000].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setCashGiven(amt)}
                              className={`h-11 px-2 rounded-2xl text-xs font-bold border transition flex items-center justify-center ${
                                cashGiven === amt 
                                   ? 'bg-amber-500 text-black border-amber-400 font-black' 
                                   : 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                              }`}
                            >
                              Gives MVR {amt}
                            </button>
                          ))}
                        </div>

                        {cashGiven !== null && (
                          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-xs">
                            <span className="text-amber-300 font-bold">Change to Return:</span>
                            <span className="text-base font-black text-white font-mono">
                              MVR {Math.max(0, cashGiven - currentOrder.total)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card 3: CUSTOMER DELIVERY PIN VERIFICATION (Core Required Feature) */}
                  <div className="bg-gradient-to-br from-[#1C1214] via-[#151214] to-[#121417] p-5 sm:p-6 rounded-3xl border-2 border-[#E53945]/50 shadow-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#E53945]/20 border border-[#E53945]/40 text-[#E53945] flex items-center justify-center shrink-0">
                        <KeyRound className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white flex items-center gap-2">
                          <span>Customer Delivery PIN</span>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </h4>
                        <p className="text-xs text-gray-300">
                          Ask customer for their 4-digit code shown on their phone
                        </p>
                      </div>
                    </div>

                    {/* PIN Input Box - Fully follows card boundaries on mobile and desktop */}
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="0000"
                          value={enteredPin}
                          onChange={(e) => {
                            setEnteredPin(e.target.value.replace(/\D/g, ''));
                            setPinError(null);
                          }}
                          className="h-12 flex-1 min-w-0 bg-black/60 border-2 border-white/20 focus:border-[#E53945] rounded-2xl px-4 text-center font-mono font-black text-2xl tracking-[0.4em] text-white placeholder-gray-600 focus:outline-none transition shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifyAndDeliver(currentOrder.orderId)}
                          className="h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-2 shrink-0"
                        >
                          <span>Verify & Complete</span>
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Error or Success feedback */}
                      {pinError && (
                        <p className="text-xs text-rose-400 font-bold bg-rose-950/40 border border-rose-800/40 p-2 rounded-xl">
                          {pinError}
                        </p>
                      )}
                      {pinSuccess && (
                        <p className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-xl flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>{pinSuccess}</span>
                        </p>
                      )}

                      {/* Unattended Drop Override */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-gray-500 font-mono">
                          Hint for demo: {currentOrder.deliveryPin || currentOrder.orderId.replace(/\D/g, '').slice(-4) || '1234'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEmergencyOverride(currentOrder.orderId)}
                          className="text-[11px] text-gray-400 hover:text-white underline"
                        >
                          Doorstep / Unattended Drop
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* No Active Order: Empty State */
              <div className="bg-[#121417] p-12 rounded-3xl border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                  <Bike className="w-8 h-8 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">No Active Delivery Ride</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    You have no delivery ride in progress right now. Check available kitchen pickups below.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('available')}
                  className="h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg transition active:scale-95 inline-flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4 text-amber-300" />
                  <span>View Available Pickups ({availablePickupOrders.length})</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AVAILABLE ORDERS READY AT KITCHEN COUNTER                          */}
        {/* ========================================================================= */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Available Kitchen Pickups</h2>
                  <p className="text-xs sm:text-sm text-gray-400">Orders at Chonky Kitchen (Roashanee Magu, Henveiru) ready to ride.</p>
                </div>
              </div>

              <span className="px-3.5 py-1.5 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold">
                🛵 {availablePickupOrders.length} Ready for Dispatch
              </span>
            </div>

            {/* List of Available Pickups */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availablePickupOrders.length === 0 ? (
                <div className="col-span-full py-16 text-center text-gray-500 text-base font-bold bg-[#121417] rounded-3xl border border-white/10">
                  No pending delivery orders at the kitchen right now.
                </div>
              ) : (
                availablePickupOrders.map(order => (
                  <div
                    key={order.orderId}
                    className="bg-[#14161A] p-5 rounded-3xl border border-white/10 hover:border-white/25 transition shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-black text-sm px-2.5 py-1 rounded-xl bg-black/60 text-[#F2E2C7] border border-white/10">
                          {order.orderId}
                        </span>
                        <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-xl ${
                          order.status === 'preparing' 
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {order.status === 'preparing' ? 'Ready on Counter' : 'New Order'}
                        </span>
                      </div>

                      {/* Customer & Area */}
                      <div className="mt-3">
                        <h4 className="text-base font-black text-white">{order.customerName}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-300 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E53945] shrink-0" />
                          <span className="font-bold text-white">{order.area}</span>
                        </div>
                        {order.address && (
                          <p className="text-xs text-gray-400 truncate pl-5 mt-0.5">{order.address}</p>
                        )}
                      </div>

                      {/* Items & Payment */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                        <span>{order.items.length} items ({order.items.reduce((s, i) => s + i.quantity, 0)} packages)</span>
                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-white">MVR {order.total}</span>
                          <p className="text-[10px] text-gray-400 uppercase font-mono">{order.paymentMethod.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Accept Ride Button - Uniform h-12 height, respects card boundaries */}
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(order.orderId)}
                      className="w-full h-12 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Accept Ride & Start Delivery</span>
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SHIFT HISTORY & CASH REMITTANCE                                    */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            
            {/* Shift Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  COD Cash to Remit
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                  MVR {shiftMetrics.cashToRemit.toLocaleString()}
                </p>
                <p className="text-xs text-amber-400 mt-1">Hand over to kitchen cashier</p>
              </div>

              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Drops Completed Today
                </p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5 font-mono">
                  {shiftMetrics.completedCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">Verified with Customer PIN</p>
              </div>

              <div className="bg-[#121417] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                  <Bike className="w-4 h-4 text-blue-400" />
                  Active Deliveries
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-mono">
                  {shiftMetrics.activeCount}
                </p>
                <p className="text-xs text-gray-400 mt-1">In progress</p>
              </div>
            </div>

            {/* Completed Drops Table */}
            <div className="bg-[#121417] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="p-4 bg-[#16181C] border-b border-white/10 flex items-center justify-between">
                <h3 className="font-black text-sm text-white">Completed Drop-offs Today</h3>
                <span className="text-xs text-gray-400 font-mono">Shift Rider: {rider.name}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#14161A] text-gray-400 uppercase font-bold text-xs border-b border-white/10 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Area</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">PIN Verified</th>
                      <th className="py-3.5 px-4 text-right">Delivered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {completedOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500 font-bold">
                          No completed deliveries recorded in this shift yet.
                        </td>
                      </tr>
                    ) : (
                      completedOrders.map(order => (
                        <tr key={order.orderId} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {order.orderId}
                          </td>
                          <td className="py-3.5 px-4 text-white font-bold">
                            {order.customerName}
                          </td>
                          <td className="py-3.5 px-4 text-gray-300">
                            {order.area}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-white">MVR {order.total}</span>
                            <span className="text-xs text-gray-400 ml-2 uppercase font-mono">({order.paymentMethod.replace('_', ' ')})</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>{order.deliveryPin || 'Verified'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right text-xs text-gray-400">
                            {order.deliveredAt 
                              ? new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Completed'}
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

    </div>
  );
};
