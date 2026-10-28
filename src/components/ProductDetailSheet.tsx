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

  // Swipe-to-dismiss state for mobile bottom sheet
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  // Initialize or reset selections when product opens or changes
  useEffect(() => {
    if (!customizingProduct) {
      setQuantity(1);
      setSelectedOptions({});
      setSelectedExtras([]);
      setSpecialInstructions('');
      setHasAttemptedSubmit(false);
      setDragY(0);
      return;
    }

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
      unitPrice: singleUnitPrice,
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

  const handleAddToCart = () => {
    setHasAttemptedSubmit(true);
    if (!validationStatus.isValid) {
      return;
    }

    addToCart(
      customizingProduct,
      chosenOptionsList,
      chosenExtrasList,
      specialInstructions,
      quantity,
      editingCartItem ? editingCartItem.id : undefined
    );
  };

  // Touch handlers for swipe to dismiss on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow swipe to dismiss when at top of scroll
    if (sheetRef.current && sheetRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 120) {
      closeCustomizer();
    } else {
      setDragY(0);
    }
    touchStartY.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeCustomizer}
      />

      {/* Main Sheet / Modal Container */}
      <div
        ref={sheetRef}
        style={{ transform: dragY > 0 ? `translateY(${dragY}px)` : undefined }}
        className="relative w-full md:max-w-xl lg:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-sheet md:shadow-modal z-10 max-h-[92vh] md:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-250 transition-transform"
      >
        {/* Mobile Swipe Handle */}
        <div 
          className="md:hidden pt-3 pb-1 flex justify-center bg-white cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Scrollable Content Body */}
        <div 
          className="overflow-y-auto flex-1 overscroll-contain"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Hero Image Section with Close Button */}
          <div className="relative aspect-[16/9] w-full bg-chonky-subtle">
            <img
              src={customizingProduct.image}
              alt={customizingProduct.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Close Button */}
            <button
              onClick={closeCustomizer}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center transition border border-white/20"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Price Badge on Image */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                {customizingProduct.badge && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-chonky-peach text-chonky-red mb-1.5 shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    {customizingProduct.badge}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-black drop-shadow-md">
                  {customizingProduct.name}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-200 uppercase font-semibold">Base</span>
                <p className="text-xl sm:text-2xl font-black text-chonky-peach drop-shadow-md leading-none">
                  MVR {customizingProduct.basePrice}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 border-b border-chonky-border/60">
            <p className="text-xs sm:text-sm text-chonky-muted leading-relaxed">
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
                className={`p-5 border-b border-chonky-border/60 transition ${
                  isMissing ? 'bg-rose-50/60' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-chonky-text">
                      {group.title}
                    </h3>
                    {group.required ? (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isMissing
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-chonky-red/10 text-chonky-red'
                      }`}>
                        Required · Pick 1
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-chonky-muted">
                        Optional
                      </span>
                    )}
                  </div>

                  {hasSelection && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Selected
                    </span>
                  )}
                </div>

                {isMissing && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mb-2.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Please choose one option to continue.
                  </p>
                )}

                {/* Option Choice Radio Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.choices.map((choice) => {
                    const isSelected = selectedOptions[group.id] === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => handleOptionSelect(group.id, choice.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-chonky-red bg-chonky-red/5 ring-1 ring-chonky-red'
                            : 'border-chonky-border hover:border-chonky-red/40 hover:bg-chonky-peach-light/30'
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <p className="font-semibold text-xs sm:text-sm text-chonky-text">
                            {choice.name}
                          </p>
                          {choice.priceDelta !== 0 && (
                            <p className="text-xs font-bold text-chonky-red mt-0.5">
                              {choice.priceDelta > 0 ? `+ MVR ${choice.priceDelta}` : `- MVR ${Math.abs(choice.priceDelta)}`}
                            </p>
                          )}
                        </div>

                        {/* Radio Indicator */}
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-chonky-red bg-chonky-red text-white'
                            : 'border-chonky-border bg-white'
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
            <div className="p-5 border-b border-chonky-border/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm sm:text-base text-chonky-text">
                  Craving Something Extra?
                </h3>
                <span className="text-[11px] font-medium text-chonky-muted">
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
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isChecked
                          ? 'border-chonky-red bg-chonky-red/5 ring-1 ring-chonky-red'
                          : 'border-chonky-border hover:border-chonky-red/40 hover:bg-chonky-peach-light/30'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-xs sm:text-sm text-chonky-text">
                          {extra.name}
                        </p>
                        {extra.description && (
                          <p className="text-[11px] text-chonky-muted mt-0.5">
                            {extra.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-chonky-red">
                          + MVR {extra.price}
                        </span>
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'border-chonky-red bg-chonky-red text-white'
                            : 'border-chonky-border bg-white'
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
              <label htmlFor="instructions" className="font-bold text-xs sm:text-sm text-chonky-text">
                Special Instructions
              </label>
              <span className="text-[11px] text-chonky-muted">
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
              className="w-full p-3 text-xs sm:text-sm border border-chonky-border rounded-xl focus:outline-none focus:ring-2 focus:ring-chonky-red/20 focus:border-chonky-red transition resize-none placeholder:text-chonky-muted/60"
            />
          </div>
        </div>

        {/* Sticky Bottom Action Area */}
        <div className="p-4 sm:p-5 border-t border-chonky-border/80 bg-white/95 backdrop-blur-md safe-bottom">
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Quantity Stepper */}
            <div className="flex items-center border border-chonky-border rounded-full bg-chonky-subtle p-1 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
                className="w-8 h-8 rounded-full bg-white text-chonky-text hover:bg-chonky-peach flex items-center justify-center disabled:opacity-40 transition shadow-xs"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-chonky-text">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.min(20, prev + 1))}
                className="w-8 h-8 rounded-full bg-white text-chonky-text hover:bg-chonky-peach flex items-center justify-center transition shadow-xs"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart CTA Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 py-3 px-5 rounded-full bg-chonky-red hover:bg-chonky-red-light text-white font-bold text-sm sm:text-base flex items-center justify-between transition-all transform active:scale-98 shadow-md"
            >
              <span>
                {editingCartItem ? 'Update Order' : 'Add to Cart'}
              </span>
              <span className="font-black tracking-tight">
                MVR {calculatedTotalPrice}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
