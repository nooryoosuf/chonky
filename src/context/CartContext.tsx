import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  CartItem, 
  Product, 
  SelectedOption, 
  ExtraItem, 
  DeliveryLocation, 
  OrderDetails, 
  OrderType,
  PaymentMethod 
} from '../types';
import { DELIVERY_LOCATIONS, PRODUCTS } from '../data/menuData';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  total: number;
  freeDeliveryThreshold: number;
  freeDeliveryRemaining: number;
  selectedLocation: DeliveryLocation;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isLocationSelectorOpen: boolean;
  customizingProduct: Product | null;
  editingCartItem: CartItem | null;
  completedOrder: OrderDetails | null;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  setSelectedLocation: (location: DeliveryLocation) => void;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openLocationSelector: () => void;
  closeLocationSelector: () => void;
  openCustomizer: (product: Product) => void;
  openEditCustomizer: (cartItem: CartItem) => void;
  closeCustomizer: () => void;
  addToCart: (
    product: Product, 
    options: SelectedOption[], 
    extras: ExtraItem[], 
    specialInstructions: string, 
    quantity: number,
    existingItemId?: string
  ) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  placeOrder: (details: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address?: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
  }) => OrderDetails;
  resetCompletedOrder: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'chonky_cart_v1';
const LOCATION_STORAGE_KEY = 'chonky_location_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedLocation, setSelectedLocationState] = useState<DeliveryLocation>(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const match = DELIVERY_LOCATIONS.find(l => l.id === parsed.id);
        if (match) return match;
      }
    } catch {
      // fallback
    }
    return DELIVERY_LOCATIONS[0];
  });

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderDetails | null>(null);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const setSelectedLocation = (location: DeliveryLocation) => {
    setSelectedLocationState(location);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch (e) {
      console.error('Failed to save location', e);
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };
  const closeCheckout = () => setIsCheckoutOpen(false);
  const openLocationSelector = () => setIsLocationSelectorOpen(true);
  const closeLocationSelector = () => setIsLocationSelectorOpen(false);

  const openCustomizer = (product: Product) => {
    setEditingCartItem(null);
    setCustomizingProduct(product);
  };

  const openEditCustomizer = (cartItem: CartItem) => {
    setEditingCartItem(cartItem);
    const prod = PRODUCTS.find(p => p.id === cartItem.productId);
    if (prod) {
      setCustomizingProduct(prod);
    }
  };

  const closeCustomizer = () => {
    setCustomizingProduct(null);
    setEditingCartItem(null);
  };

  // Helper to create a deterministic hash ID for identical customizations
  const generateCartItemId = (
    productId: string, 
    options: SelectedOption[], 
    extras: ExtraItem[], 
    instructions: string
  ) => {
    const optKey = [...options].sort((a, b) => a.groupId.localeCompare(b.groupId))
      .map(o => `${o.groupId}:${o.choiceId}`).join('|');
    const extKey = [...extras].sort((a, b) => a.id.localeCompare(b.id))
      .map(e => e.id).join('|');
    const noteKey = (instructions || '').trim().toLowerCase();
    return `${productId}_${optKey}_${extKey}_${noteKey}`;
  };

  const addToCart = (
    product: Product, 
    options: SelectedOption[], 
    extras: ExtraItem[], 
    specialInstructions: string, 
    quantity: number,
    existingItemId?: string
  ) => {
    const optionsTotal = options.reduce((sum, o) => sum + o.priceDelta, 0);
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.basePrice + optionsTotal + extrasTotal;
    const newId = generateCartItemId(product.id, options, extras, specialInstructions);

    setItems(prevItems => {
      // If we are replacing an existing edited item:
      if (existingItemId) {
        const filtered = prevItems.filter(item => item.id !== existingItemId);
        // Check if newId already exists in remaining items
        const existingIndex = filtered.findIndex(item => item.id === newId);
        if (existingIndex > -1) {
          const updated = [...filtered];
          const newQty = updated[existingIndex].quantity + quantity;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
            totalPrice: newQty * updated[existingIndex].unitPrice
          };
          return updated;
        } else {
          return [
            ...filtered,
            {
              id: newId,
              productId: product.id,
              productName: product.name,
              image: product.image,
              basePrice: product.basePrice,
              selectedOptions: options,
              selectedExtras: extras,
              specialInstructions: specialInstructions.trim(),
              quantity,
              unitPrice,
              totalPrice: unitPrice * quantity
            }
          ];
        }
      }

      // Normal addition:
      const existingIndex = prevItems.findIndex(item => item.id === newId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * updated[existingIndex].unitPrice
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            id: newId,
            productId: product.id,
            productName: product.name,
            image: product.image,
            basePrice: product.basePrice,
            selectedOptions: options,
            selectedExtras: extras,
            specialInstructions: specialInstructions.trim(),
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity
          }
        ];
      }
    });

    closeCustomizer();
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return {
            ...item,
            quantity: newQty,
            totalPrice: newQty * item.unitPrice
          };
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const freeDeliveryThreshold = 350; // MVR
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);
  
  const deliveryFee = orderType === 'pickup' || (subtotal >= freeDeliveryThreshold && subtotal > 0)
    ? 0 
    : (items.length > 0 ? selectedLocation.deliveryFee : 0);

  const packagingFee = items.length > 0 ? 10 : 0;
  const total = items.length > 0 ? subtotal + deliveryFee + packagingFee : 0;

  const placeOrder = (details: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    address?: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
  }): OrderDetails => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CHK-${randomNum}`;

    const newOrder: OrderDetails = {
      orderId,
      orderType,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      customerEmail: details.customerEmail,
      area: selectedLocation.area,
      address: details.address,
      deliveryNotes: details.deliveryNotes,
      paymentMethod: details.paymentMethod,
      items: [...items],
      subtotal,
      deliveryFee,
      packagingFee,
      total,
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    setCompletedOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const resetCompletedOrder = () => {
    setCompletedOrder(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        deliveryFee,
        packagingFee,
        total,
        freeDeliveryThreshold,
        freeDeliveryRemaining,
        selectedLocation,
        isCartOpen,
        isCheckoutOpen,
        isLocationSelectorOpen,
        customizingProduct,
        editingCartItem,
        completedOrder,
        orderType,
        setOrderType,
        setSelectedLocation,
        openCart,
        closeCart,
        openCheckout,
        closeCheckout,
        openLocationSelector,
        closeLocationSelector,
        openCustomizer,
        openEditCustomizer,
        closeCustomizer,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        placeOrder,
        resetCompletedOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
