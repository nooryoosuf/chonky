import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SavedAddress, PaymentCard } from '../types/profile';
import { OrderDetails } from '../types';

interface ProfileContextType {
  profile: UserProfile;
  orders: OrderDetails[];
  isProfileOpen: boolean;
  openProfile: (tab?: 'overview' | 'orders' | 'addresses' | 'payments' | 'edit' | 'settings' | 'categories') => void;
  closeProfile: () => void;
  activeProfileTab: 'overview' | 'orders' | 'addresses' | 'payments' | 'edit' | 'settings' | 'categories';
  setActiveProfileTab: (tab: 'overview' | 'orders' | 'addresses' | 'payments' | 'edit' | 'settings' | 'categories') => void;
  updateProfileInfo: (info: { name: string; phone: string; email: string }) => void;
  addAddress: (addr: Omit<SavedAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addPaymentCard: (card: Omit<PaymentCard, 'id'>) => void;
  removePaymentCard: (id: string) => void;
  setDefaultPaymentCard: (id: string) => void;
  recordNewOrder: (order: OrderDetails) => void;
  updateOrderStatus: (orderId: string, status: OrderDetails['status']) => void;
  logout: () => void;
}

const PROFILE_STORAGE_KEY = 'chonky_profile_v1';
const ORDERS_STORAGE_KEY = 'chonky_orders_history_v1';

const INITIAL_PROFILE: UserProfile = {
  name: 'Ahmed Fayaz',
  phone: '+960 788-9900',
  email: 'fayaz@chonky.mv',
  addresses: [
    {
      id: 'addr_1',
      label: 'Home',
      address: 'M. Coral Reef, 3rd Floor, Apt 302, Majeedhee Magu, Malé',
      notes: 'Near Redwave Plaza, ring doorbell 302',
      isDefault: true,
    },
    {
      id: 'addr_2',
      label: 'Work',
      address: 'H. Aagé Building, Boduthakurufaanu Magu, Henveiru, Malé',
      notes: 'Reception desk at Level 4',
      isDefault: false,
    }
  ],
  paymentCards: [
    {
      id: 'card_1',
      brand: 'BML',
      last4: '8821',
      holderName: 'AHMED FAYAZ',
      expiry: '08/28',
      isDefault: true
    },
    {
      id: 'card_2',
      brand: 'Visa',
      last4: '4192',
      holderName: 'AHMED FAYAZ',
      expiry: '11/27',
      isDefault: false
    }
  ],
  loyaltyPoints: 340,
  tier: 'Burger Connoisseur',
  totalOrdersCount: 6,
  totalSpent: 2150
};

const INITIAL_ORDERS_SEED: OrderDetails[] = [
  {
    orderId: 'CK-89412',
    orderType: 'delivery',
    customerName: 'Ahmed Fayaz',
    customerPhone: '+960 788-9900',
    customerEmail: 'fayaz@chonky.mv',
    area: 'Henveiru, Malé',
    address: 'M. Coral Reef, 3rd Floor, Apt 302, Majeedhee Magu',
    deliveryNotes: 'Leave with guard if away',
    paymentMethod: 'bml_transfer',
    items: [
      {
        id: 'seed_1',
        productId: 'burger-1',
        productName: 'The Chonky Monster',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
        basePrice: 165,
        selectedOptions: [],
        selectedExtras: [],
        quantity: 2,
        unitPrice: 165,
        totalPrice: 330
      },
      {
        id: 'seed_2',
        productId: 'sides-1',
        productName: 'Truffle Parmesan Fries',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
        basePrice: 65,
        selectedOptions: [],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 65,
        totalPrice: 65
      }
    ],
    subtotal: 395,
    deliveryFee: 0,
    packagingFee: 10,
    total: 405,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'delivered'
  },
  {
    orderId: 'CK-76290',
    orderType: 'delivery',
    customerName: 'Ahmed Fayaz',
    customerPhone: '+960 788-9900',
    customerEmail: 'fayaz@chonky.mv',
    area: 'Henveiru, Malé',
    address: 'M. Coral Reef, 3rd Floor, Apt 302',
    paymentMethod: 'card_pos',
    items: [
      {
        id: 'seed_3',
        productId: 'sub-1',
        productName: 'Philly Cheesesteak Supreme',
        image: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
        basePrice: 175,
        selectedOptions: [],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 175,
        totalPrice: 175
      }
    ],
    subtotal: 175,
    deliveryFee: 20,
    packagingFee: 10,
    total: 205,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'delivered'
  }
];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [orders, setOrders] = useState<OrderDetails[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS_SEED;
    } catch {
      return INITIAL_ORDERS_SEED;
    }
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'orders' | 'addresses' | 'payments' | 'edit' | 'settings' | 'categories'>('overview');

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders history', e);
    }
  }, [orders]);

  const openProfile = (tab: 'overview' | 'orders' | 'addresses' | 'payments' | 'edit' | 'settings' | 'categories' = 'overview') => {
    setActiveProfileTab(tab);
    setIsProfileOpen(true);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const logout = () => {
    // Reset to demo guest state or default user
    setProfile({
      name: 'Guest Eater',
      phone: '+960 700-0000',
      email: 'guest@chonky.mv',
      addresses: [],
      paymentCards: [],
      loyaltyPoints: 0,
      tier: 'Chonky Scout',
      totalOrdersCount: 0,
      totalSpent: 0
    });
    setOrders([]);
    setIsProfileOpen(false);
  };

  const updateProfileInfo = (info: { name: string; phone: string; email: string }) => {
    setProfile(prev => ({
      ...prev,
      ...info
    }));
  };

  const addAddress = (addr: Omit<SavedAddress, 'id'>) => {
    const newId = `addr_${Date.now()}`;
    setProfile(prev => {
      const addresses = addr.isDefault
        ? prev.addresses.map(a => ({ ...a, isDefault: false }))
        : [...prev.addresses];
      return {
        ...prev,
        addresses: [{ ...addr, id: newId }, ...addresses]
      };
    });
  };

  const removeAddress = (id: string) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== id)
    }));
  };

  const setDefaultAddress = (id: string) => {
    setProfile(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => ({
        ...a,
        isDefault: a.id === id
      }))
    }));
  };

  const addPaymentCard = (card: Omit<PaymentCard, 'id'>) => {
    const newId = `card_${Date.now()}`;
    setProfile(prev => {
      const cards = card.isDefault
        ? prev.paymentCards.map(c => ({ ...c, isDefault: false }))
        : [...prev.paymentCards];
      return {
        ...prev,
        paymentCards: [{ ...card, id: newId }, ...cards]
      };
    });
  };

  const removePaymentCard = (id: string) => {
    setProfile(prev => ({
      ...prev,
      paymentCards: prev.paymentCards.filter(c => c.id !== id)
    }));
  };

  const setDefaultPaymentCard = (id: string) => {
    setProfile(prev => ({
      ...prev,
      paymentCards: prev.paymentCards.map(c => ({
        ...c,
        isDefault: c.id === id
      }))
    }));
  };

  const recordNewOrder = (order: OrderDetails) => {
    setOrders(prev => [order, ...prev]);

    // calculate points earned (1 point per 10 MVR spent + 20 bonus for completing order)
    const pointsEarned = Math.floor(order.total / 10) + 20;

    setProfile(prev => {
      const newOrdersCount = prev.totalOrdersCount + 1;
      const newTotalSpent = prev.totalSpent + order.total;
      const newPoints = prev.loyaltyPoints + pointsEarned;

      let tier: UserProfile['tier'] = 'Chonky Scout';
      if (newPoints >= 1000 || newOrdersCount >= 20) {
        tier = 'VIP Craver';
      } else if (newPoints >= 500 || newOrdersCount >= 10) {
        tier = 'Sourdough Legend';
      } else if (newPoints >= 200 || newOrdersCount >= 3) {
        tier = 'Burger Connoisseur';
      }

      return {
        ...prev,
        loyaltyPoints: newPoints,
        totalOrdersCount: newOrdersCount,
        totalSpent: newTotalSpent,
        tier
      };
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderDetails['status']) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        orders,
        isProfileOpen,
        openProfile,
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
        recordNewOrder,
        updateOrderStatus,
        logout
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
