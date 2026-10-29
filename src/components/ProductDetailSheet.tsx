import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { SelectedOption, ExtraItem } from '../types';
import { X, Plus, Minus, Check, AlertCircle, Sparkles } from 'lucide-react';

export const ProductDetailSheet: React.FC = () => {
  const { 
    customizingProduct, 
    editingCartItem, 
    closeCustomizer, 
    addToCart 
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // iPhone sheet swipe-to-dismiss gesture state
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isAddingSuccess, setIsAddingSuccess] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  // Initialize or reset selections when product opens or changes
  useEffect(() => {
    if (!customizingProduct) {
      setQuantity(1);
      setSelectedOptions({});
      setSelectedExtras([]);
      setSpecialInstructions('');
      setHasAttemptedSubmit(false);
      setDragY(0);
      setIsAddingSuccess(false);
      setIsDismissing(false);
      return;
    }

    setIsAddingSuccess(false);
    setIsDismissing(false);
    setDragY(0);

    if (editingCartItem && editingCartItem.productId === customizingProduct.id) {
      // Editing existing cart item
      setQuantity(editingCartItem.quantity);
      const optMap: Record<string, string> = {};
      editingCartItem.selectedOptions.forEach(opt => {
        optMap[opt.groupId] = opt.choiceId;
      });
      setSelectedOptions(optMap);
      setSelectedExtras(editingCartItem.selectedExtras.map(e => e.id));
      setSpecialInstructions(editingCartItem.specialInstructions || '');
    } else {
      // New customization: populate default options
      const defaultOpts: Record<string, string> = {};
      customizingProduct.optionGroups?.forEach(group => {
        const defaultChoice = group.choices.find(c => c.isDefault) || group.choices[0];
        if (defaultChoice && group.required) {
          defaultOpts[group.id] = defaultChoice.id;
        }
      });
      setSelectedOptions(defaultOpts);
      setSelectedExtras([]);
      setSpecialInstructions('');
      setQuantity(1);
    }
    setHasAttemptedSubmit(false);
    setDragY(0);
  }, [customizingProduct, editingCartItem]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && customizingProduct) {
        closeCustomizer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customizingProduct, closeCustomizer]);

  // Lock body scroll when modal/sheet is open
  useEffect(() => {
    if (customizingProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [customizingProduct]);

  // Check required options validation
  const validationStatus = useMemo(() => {
    if (!customizingProduct?.optionGroups) return { isValid: true, missingGroups: [] };
    const missing: string[] = [];
    customizingProduct.optionGroups.forEach(group => {
      if (group.required && !selectedOptions[group.id]) {
        missing.push(group.title);
      }
    });
    return {
      isValid: missing.length === 0,
      missingGroups: missing
    };
  }, [customizingProduct, selectedOptions]);

  // Calculate live total price
  const { calculatedTotalPrice, chosenOptionsList, chosenExtrasList } = useMemo(() => {
    if (!customizingProduct) {
      return { calculatedTotalPrice: 0, chosenOptionsList: [], chosenExtrasList: [] };
    }

    let extraPrice = 0;
    const chosenOptions: SelectedOption[] = [];
    const chosenExtras: ExtraItem[] = [];

    // Options
    customizingProduct.optionGroups?.forEach(group => {
      const selectedChoiceId = selectedOptions[group.id];
      if (selectedChoiceId) {
        const choice = group.choices.find(c => c.id === selectedChoiceId);
        if (choice) {
          extraPrice += choice.priceDelta;
          chosenOptions.push({
            groupId: group.id,
            groupTitle: group.title,
            choiceId: choice.id,
            choiceName: choice.name,
            priceDelta: choice.priceDelta
          });
        }
      }
    });

    // Extras
    customizingProduct.extras?.forEach(extra => {
      if (selectedExtras.includes(extra.id)) {
        extraPrice += extra.price;
        chosenExtras.push(extra);
      }
    });

    const singleUnitPrice = customizingProduct.basePrice + extraPrice;
    return {
      calculatedTotalPrice: singleUnitPrice * quantity,
      chosenOptionsList: chosenOptions,
      chosenExtrasList: chosenExtras
    };
  }, [customizingProduct, selectedOptions, selectedExtras, quantity]);

  if (!customizingProduct) return null;

  const handleOptionSelect = (groupId: string, choiceId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: choiceId
    }));
  };

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => {
      if (prev.includes(extraId)) {
        return prev.filter(id => id !== extraId);
      } else {
        return [...prev, extraId];
      }
    });
  };

  const handleCloseWithAnimation = () => {
    setIsDismissing(true);
    setTimeout(() => {
      closeCustomizer();
    }, 260);
  };

  const handleAddToCart = () => {
    setHasAttemptedSubmit(true);
    if (!validationStatus.isValid) {
      return;
    }

    setIsAddingSuccess(true);

    // 1. Brief rewarding tactile checkmark
    setTimeout(() => {
      setIsDismissing(true);

      // 2. Smooth fluid slide-down dismissal
      setTimeout(() => {
        addToCart(
          customizingProduct,
          chosenOptionsList,
          chosenExtrasList,
          specialInstructions,
          quantity,
          editingCartItem ? editingCartItem.id : undefined
        );
      }, 260);
    }, 220);
  };

  // Fluid iPhone gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!contentRef.current || contentRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      // iPhone rubber-band resistance curve
      const dampening = 1 + diff * 0.0025;
      setDragY(diff / dampening);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 110) {
      handleCloseWithAnimation();
    } else {
      setDragY(0);
    }
    touchStartY.current = null;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ${
      isDismissing ? 'pointer-events-none' : ''
    }`}>
      {/* Backdrop with Fade-In Animation */}
      <div 
        className={`fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-260 ${
          isDismissing ? 'opacity-0' : 'animate-fade-in-backdrop'
        }`}
        onClick={handleCloseWithAnimation}
      />

      {/* Main iPhone-like Modal / Sheet Container */}
      <div
        ref={sheetRef}
        style={{ 
          transform: isDismissing 
            ? 'translateY(105%) scale(0.96)' 
            : dragY > 0 
            ? `translateY(${dragY}px)` 
            : undefined,
          transition: isDismissing
            ? 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.22s ease-out'
            : dragY === 0 
            ? 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)' 
            : 'none'
        }}
        className={`relative w-full md:max-w-xl lg:max-w-2xl bg-white dark:bg-[#080404] text-chonky-text dark:text-[#F7F3EE] rounded-t-[36px] sm:rounded-t-[40px] md:rounded-[40px] shadow-[0_-12px_45px_rgba(0,0,0,0.35)] md:shadow-[0_25px_70px_rgba(0,0,0,0.5)] z-10 max-h-[94vh] md:max-h-[88vh] flex flex-col overflow-hidden font-sans border-t border-black/5 md:border dark:border-white/10 ${
          isDismissing ? 'opacity-0' : dragY > 0 ? '' : 'animate-slide-up-modal'
        }`}
      >
        {/* Floating iPhone Grab Indicator directly over image */}
        <div 
          className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none md:hidden flex justify-center"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-white/75 backdrop-blur-md shadow-xs" />
        </div>

        {/* Scrollable Content Body */}
        <div 
          ref={contentRef}
          className="overflow-y-auto flex-1 overscroll-contain min-h-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Hero Image Section - Touches the VERY TOP of the modal flush with rounded-t corners */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-chonky-subtle dark:bg-black/50 overflow-hidden">
            <img
              src={customizingProduct.image}
              alt={customizingProduct.name}
              className="w-full h-full object-cover select-none"
            />
            {/* Top vignette gradient for grab handle & close button visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

            {/* Apple style Frosted Circular Close Button */}
            <button
              onClick={handleCloseWithAnimation}
              className="absolute top-3.5 right-3.5 z-30 w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20 active:scale-90"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Price & Name overlay directly on image bottom */}
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
              <div className="max-w-[70%]">
                {customizingProduct.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-chonky-peach text-chonky-red mb-2 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    {customizingProduct.badge}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-black drop-shadow-md leading-tight font-sans">
                  {customizingProduct.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-300 uppercase font-bold tracking-wider block">Base Price</span>
                <p className="text-xl sm:text-2xl font-black text-chonky-peach drop-shadow-md leading-none">
                  MVR {customizingProduct.basePrice}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 border-b border-chonky-border/60 dark:border-white/10">
            <p className="text-xs sm:text-sm text-chonky-muted dark:text-gray-300 leading-relaxed font-normal">
              {customizingProduct.description}
            </p>
          </div>

          {/* Option Groups (Required selections) */}
          {customizingProduct.optionGroups?.map((group) => {
            const hasSelection = !!selectedOptions[group.id];
            const isMissing = hasAttemptedSubmit && group.required && !hasSelection;

            return (
              <div
                key={group.id}
                className={`p-5 border-b border-chonky-border/60 dark:border-white/10 transition ${
                  isMissing ? 'bg-rose-50/60 dark:bg-rose-950/30' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-chonky-text dark:text-white font-sans">
                      {group.title}
                    </h3>
                    {group.required ? (
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isMissing
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach'
                      }`}>
                        Required · Pick 1
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-chonky-muted dark:text-gray-400">
                        Optional
                      </span>
                    )}
                  </div>

                  {hasSelection && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      Selected
                    </span>
                  )}
                </div>

                {isMissing && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-2.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Please choose one option to continue.
                  </p>
                )}

                {/* Option Choice Radio Cards with iPhone style rounded-2xl */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.choices.map((choice) => {
                    const isSelected = selectedOptions[group.id] === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleOptionSelect(group.id, choice.id)}
                        className={`text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between active:scale-[0.98] ${
                          isSelected
                            ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-1 ring-chonky-red'
                            : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:border-chonky-red/40 hover:bg-chonky-peach-light/30 dark:hover:bg-white/10'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-bold text-xs sm:text-sm text-chonky-text dark:text-white">
                            {choice.name}
                          </p>
                          {choice.priceDelta !== 0 && (
                            <p className="text-xs font-black text-chonky-red dark:text-[#ff6666] mt-0.5">
                              {choice.priceDelta > 0 ? `+ MVR ${choice.priceDelta}` : `- MVR ${Math.abs(choice.priceDelta)}`}
                            </p>
                          )}
                        </div>

                        {/* Radio Indicator */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-chonky-red bg-chonky-red text-white'
                            : 'border-chonky-border dark:border-white/20 bg-white dark:bg-transparent'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Extras / Add-ons Checklist */}
          {customizingProduct.extras && customizingProduct.extras.length > 0 && (
            <div className="p-5 border-b border-chonky-border/60 dark:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-chonky-text dark:text-white font-sans">
                  Craving Something Extra?
                </h3>
                <span className="text-[11px] font-medium text-chonky-muted dark:text-gray-400">
                  Optional add-ons
                </span>
              </div>

              <div className="space-y-2">
                {customizingProduct.extras.map((extra) => {
                  const isChecked = selectedExtras.includes(extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => handleExtraToggle(extra.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between active:scale-[0.98] ${
                        isChecked
                          ? 'border-chonky-red bg-chonky-red/5 dark:bg-chonky-red/20 ring-1 ring-chonky-red'
                          : 'border-chonky-border dark:border-white/10 bg-white dark:bg-white/5 hover:border-chonky-red/40 hover:bg-chonky-peach-light/30 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-xs sm:text-sm text-chonky-text dark:text-white">
                          {extra.name}
                        </p>
                        {extra.description && (
                          <p className="text-[11px] text-chonky-muted dark:text-gray-400 mt-0.5">
                            {extra.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-chonky-red dark:text-[#ff6666]">
                          + MVR {extra.price}
                        </span>
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'border-chonky-red bg-chonky-red text-white'
                            : 'border-chonky-border dark:border-white/20 bg-white dark:bg-transparent'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="instructions" className="font-bold text-xs sm:text-sm text-chonky-text dark:text-white">
                Special Instructions
              </label>
              <span className="text-[11px] text-chonky-muted dark:text-gray-400">
                {specialInstructions.length}/150
              </span>
            </div>
            <textarea
              id="instructions"
              maxLength={150}
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Extra napkins, sauce on the side, no onions..."
              className="w-full p-3.5 text-xs sm:text-sm border border-chonky-border dark:border-white/10 bg-white dark:bg-[#0D0707] rounded-2xl focus:outline-none focus:ring-2 focus:ring-chonky-red/20 focus:border-chonky-red text-chonky-text dark:text-white transition resize-none placeholder:text-chonky-muted/60 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Sticky Bottom Action Area - Balanced Equal Padding & Aligned Heights */}
        <div className="p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom,24px))] sm:pb-6 border-t border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#080404]/95 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quantity Stepper (iOS Segmented Pill matching CTA height) */}
            <div className="h-[54px] flex items-center border border-chonky-border dark:border-white/15 rounded-full bg-chonky-subtle dark:bg-white/10 px-2 gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-full bg-white dark:bg-[#1A0D0D] text-chonky-text dark:text-white hover:bg-chonky-peach dark:hover:bg-white/20 flex items-center justify-center disabled:opacity-40 transition shadow-xs active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center text-sm font-black text-chonky-text dark:text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.min(20, prev + 1))}
                className="w-9 h-9 rounded-full bg-white dark:bg-[#1A0D0D] text-chonky-text dark:text-white hover:bg-chonky-peach dark:hover:bg-white/20 flex items-center justify-center transition shadow-xs active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart CTA Button with Fluid Press & Confirmation Animation */}
            <button
              type="button"
              disabled={isAddingSuccess}
              onClick={handleAddToCart}
              className={`h-[54px] flex-1 px-6 rounded-full font-black text-sm sm:text-base flex items-center justify-between transition-all transform duration-200 active:scale-95 shadow-glow-red ${
                isAddingSuccess
                  ? 'bg-emerald-600 text-white scale-[1.01]'
                  : 'bg-chonky-red hover:bg-chonky-red-light text-white'
              }`}
            >
              {isAddingSuccess ? (
                <div className="flex items-center justify-center gap-2 w-full">
                  <Check className="w-5 h-5 stroke-[3] animate-badge-pop" />
                  <span>{editingCartItem ? 'Order Updated!' : 'Added to Crave Bag!'}</span>
                </div>
              ) : (
                <>
                  <span>
                    {editingCartItem ? 'Update Order' : 'Add to Cart'}
                  </span>
                  <span className="font-black tracking-tight text-base sm:text-lg">
                    MVR {calculatedTotalPrice}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
