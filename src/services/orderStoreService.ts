import { OrderDetails } from '../types';

const STORAGE_KEY = 'chonky_orders_master_v1';
const CHANNEL_NAME = 'chonky_orders_channel';

// Realistic sample orders for Malé / Hulhumalé so the admin is immediately testable
const INITIAL_SAMPLE_ORDERS: OrderDetails[] = [
  {
    orderId: 'CHK-4821',
    orderType: 'delivery',
    customerName: 'Aishath Nazeer',
    customerPhone: '+960 791-2345',
    customerEmail: 'aishath.n@gmail.com',
    area: 'Henveiru, Malé',
    address: 'H. Everglade, 3rd Floor, Roashanee Magu',
    deliveryNotes: 'Ring bell twice, leave with security if not answering.',
    paymentMethod: 'bml_pay',
    items: [
      {
        id: 'chk-item-1',
        productId: 'burger-1',
        productName: 'The Chonky OG Smash',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
        basePrice: 165,
        selectedOptions: [
          { groupId: 'patty', groupTitle: 'Patty Count', choiceId: 'double', choiceName: 'Double Smash Patty', priceDelta: 0 }
        ],
        selectedExtras: [
          { id: 'ex-1', name: 'Extra Cheddar Melt', price: 25 },
          { id: 'ex-2', name: 'Crispy Jalapeños', price: 15 }
        ],
        specialInstructions: 'No onions please, extra napkins.',
        quantity: 2,
        unitPrice: 205,
        totalPrice: 410
      },
      {
        id: 'chk-item-2',
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
    subtotal: 485,
    deliveryFee: 0,
    packagingFee: 10,
    total: 495,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    status: 'received'
  },
  {
    orderId: 'CHK-3982',
    orderType: 'delivery',
    customerName: 'Mohamed Ibrahim',
    customerPhone: '+960 778-8921',
    area: 'Hulhumalé Phase 2',
    address: 'Hiyaa Tower H12, Apt 1404',
    deliveryNotes: 'Call on arrival at the tower lobby entrance.',
    paymentMethod: 'bml_transfer',
    transferSlip: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    items: [
      {
        id: 'chk-item-3',
        productId: 'burger-2',
        productName: 'Truffle Smokehouse Beast',
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
        basePrice: 195,
        selectedOptions: [],
        selectedExtras: [
          { id: 'ex-3', name: 'Smoked Beef Bacon', price: 35 }
        ],
        specialInstructions: 'Well done patty please.',
        quantity: 1,
        unitPrice: 230,
        totalPrice: 230
      },
      {
        id: 'chk-item-4',
        productId: 'drink-1',
        productName: 'Chonky Cold Brew Float',
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
        basePrice: 55,
        selectedOptions: [],
        selectedExtras: [],
        quantity: 2,
        unitPrice: 55,
        totalPrice: 110
      }
    ],
    subtotal: 340,
    deliveryFee: 35,
    packagingFee: 10,
    total: 385,
    createdAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 mins ago
    status: 'preparing'
  },
  {
    orderId: 'CHK-3105',
    orderType: 'delivery',
    customerName: 'Mariyam Shifna',
    customerPhone: '+960 765-4321',
    area: 'Maafannu, Malé',
    address: 'M. Kanbaa Aisaa Rani Higun, Flat 2B',
    deliveryNotes: 'Near Rasfannu beach pavilion.',
    paymentMethod: 'cash',
    items: [
      {
        id: 'chk-item-5',
        productId: 'sub-1',
        productName: 'Philly Steak Hearth Sub',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        basePrice: 155,
        selectedOptions: [],
        selectedExtras: [],
        specialInstructions: 'Toasted extra crispy.',
        quantity: 1,
        unitPrice: 155,
        totalPrice: 155
      }
    ],
    subtotal: 155,
    deliveryFee: 25,
    packagingFee: 10,
    total: 190,
    createdAt: new Date(Date.now() - 22 * 60 * 1000).toISOString(), // 22 mins ago
    status: 'on_the_way'
  },
  {
    orderId: 'CHK-2870',
    orderType: 'pickup',
    customerName: 'Ahmed Rilwan',
    customerPhone: '+960 798-1122',
    area: 'Henveiru, Malé',
    deliveryNotes: 'Picking up at Henveiru counter.',
    paymentMethod: 'card_pos',
    items: [
      {
        id: 'chk-item-6',
        productId: 'pizza-1',
        productName: 'Double Pepperoni Detroit Pan',
        image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80',
        basePrice: 220,
        selectedOptions: [],
        selectedExtras: [],
        quantity: 1,
        unitPrice: 220,
        totalPrice: 220
      }
    ],
    subtotal: 220,
    deliveryFee: 0,
    packagingFee: 10,
    total: 230,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'delivered'
  }
];

let broadcastChannel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return null;
  if (!broadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      broadcastChannel = null;
    }
  }
  return broadcastChannel;
}

export const orderStoreService = {
  getOrders(): OrderDetails[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveOrders(INITIAL_SAMPLE_ORDERS);
        return INITIAL_SAMPLE_ORDERS;
      }
      return JSON.parse(raw) as OrderDetails[];
    } catch (e) {
      console.warn('Failed to load orders from localStorage:', e);
      return INITIAL_SAMPLE_ORDERS;
    }
  },

  saveOrders(orders: OrderDetails[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      const ch = getChannel();
      if (ch) {
        ch.postMessage({ type: 'ORDERS_UPDATED', payload: orders });
      }
    } catch (e) {
      console.warn('Failed to save orders:', e);
    }
  },

  addOrder(order: OrderDetails): void {
    const current = this.getOrders();
    // Prepend new order
    const updated = [order, ...current.filter(o => o.orderId !== order.orderId)];
    this.saveOrders(updated);
    this.playKitchenChime();
  },

  updateOrderStatus(orderId: string, status: OrderDetails['status']): OrderDetails | null {
    const current = this.getOrders();
    let updatedOrder: OrderDetails | null = null;
    const next = current.map(o => {
      if (o.orderId === orderId) {
        updatedOrder = { ...o, status };
        return updatedOrder;
      }
      return o;
    });

    if (updatedOrder) {
      this.saveOrders(next);
      // Also broadcast specific status change for customer view
      const ch = getChannel();
      if (ch) {
        ch.postMessage({ type: 'ORDER_STATUS_CHANGED', payload: { orderId, status } });
      }
    }
    return updatedOrder;
  },

  deleteOrder(orderId: string): void {
    const current = this.getOrders();
    const next = current.filter(o => o.orderId !== orderId);
    this.saveOrders(next);
  },

  resetToDefaults(): void {
    this.saveOrders(INITIAL_SAMPLE_ORDERS);
  },

  subscribe(callback: (orders: OrderDetails[]) => void): () => void {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          callback(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    const ch = getChannel();
    const handleChannel = (event: MessageEvent) => {
      if (event.data?.type === 'ORDERS_UPDATED' && Array.isArray(event.data.payload)) {
        callback(event.data.payload);
      }
    };

    window.addEventListener('storage', handleStorage);
    if (ch) {
      ch.addEventListener('message', handleChannel);
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (ch) {
        ch.removeEventListener('message', handleChannel);
      }
    };
  },

  /**
   * Synthesize a melodic kitchen order chime using Web Audio API (Zero external assets needed)
   */
  playKitchenChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Bright cheerful chime)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.5);
      });
    } catch {
      // Audio autoplay may be restricted until user interaction
    }
  }
};
