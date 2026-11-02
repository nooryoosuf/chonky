import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  User, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Award, 
  Flame, 
  Sparkles, 
  ChevronRight, 
  Phone, 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  ShieldCheck,
  ReceiptText,
  Settings,
  Sun,
  Moon,
  LogOut,
  Bell,
  Smartphone,
  Info
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const { 
    profile, 
    orders, 
    isProfileOpen, 
    closeProfile, 
    activeProfileTab, 
    setActiveProfileTab,
    updateProfileInfo,
    addAddress,
    removeAddress,
    setDefaultAddress,
    addPaymentCard,
    removePaymentCard,
    setDefaultPaymentCard,
    logout
  } = useProfile();

  const { theme, toggleTheme } = useTheme();

  // Settings Toggles State
  const [orderSmsUpdates, setOrderSmsUpdates] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Add Address Modal/Form inline state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrNotes, setNewAddrNotes] = useState('');

  // Add Payment Card inline state
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardBrand, setNewCardBrand] = useState<'BML' | 'Visa' | 'Mastercard'>('BML');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(profile.name.toUpperCase());
  const [newCardExpiry, setNewCardExpiry] = useState('');

  if (!isProfileOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileInfo({ name, phone, email });
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 2000);
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    addAddress({
      label: newAddrLabel,
      address: newAddrText.trim(),
      notes: newAddrNotes.trim() || undefined,
      isDefault: profile.addresses.length === 0
    });
    setNewAddrText('');
    setNewAddrNotes('');
    setIsAddingAddress(false);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = newCardNumber.replace(/\D/g, '');
    const last4 = cleanNum.slice(-4) || '1234';
    addPaymentCard({
      brand: newCardBrand,
      last4,
      holderName: newCardHolder || profile.name.toUpperCase(),
      expiry: newCardExpiry || '12/28',
      isDefault: profile.paymentCards.length === 0
    });
    setNewCardNumber('');
    setIsAddingCard(false);
  };

  // Tier progress calculation
  const nextTierPoints = 500;
  const progressPercent = Math.min(100, Math.round((profile.loyaltyPoints / nextTierPoints) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-sans h-[100dvh] max-h-[100dvh] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={closeProfile}
      />

      {/* Main Profile Modal Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#080404] text-chonky-text dark:text-[#F7F3EE] rounded-3xl shadow-modal dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] z-10 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90dvh] sm:max-h-[86vh] flex flex-col border border-chonky-border/70 dark:border-white/10 my-auto">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-chonky-border dark:border-white/10 flex items-center justify-between bg-chonky-peach-light/40 dark:bg-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-chonky-red text-white flex items-center justify-center font-black text-sm shadow-glow-red">
              {profile.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-chonky-text dark:text-white leading-tight">
                  {profile.name}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-chonky-peach text-chonky-red dark:bg-chonky-red/30 dark:text-chonky-peach">
                  {profile.tier}
                </span>
              </div>
              <p className="text-xs text-chonky-muted dark:text-gray-400 font-medium">
                {profile.phone}
              </p>
            </div>
          </div>
          <button
            onClick={closeProfile}
            className="p-1.5 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-2 border-b border-chonky-border/60 dark:border-white/10 overflow-x-auto no-scrollbar shrink-0 bg-chonky-subtle/40 dark:bg-black/20 text-xs">
          <button
            onClick={() => setActiveProfileTab('overview')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeProfileTab === 'overview'
                ? 'bg-chonky-red text-white shadow-xs'
                : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveProfileTab('orders')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeProfileTab === 'orders'
                ? 'bg-chonky-red text-white shadow-xs'
                : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
            }`}
          >
            <span>Orders</span>
            <span className="text-[10px] bg-black/20 text-current px-1.5 py-0.2 rounded-full font-black">
              {profile.totalOrdersCount}
            </span>
          </button>
          <button
            onClick={() => setActiveProfileTab('addresses')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeProfileTab === 'addresses'
                ? 'bg-chonky-red text-white shadow-xs'
                : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
            }`}
          >
            Addresses
          </button>
          <button
            onClick={() => setActiveProfileTab('payments')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeProfileTab === 'payments'
                ? 'bg-chonky-red text-white shadow-xs'
                : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
            }`}
          >
            Payment Cards
          </button>
          <button
            onClick={() => setActiveProfileTab('edit')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              activeProfileTab === 'edit'
                ? 'bg-chonky-red text-white shadow-xs'
                : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveProfileTab('settings')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeProfileTab === 'settings'
                ? 'bg-chonky-red text-white shadow-xs'
                : 'text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 overscroll-contain">
          
          {/* TAB 1: OVERVIEW & LOYALTY POINTS */}
          {activeProfileTab === 'overview' && (
            <div className="space-y-5">
              {/* Loyalty Club Card */}
              <div className="relative rounded-[2rem] bg-gradient-to-br from-[#1b0808] via-[#280c0c] to-[#0a0303] text-white p-5 sm:p-6 shadow-hover border border-chonky-red/30 overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute right-0 top-0 w-44 h-44 bg-chonky-red/40 rounded-full blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex items-start justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-chonky-peach/20 text-chonky-peach text-[10px] font-black uppercase tracking-wider mb-2">
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                      <span>Chonky Crave Points</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                        {profile.loyaltyPoints}
                      </h3>
                      <span className="text-xs text-chonky-peach font-bold">PTS</span>
                    </div>
                    <p className="text-xs text-white/70 mt-1">
                      Earn 1 pt per MVR 10 spent + bonus on every delivered combo!
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Award className="w-6 h-6 text-amber-300" />
                  </div>
                </div>

                {/* Progress toward Next Tier */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-white/80">Next Tier: Sourdough Legend</span>
                    <span className="text-chonky-peach">{profile.loyaltyPoints} / {nextTierPoints} PTS</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-chonky-peach via-amber-300 to-chonky-peach rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-white/60 mt-2">
                    {nextTierPoints - profile.loyaltyPoints} more points to unlock 10% off all orders and priority delivery dispatch.
                  </p>
                </div>
              </div>

              {/* Stats Grid: Number of Orders & Total Spent */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center mb-2">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-chonky-text dark:text-white">
                    {profile.totalOrdersCount}
                  </p>
                  <p className="text-xs text-chonky-muted dark:text-gray-400 font-semibold mt-0.5">
                    Total Orders Placed
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <Flame className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-black text-chonky-text dark:text-white">
                    MVR {profile.totalSpent}
                  </p>
                  <p className="text-xs text-chonky-muted dark:text-gray-400 font-semibold mt-0.5">
                    Total Cravings Satisfied
                  </p>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                  Account Management
                </h4>
                
                <button
                  onClick={() => setActiveProfileTab('orders')}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/40 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-chonky-peach/40 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <ReceiptText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Order History & Receipts</p>
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400">View previous orders and reorder cravings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => setActiveProfileTab('addresses')}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/40 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-chonky-peach/40 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Saved Delivery Addresses</p>
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400">{profile.addresses.length} saved destinations</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => setActiveProfileTab('payments')}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/40 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-chonky-peach/40 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Payment Methods</p>
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400">{profile.paymentCards.length} cards connected</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeProfileTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                  Past Orders ({orders.length})
                </h4>
                <span className="text-xs text-chonky-red dark:text-chonky-peach font-bold">
                  Live History
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10">
                  <ShoppingBag className="w-10 h-10 mx-auto text-chonky-muted mb-2 opacity-50" />
                  <p className="font-bold text-sm text-chonky-text dark:text-white">No orders yet</p>
                  <p className="text-xs text-chonky-muted dark:text-gray-400 mt-1">Place your first order to start earning Chonky loyalty points!</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div 
                    key={ord.orderId}
                    className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-chonky-border/40 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-chonky-text dark:text-white">
                            {ord.orderId}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-chonky-muted dark:text-gray-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-chonky-red dark:text-[#ff6666]">
                          MVR {ord.total}
                        </span>
                        <p className="text-[10px] text-chonky-muted dark:text-gray-400 capitalize">
                          {ord.paymentMethod.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {/* Order items preview */}
                    <div className="space-y-1.5">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-chonky-text dark:text-gray-200">
                            <strong className="text-chonky-red dark:text-chonky-peach font-bold">{it.quantity}x</strong> {it.productName}
                          </span>
                          <span className="text-chonky-muted dark:text-gray-400 font-medium">MVR {it.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-chonky-muted dark:text-gray-400 border-t border-dashed border-chonky-border/40 dark:border-white/10">
                      <span>Delivered to {ord.area}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        +{Math.floor(ord.total / 10) + 20} PTS Earned
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: ADDRESS BOOK */}
          {activeProfileTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                  Saved Delivery Addresses ({profile.addresses.length})
                </h4>
                {!isAddingAddress && (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="inline-flex items-center gap-1 text-xs font-black text-chonky-red dark:text-chonky-peach hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Add New Address Form inline */}
              {isAddingAddress && (
                <form onSubmit={handleCreateAddress} className="p-4 rounded-2xl bg-chonky-peach-light/40 dark:bg-white/5 border border-chonky-peach dark:border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chonky-text dark:text-white">Add Delivery Address</span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingAddress(false)}
                      className="text-xs text-chonky-muted hover:text-chonky-text"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {/* Label buttons */}
                  <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map(lbl => (
                      <button
                        type="button"
                        key={lbl}
                        onClick={() => setNewAddrLabel(lbl)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          newAddrLabel === lbl
                            ? 'bg-chonky-red text-white'
                            : 'bg-white dark:bg-white/10 text-chonky-muted'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="e.g. M. Sunset Villa, 4th Floor, Apt 4B, Malé"
                    value={newAddrText}
                    onChange={(e) => setNewAddrText(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white"
                  />

                  <input
                    type="text"
                    placeholder="Landmark or Rider instructions (e.g. Blue gate, ring bell)"
                    value={newAddrNotes}
                    onChange={(e) => setNewAddrNotes(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-chonky-red text-white font-bold text-xs shadow-glow-red"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {/* List of saved addresses */}
              {profile.addresses.map((addr) => (
                <div 
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    addr.isDefault
                      ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20'
                      : 'border-chonky-border/70 dark:border-white/10 bg-white dark:bg-[#120808]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-chonky-peach/50 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-chonky-text dark:text-white">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-chonky-red text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-chonky-text dark:text-gray-200 mt-1 font-medium">
                        {addr.address}
                      </p>
                      {addr.notes && (
                        <p className="text-[11px] text-chonky-muted dark:text-gray-400 mt-0.5 italic">
                          "{addr.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-chonky-muted dark:text-gray-400 hover:text-chonky-red px-2 py-1 rounded"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition"
                      aria-label="Remove address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS */}
          {activeProfileTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                  Payment Cards ({profile.paymentCards.length})
                </h4>
                {!isAddingCard && (
                  <button
                    onClick={() => setIsAddingCard(true)}
                    className="inline-flex items-center gap-1 text-xs font-black text-chonky-red dark:text-chonky-peach hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Card</span>
                  </button>
                )}
              </div>

              {/* Add Card Form inline */}
              {isAddingCard && (
                <form onSubmit={handleCreateCard} className="p-4 rounded-2xl bg-chonky-peach-light/40 dark:bg-white/5 border border-chonky-peach dark:border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-chonky-text dark:text-white">Link Payment Card</span>
                    <button 
                      type="button" 
                      onClick={() => setIsAddingCard(false)}
                      className="text-xs text-chonky-muted hover:text-chonky-text"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {(['BML', 'Visa', 'Mastercard'] as const).map(b => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setNewCardBrand(b)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          newCardBrand === b
                            ? 'bg-chonky-red text-white'
                            : 'bg-white dark:bg-white/10 text-chonky-muted'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="Card Number (e.g. 4000 1234 5678 9010)"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white font-mono"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={newCardHolder}
                      onChange={(e) => setNewCardHolder(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white uppercase"
                    />
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-chonky-red text-white font-bold text-xs shadow-glow-red"
                  >
                    Save Card
                  </button>
                </form>
              )}

              {/* Cards list */}
              {profile.paymentCards.map((card) => (
                <div 
                  key={card.id}
                  className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    card.isDefault
                      ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20'
                      : 'border-chonky-border/70 dark:border-white/10 bg-white dark:bg-[#120808]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded-lg bg-black text-white flex items-center justify-center font-black text-[10px] tracking-wider shrink-0 shadow-xs">
                      {card.brand}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs sm:text-sm text-chonky-text dark:text-white">
                          •••• •••• •••• {card.last4}
                        </span>
                        {card.isDefault && (
                          <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-chonky-red text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400 mt-0.5">
                        Expires {card.expiry} · {card.holderName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefaultPaymentCard(card.id)}
                        className="text-[11px] font-bold text-chonky-muted dark:text-gray-400 hover:text-chonky-red px-2 py-1 rounded"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => removePaymentCard(card.id)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition"
                      aria-label="Remove card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                <span>Card data is securely handled with end-to-end tokenization for quick Malé delivery checkouts.</span>
              </div>
            </div>
          )}

          {/* TAB 5: EDIT PROFILE */}
          {activeProfileTab === 'edit' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                Personal Information
              </h4>

              {isSavedAlert && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20"
                  />
                  <User className="w-4 h-4 text-chonky-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20"
                  />
                  <Phone className="w-4 h-4 text-chonky-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chonky-text dark:text-white mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20"
                  />
                  <Mail className="w-4 h-4 text-chonky-muted absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-glow-red active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 6: SETTINGS, APPEARANCE & LOGOUT */}
          {activeProfileTab === 'settings' && (
            <div className="space-y-6">
              
              {/* Section 1: Appearance & Theme */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                  Appearance & Display
                </h4>
                
                <div className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Color Theme</p>
                      <p className="text-xs text-chonky-muted dark:text-gray-400">
                        Currently: <strong className="capitalize text-chonky-red dark:text-chonky-peach">{theme} Mode</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-1 rounded-2xl bg-chonky-subtle dark:bg-white/10 border border-chonky-border dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => theme !== 'light' && toggleTheme()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          theme === 'light'
                            ? 'bg-white text-chonky-red shadow-xs'
                            : 'text-chonky-muted dark:text-gray-400 hover:text-white'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5" />
                        <span>Light</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          theme === 'dark'
                            ? 'bg-[#1E1111] text-amber-300 shadow-xs'
                            : 'text-chonky-muted dark:text-gray-400 hover:text-white'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[11px] text-chonky-muted dark:text-gray-400 leading-relaxed border-t border-chonky-border/40 dark:border-white/5 pt-2">
                    Dark mode features deep obsidian backgrounds with warm crimson ambient glow backlights.
                  </p>
                </div>
              </div>

              {/* Section 2: Notifications & SMS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                  Notification Preferences
                </h4>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-chonky-peach/40 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-chonky-text dark:text-white">Order SMS Updates</p>
                        <p className="text-[11px] text-chonky-muted dark:text-gray-400">Rider tracking & arrival messages</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOrderSmsUpdates(!orderSmsUpdates)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        orderSmsUpdates ? 'bg-chonky-red justify-end' : 'bg-gray-300 dark:bg-white/20 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-chonky-border/40 dark:border-white/5 pt-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-chonky-peach/40 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-chonky-text dark:text-white">VIP Promo & Secret Drops</p>
                        <p className="text-[11px] text-chonky-muted dark:text-gray-400">Weekend specials & double loyalty points</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoAlerts(!promoAlerts)}
                      className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                        promoAlerts ? 'bg-chonky-red justify-end' : 'bg-gray-300 dark:bg-white/20 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: App & Business Info */}
              <div className="p-4 rounded-2xl bg-chonky-subtle dark:bg-white/5 border border-chonky-border/70 dark:border-white/10 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-chonky-text dark:text-white">
                  <Info className="w-4 h-4 text-chonky-red dark:text-chonky-peach" />
                  <span>About Chonky Maldives</span>
                </div>
                <p className="text-chonky-muted dark:text-gray-400 leading-relaxed">
                  Version 2.4.0 (Fresh Sourdough Release) · Kitchen: Roashanee Magu, Henveiru, Malé. Daily 12:00 PM – 1:00 AM.
                </p>
              </div>

              {/* Section 4: Log Out Danger Zone */}
              <div className="pt-2">
                {isConfirmingLogout ? (
                  <div className="p-4 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 space-y-3">
                    <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      Are you sure you want to log out of your Chonky profile?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={logout}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                      >
                        Yes, Log Out
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingLogout(false)}
                        className="flex-1 py-2 rounded-xl bg-white dark:bg-white/10 text-chonky-text dark:text-white font-bold text-xs border border-chonky-border dark:border-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingLogout(true)}
                    className="w-full py-3.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out of Account</span>
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer info strip */}
        <div className="shrink-0 p-3.5 bg-chonky-subtle dark:bg-white/5 text-center border-t border-chonky-border dark:border-white/10 text-xs text-chonky-muted dark:text-gray-400">
          Chonky VIP Member since 2026 · <strong className="text-chonky-text dark:text-white">Tier: {profile.tier}</strong>
        </div>

      </div>
    </div>
  );
};
