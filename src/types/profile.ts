export interface SavedAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  address: string;
  notes?: string;
  isDefault?: boolean;
}

export interface PaymentCard {
  id: string;
  brand: 'BML' | 'Visa' | 'Mastercard';
  last4: string;
  holderName: string;
  expiry: string;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  addresses: SavedAddress[];
  paymentCards: PaymentCard[];
  loyaltyPoints: number; // e.g. 1 point per 10 MVR spent or 50 points per order
  tier: 'Chonky Scout' | 'Burger Connoisseur' | 'Sourdough Legend' | 'VIP Craver';
  totalOrdersCount: number;
  totalSpent: number;
}
