import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES } from '../data/menuData';
import { CategoryId } from '../types';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
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
  Utensils, 
  Sandwich, 
  Pizza, 
  Cookie, 
  CupSoda, 
  Tag, 
  Bike,
  ChefHat 
} from 'lucide-react';

interface ProfilePageProps {
  onBackToHome: () => void;
  onSelectCategory: (catId: CategoryId) => void;
  onOpenAdmin?: () => void;
  onOpenDriver?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onBackToHome,
  onSelectCategory,
  onOpenAdmin,
  onOpenDriver
}) => {
  const { openTracking } = useCart();
  const { 
    profile, 
    orders, 
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

  // Edit Profile Form State
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Add Address State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrNotes, setNewAddrNotes] = useState('');

  // Add Card State
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardBrand, setNewCardBrand] = useState<'BML' | 'Visa' | 'Mastercard'>('BML');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState(profile.name.toUpperCase());
  const [newCardExpiry, setNewCardExpiry] = useState('');

  // Settings
  const [orderSmsUpdates, setOrderSmsUpdates] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

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

  const handleCategoryNavigate = (catId: CategoryId) => {
    onSelectCategory(catId);
    onBackToHome();
  };

  const getCategoryIcon = (id: CategoryId) => {
    switch (id) {
      case 'all': return <Utensils className="w-4 h-4" />;
      case 'burgers': return <Flame className="w-4 h-4" />;
      case 'submarines': return <Sandwich className="w-4 h-4" />;
      case 'pizza': return <Pizza className="w-4 h-4" />;
      case 'sides': return <Cookie className="w-4 h-4" />;
      case 'drinks': return <CupSoda className="w-4 h-4" />;
      case 'deals': return <Tag className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const nextTierPoints = 500;
  const progressPercent = Math.min(100, Math.round((profile.loyaltyPoints / nextTierPoints) * 100));

  return (
    <div className="min-h-screen bg-chonky-bg dark:bg-[#050303] text-chonky-text dark:text-[#F7F3EE] pb-28 sm:pb-24 pt-4 sm:pt-8 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-chonky-muted dark:text-gray-300 hover:text-chonky-red dark:hover:text-chonky-peach transition py-2 px-3 rounded-full hover:bg-chonky-peach-light/40 dark:hover:bg-white/10 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cravings</span>
          </button>

          <span className="text-xs font-black uppercase tracking-wider text-chonky-red dark:text-chonky-peach bg-chonky-peach/50 dark:bg-chonky-red/20 px-3 py-1 rounded-full">
            Customer Portal
          </span>
        </div>

        {/* User Hero Banner Card */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#160606] via-[#220909] to-[#080303] text-white p-6 sm:p-8 shadow-hover border border-chonky-red/30 overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-chonky-red/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-chonky-red text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-glow-red border-2 border-white/20 shrink-0">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {profile.name}
                  </h1>
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-chonky-peach text-chonky-red shadow-xs">
                    {profile.tier}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-chonky-peach/80 font-medium">
                  {profile.phone} · {profile.email}
                </p>
              </div>
            </div>

            {/* Loyalty Point Pill */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 shrink-0 self-start sm:self-auto">
              <Award className="w-7 h-7 text-amber-300 shrink-0" />
              <div>
                <p className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Crave Balance</p>
                <p className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {profile.loyaltyPoints} <span className="text-xs text-amber-300">PTS</span>
                </p>
              </div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-white/80">Progress to Next Tier: Sourdough Legend</span>
              <span className="text-chonky-peach font-mono">{profile.loyaltyPoints} / {nextTierPoints} PTS</span>
            </div>
            <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-chonky-peach via-amber-300 to-chonky-peach rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-white/60 mt-2">
              Unlock 10% instant discounts & VIP kitchen priority at {nextTierPoints} points!
            </p>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'categories', label: 'Browse Menu' },
            { id: 'orders', label: `Orders (${profile.totalOrdersCount})` },
            { id: 'addresses', label: 'Addresses' },
            { id: 'payments', label: 'Payment Cards' },
            { id: 'edit', label: 'Edit Profile' },
            { id: 'settings', label: 'Settings & Theme' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveProfileTab(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all ${
                activeProfileTab === tab.id
                  ? 'bg-chonky-red text-white shadow-glow-red scale-[1.02]'
                  : 'bg-white dark:bg-[#120808] text-chonky-muted dark:text-gray-300 hover:text-chonky-text dark:hover:text-white border border-chonky-border/70 dark:border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================== TAB CONTENT ===================== */}

        {/* TAB: BROWSE MENU CATEGORIES (Moved from horizontal navbar into dedicated section) */}
        {activeProfileTab === 'categories' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-black text-chonky-text dark:text-white">
                Chonky Food Categories
              </h3>
              <p className="text-xs text-chonky-muted dark:text-gray-400">
                Explore our full culinary collection or tap to jump straight to what you crave.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryNavigate(cat.id)}
                  className="p-5 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 hover:border-chonky-red dark:hover:border-chonky-red/60 transition shadow-xs hover:shadow-hover cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-chonky-peach/50 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center group-hover:bg-chonky-red group-hover:text-white transition-colors shadow-xs">
                      {getCategoryIcon(cat.id)}
                    </div>
                    <div>
                      <h4 className="font-black text-base text-chonky-text dark:text-white group-hover:text-chonky-red dark:group-hover:text-chonky-peach transition-colors">
                        {cat.name}
                      </h4>
                      {cat.description && (
                        <p className="text-xs text-chonky-muted dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-chonky-border/40 dark:border-white/5 flex items-center justify-between text-xs font-bold text-chonky-red dark:text-chonky-peach">
                    <span>Explore Section</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeProfileTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center mb-3">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-chonky-text dark:text-white">
                  {profile.totalOrdersCount}
                </p>
                <p className="text-xs text-chonky-muted dark:text-gray-400 font-semibold mt-0.5">
                  Orders Completed
                </p>
              </div>

              <div className="p-5 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <Flame className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-chonky-text dark:text-white">
                  MVR {profile.totalSpent}
                </p>
                <p className="text-xs text-chonky-muted dark:text-gray-400 font-semibold mt-0.5">
                  Total Cravings
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 p-5 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-3xl font-black text-chonky-text dark:text-white">
                  {profile.loyaltyPoints}
                </p>
                <p className="text-xs text-chonky-muted dark:text-gray-400 font-semibold mt-0.5">
                  Points Available
                </p>
              </div>
            </div>

            {/* Hub Section Navigation Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-chonky-muted dark:text-gray-400">
                Quick Shortcuts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div 
                  onClick={() => setActiveProfileTab('categories')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-chonky-peach/50 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Food Menu Categories</p>
                      <p className="text-xs text-chonky-muted dark:text-gray-400">Burgers, subs, pizza & sides</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-1 transition" />
                </div>

                <div 
                  onClick={() => setActiveProfileTab('orders')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-chonky-peach/50 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <ReceiptText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Live Orders & History</p>
                      <p className="text-xs text-chonky-muted dark:text-gray-400">{orders.length} previous cravings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-1 transition" />
                </div>

                <div 
                  onClick={() => setActiveProfileTab('addresses')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-chonky-peach/50 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Delivery Addresses</p>
                      <p className="text-xs text-chonky-muted dark:text-gray-400">{profile.addresses.length} saved destinations</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-1 transition" />
                </div>

                <div 
                  onClick={() => setActiveProfileTab('settings')}
                  className="p-4 rounded-2xl bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 flex items-center justify-between hover:border-chonky-red/50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-chonky-peach/50 dark:bg-white/10 flex items-center justify-center text-chonky-red dark:text-chonky-peach">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-chonky-text dark:text-white">Settings & Appearance</p>
                      <p className="text-xs text-chonky-muted dark:text-gray-400">Theme mode, SMS, sign out</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-chonky-muted group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ORDERS */}
        {activeProfileTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-chonky-text dark:text-white">
              Order History ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <div className="p-12 text-center rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10">
                <ShoppingBag className="w-12 h-12 mx-auto text-chonky-muted mb-3 opacity-40" />
                <p className="font-black text-base text-chonky-text dark:text-white">No cravings yet!</p>
                <p className="text-xs text-chonky-muted dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  When you place an order, it will appear here with instant rider progress, receipts, and loyalty points.
                </p>
                <button
                  onClick={onBackToHome}
                  className="mt-5 px-6 py-2.5 rounded-full bg-chonky-red text-white text-xs font-bold hover:bg-chonky-red-light transition shadow-glow-red"
                >
                  Order Food Now
                </button>
              </div>
            ) : (
              orders.map((ord) => (
                <div 
                  key={ord.orderId}
                  className="p-5 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-chonky-border/40 dark:border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-chonky-text dark:text-white">
                          {ord.orderId}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-chonky-muted dark:text-gray-400 mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-base sm:text-lg text-chonky-red dark:text-[#ff6666]">
                        MVR {ord.total}
                      </span>
                      <p className="text-[11px] text-chonky-muted dark:text-gray-400 capitalize">
                        {ord.paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-chonky-text dark:text-gray-200">
                          <strong className="text-chonky-red dark:text-chonky-peach font-bold">{it.quantity}x</strong> {it.productName}
                        </span>
                        <span className="text-chonky-muted dark:text-gray-400 font-medium">MVR {it.totalPrice}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex items-center justify-between text-xs text-chonky-muted dark:text-gray-400 border-t border-dashed border-chonky-border/40 dark:border-white/10">
                    <span>{ord.area}</span>
                    <button
                      onClick={() => openTracking(ord)}
                      className="px-3 py-1.5 rounded-full bg-chonky-red/10 hover:bg-chonky-red text-chonky-red hover:text-white transition font-black text-xs flex items-center gap-1.5 active:scale-95 shadow-xs"
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: ADDRESSES */}
        {activeProfileTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-chonky-text dark:text-white">
                Saved Delivery Addresses ({profile.addresses.length})
              </h3>
              {!isAddingAddress && (
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-chonky-red dark:text-chonky-peach bg-chonky-peach/50 dark:bg-white/10 px-3.5 py-1.5 rounded-full hover:bg-chonky-peach transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {isAddingAddress && (
              <form onSubmit={handleCreateAddress} className="p-5 rounded-[2rem] bg-chonky-peach-light/40 dark:bg-white/5 border border-chonky-peach dark:border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-chonky-text dark:text-white">Add Delivery Destination</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingAddress(false)}
                    className="text-xs text-chonky-muted hover:text-chonky-text font-bold"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="flex gap-2">
                  {(['Home', 'Work', 'Other'] as const).map(lbl => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setNewAddrLabel(lbl)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
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
                  placeholder="e.g. M. Coral Reef, 3rd Floor, Apt 302, Majeedhee Magu, Malé"
                  value={newAddrText}
                  onChange={(e) => setNewAddrText(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white"
                />

                <input
                  type="text"
                  placeholder="Landmark or Rider instructions (e.g. Near Redwave, ring bell 302)"
                  value={newAddrNotes}
                  onChange={(e) => setNewAddrNotes(e.target.value)}
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-chonky-red text-white font-black text-xs sm:text-sm shadow-glow-red"
                >
                  Save Address
                </button>
              </form>
            )}

            <div className="space-y-3">
              {profile.addresses.map((addr) => (
                <div 
                  key={addr.id}
                  className={`p-5 rounded-[2rem] border transition flex items-start justify-between gap-3 ${
                    addr.isDefault
                      ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-1 ring-chonky-red'
                      : 'border-chonky-border/70 dark:border-white/10 bg-white dark:bg-[#120808]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-chonky-peach/50 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs uppercase tracking-wider text-chonky-text dark:text-white">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-chonky-red text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-chonky-text dark:text-gray-200 mt-1 font-semibold">
                        {addr.address}
                      </p>
                      {addr.notes && (
                        <p className="text-xs text-chonky-muted dark:text-gray-400 mt-1 italic">
                          "{addr.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs font-bold text-chonky-muted dark:text-gray-400 hover:text-chonky-red px-2.5 py-1 rounded"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => removeAddress(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                      aria-label="Remove address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PAYMENT METHODS */}
        {activeProfileTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-chonky-text dark:text-white">
                Payment Cards ({profile.paymentCards.length})
              </h3>
              {!isAddingCard && (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-chonky-red dark:text-chonky-peach bg-chonky-peach/50 dark:bg-white/10 px-3.5 py-1.5 rounded-full hover:bg-chonky-peach transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              )}
            </div>

            {isAddingCard && (
              <form onSubmit={handleCreateCard} className="p-5 rounded-[2rem] bg-chonky-peach-light/40 dark:bg-white/5 border border-chonky-peach dark:border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-chonky-text dark:text-white">Link Payment Card</span>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCard(false)}
                    className="text-xs text-chonky-muted hover:text-chonky-text font-bold"
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
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
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
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white font-mono"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={newCardHolder}
                    onChange={(e) => setNewCardHolder(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white uppercase"
                  />
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full p-3 text-xs sm:text-sm rounded-xl border border-chonky-border dark:border-white/10 bg-white dark:bg-[#120808] text-chonky-text dark:text-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-chonky-red text-white font-black text-xs sm:text-sm shadow-glow-red"
                >
                  Save Card
                </button>
              </form>
            )}

            <div className="space-y-3">
              {profile.paymentCards.map((card) => (
                <div 
                  key={card.id}
                  className={`p-5 rounded-[2rem] border transition flex items-center justify-between gap-3 ${
                    card.isDefault
                      ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-1 ring-chonky-red'
                      : 'border-chonky-border/70 dark:border-white/10 bg-white dark:bg-[#120808]'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs tracking-wider shrink-0 shadow-xs">
                      {card.brand}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-chonky-text dark:text-white">
                          •••• •••• •••• {card.last4}
                        </span>
                        {card.isDefault && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-chonky-red text-white">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-chonky-muted dark:text-gray-400 mt-0.5">
                        Expires {card.expiry} · {card.holderName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!card.isDefault && (
                      <button
                        onClick={() => setDefaultPaymentCard(card.id)}
                        className="text-xs font-bold text-chonky-muted dark:text-gray-400 hover:text-chonky-red px-2.5 py-1 rounded"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => removePaymentCard(card.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition"
                      aria-label="Remove card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span>Card information is securely tokenized for 1-tap checkout across Malé and boat deliveries.</span>
            </div>
          </div>
        )}

        {/* TAB: EDIT PROFILE */}
        {activeProfileTab === 'edit' && (
          <div className="p-6 rounded-[2.5rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10">
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <h3 className="text-lg font-black text-chonky-text dark:text-white">
                Edit Personal Information
              </h3>

              {isSavedAlert && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-chonky-text dark:text-white mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-chonky-border dark:border-white/10 bg-chonky-subtle/40 dark:bg-black/30 text-chonky-text dark:text-white focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20 font-medium"
                  />
                  <User className="w-4 h-4 text-chonky-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chonky-text dark:text-white mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-chonky-border dark:border-white/10 bg-chonky-subtle/40 dark:bg-black/30 text-chonky-text dark:text-white focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20 font-medium"
                  />
                  <Phone className="w-4 h-4 text-chonky-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-chonky-text dark:text-white mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-chonky-border dark:border-white/10 bg-chonky-subtle/40 dark:bg-black/30 text-chonky-text dark:text-white focus:outline-none focus:border-chonky-red focus:ring-2 focus:ring-chonky-red/20 font-medium"
                  />
                  <Mail className="w-4 h-4 text-chonky-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="py-3.5 px-8 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-glow-red active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: SETTINGS & APPEARANCE */}
        {activeProfileTab === 'settings' && (
          <div className="space-y-5">
            <h3 className="text-lg font-black text-chonky-text dark:text-white">
              Settings & Preferences
            </h3>

            {/* Appearance Section */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-chonky-text dark:text-white">Color Theme Appearance</h4>
                  <p className="text-xs text-chonky-muted dark:text-gray-400 mt-0.5">
                    Select your preferred interface style (currently <strong className="capitalize text-chonky-red dark:text-chonky-peach">{theme} Mode</strong>)
                  </p>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-chonky-subtle dark:bg-white/10 border border-chonky-border dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      theme === 'light'
                        ? 'bg-white text-chonky-red shadow-xs'
                        : 'text-chonky-muted dark:text-gray-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
                      theme === 'dark'
                        ? 'bg-[#1E1111] text-amber-300 shadow-xs'
                        : 'text-chonky-muted dark:text-gray-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-chonky-muted dark:text-gray-400 border-t border-chonky-border/40 dark:border-white/5 pt-3">
                Dark mode provides high contrast with pitch obsidian `#050303` black and diffuse crimson backlighting.
              </p>
            </div>

            {/* Notification Toggles */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-4">
              <h4 className="text-base font-bold text-chonky-text dark:text-white">Alert Preferences</h4>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-chonky-peach/40 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-chonky-text dark:text-white">Live SMS Order Tracking</p>
                    <p className="text-xs text-chonky-muted dark:text-gray-400">Rider dispatch and delivery updates</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderSmsUpdates(!orderSmsUpdates)}
                  className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center ${
                    orderSmsUpdates ? 'bg-chonky-red justify-end' : 'bg-gray-300 dark:bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-5.5 h-5.5 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t border-chonky-border/40 dark:border-white/5 pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-chonky-peach/40 dark:bg-white/10 text-chonky-red dark:text-chonky-peach flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-chonky-text dark:text-white">Crave Club Drops & Deals</p>
                    <p className="text-xs text-chonky-muted dark:text-gray-400">Secret menu specials & double point days</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPromoAlerts(!promoAlerts)}
                  className={`w-12 h-6.5 rounded-full transition-colors p-0.5 flex items-center ${
                    promoAlerts ? 'bg-chonky-red justify-end' : 'bg-gray-300 dark:bg-white/20 justify-start'
                  }`}
                >
                  <div className="w-5.5 h-5.5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </div>

            {/* Staff & Kitchen Portal Card */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#1E1111] to-[#120808] border border-[#E53945]/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#700808] to-[#E53945] text-white flex items-center justify-center shadow-md">
                  <ChefHat className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">Chonky HQ Operations</h4>
                  <p className="text-xs text-[#F2E2C7]/80">Kitchen Display System (KDS), Ride Fleet Dispatch & Order Registry</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={onOpenAdmin || (() => { window.location.hash = '#admin'; })}
                  className="h-12 px-4 rounded-2xl bg-gradient-to-r from-[#700808] to-[#990D0D] hover:from-[#8A0A0A] hover:to-[#B51010] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#E53945]/50 shadow-md transition active:scale-95"
                >
                  <ChefHat className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Kitchen & Fleet KDS</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 ml-auto shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={onOpenDriver || (() => { window.location.hash = '#driver'; })}
                  className="h-12 px-4 rounded-2xl bg-gradient-to-r from-blue-900/80 to-blue-800/80 hover:from-blue-800 hover:to-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 border border-blue-500/40 shadow-md transition active:scale-95"
                >
                  <Bike className="w-4 h-4 text-blue-300 shrink-0" />
                  <span className="truncate">Chonky Rider App</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 ml-auto shrink-0" />
                </button>
              </div>
            </div>

            {/* Logout Container */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-[#120808] border border-chonky-border/70 dark:border-white/10 space-y-3">
              <h4 className="text-base font-bold text-chonky-text dark:text-white">Account Session</h4>
              <p className="text-xs text-chonky-muted dark:text-gray-400">
                Logged in as <strong>{profile.email}</strong>
              </p>

              {isConfirmingLogout ? (
                <div className="p-4 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 space-y-3 mt-3">
                  <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    Are you sure you want to log out of your Chonky profile?
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        onBackToHome();
                      }}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition"
                    >
                      Yes, Log Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingLogout(false)}
                      className="px-5 py-2 rounded-xl bg-white dark:bg-white/10 text-chonky-text dark:text-white font-bold text-xs border border-chonky-border dark:border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingLogout(true)}
                  className="py-3 px-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Profile</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
