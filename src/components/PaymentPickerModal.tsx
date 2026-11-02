import React from 'react';
import { useCart } from '../context/CartContext';
import { PaymentMethod } from '../types';
import { 
  X, 
  Check, 
  QrCode, 
  CreditCard, 
  Banknote, 
  ArrowRightLeft,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface PaymentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'bml_pay',
    name: 'BML Pay',
    badge: 'Popular & Fastest',
    badgeColor: 'bg-red-500 text-white',
    description: 'Pay instantly using Bank of Maldives App QR or Mobile Gateway.',
    subtitle: 'Instant mobile verification',
    icon: QrCode
  },
  {
    id: 'card',
    name: 'Card',
    badge: 'Visa / MC / Amex',
    badgeColor: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    description: 'Rider brings contactless POS machine to your doorstep.',
    subtitle: 'Tap to pay with Debit/Credit Card',
    icon: CreditCard
  },
  {
    id: 'cash',
    name: 'Cash on Delivery',
    description: 'Hand physical cash to the delivery driver upon receiving order.',
    subtitle: 'Exact change appreciated',
    icon: Banknote
  },
  {
    id: 'transfer',
    name: 'Transfer',
    badge: 'BML MVR',
    badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
    description: 'Direct account transfer to Chonky BML Account 7730000123456.',
    subtitle: 'Add order ID to remarks',
    icon: ArrowRightLeft
  }
];

export const getPaymentMethodInfo = (method: PaymentMethod) => {
  if (method === 'bml_pay' || method === 'bml_transfer') {
    return { name: 'BML Pay', icon: QrCode };
  }
  if (method === 'card' || method === 'card_pos') {
    return { name: 'Card', icon: CreditCard };
  }
  if (method === 'transfer') {
    return { name: 'Transfer', icon: ArrowRightLeft };
  }
  return { name: 'Cash', icon: Banknote };
};

export const PaymentPickerModal: React.FC<PaymentPickerModalProps> = ({ isOpen, onClose }) => {
  const { paymentMethod, setPaymentMethod } = useCart();

  if (!isOpen) return null;

  const handleSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog / Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0e0707] text-chonky-text dark:text-[#F7F3EE] rounded-t-[2rem] sm:rounded-3xl shadow-2xl z-10 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 border border-chonky-border/70 dark:border-white/10 pb-[max(1.5rem,env(safe-area-inset-bottom,16px))] sm:pb-6">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-chonky-border dark:border-white/10 flex items-center justify-between bg-chonky-peach-light/40 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-chonky-red text-white flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-chonky-text dark:text-white leading-tight">
                Select Payment Method
              </h3>
              <p className="text-xs text-chonky-muted dark:text-gray-400">
                Choose how you'd like to pay for your crave bag
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-chonky-muted dark:text-gray-400 hover:text-chonky-text dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            aria-label="Close payment options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Methods List */}
        <div className="p-4 sm:p-6 space-y-2.5">
          {PAYMENT_METHODS.map((pm) => {
            const Icon = pm.icon;
            const isSelected = 
              paymentMethod === pm.id || 
              (pm.id === 'bml_pay' && paymentMethod === 'bml_transfer') ||
              (pm.id === 'card' && paymentMethod === 'card_pos');

            return (
              <div
                key={pm.id}
                onClick={() => handleSelect(pm.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/15 ring-2 ring-chonky-red shadow-sm'
                    : 'border-chonky-border/80 dark:border-white/10 bg-white dark:bg-[#150a0a] hover:border-chonky-red/40 dark:hover:border-white/20 hover:bg-chonky-peach-light/30 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'bg-chonky-red text-white shadow-xs' 
                      : 'bg-chonky-peach/60 dark:bg-white/10 text-chonky-red dark:text-chonky-peach'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm sm:text-base text-chonky-text dark:text-white">
                        {pm.name}
                      </span>
                      {pm.badge && (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${pm.badgeColor || 'bg-chonky-peach text-chonky-red'}`}>
                          {pm.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-chonky-muted dark:text-gray-400 mt-0.5 truncate">
                      {pm.subtitle}
                    </p>
                  </div>
                </div>

                {/* Selection Radio / Checkmark */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                  isSelected
                    ? 'border-chonky-red bg-chonky-red text-white shadow-xs'
                    : 'border-chonky-border dark:border-white/20 bg-transparent'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}

          <div className="pt-2 flex items-center justify-center gap-2 text-xs text-chonky-muted dark:text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>100% Secure Maldivian Payment Processing</span>
          </div>
        </div>

      </div>
    </div>
  );
};
