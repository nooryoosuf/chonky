export type CategoryId = 'all' | 'burgers' | 'submarines' | 'pizza' | 'sides' | 'drinks' | 'deals';

export interface Category {
  id: CategoryId;
  name: string;
  iconName?: string;
  description?: string;
}

export interface OptionChoice {
  id: string;
  name: string;
  priceDelta: number; // additional price in MVR
  isDefault?: boolean;
}

export interface OptionGroup {
  id: string;
  title: string;
  required: boolean;
  minSelections?: number;
  maxSelections?: number;
  choices: OptionChoice[];
}

export interface ExtraItem {
  id: string;
  name: string;
  price: number; // MVR
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  basePrice: number; // in MVR
  image: string;
  badge?: 'Bestseller' | 'New' | 'Chef\'s Pick' | 'Hot' | 'Spicy' | 'Popular';
  isPopular?: boolean;
  isAvailable?: boolean;
  calories?: string;
  prepTime?: string;
  optionGroups?: OptionGroup[];
  extras?: ExtraItem[];
}

export interface SelectedOption {
  groupId: string;
  groupTitle: string;
  choiceId: string;
  choiceName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique cart item id (hash of product id + options + extras)
  productId: string;
  productName: string;
  image: string;
  basePrice: number;
  selectedOptions: SelectedOption[];
  selectedExtras: ExtraItem[];
  specialInstructions?: string;
  quantity: number;
  unitPrice: number; // basePrice + options delta + extras sum
  totalPrice: number; // unitPrice * quantity
}

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethod = 'bml_pay' | 'card' | 'cash' | 'transfer' | 'bml_transfer' | 'card_pos';

export interface DeliveryLocation {
  id: string;
  area: string;
  deliveryFee: number; // MVR
  estTime: string;
}

export interface OrderDetails {
  orderId: string;
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  area: string;
  address?: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  transferSlip?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  total: number;
  createdAt: string;
  status: 'received' | 'preparing' | 'on_the_way' | 'delivered';
}
