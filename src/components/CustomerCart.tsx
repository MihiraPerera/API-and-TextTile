import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Percent, Check } from 'lucide-react';
import { CartItem, Product, ProductVariant, Color, Size, Coupon } from '../types';
import { COLORS, SIZES, INITIAL_COUPONS } from '../data';

interface CustomerCartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  variants: ProductVariant[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
  onCheckout: () => void;
  coupons?: Coupon[];
}

export default function CustomerCart({
  isOpen,
  onClose,
  cart,
  products,
  variants,
  onUpdateQuantity,
  onRemoveItem,
  appliedCoupon,
  onApplyCoupon,
  onCheckout,
  coupons
}: CustomerCartProps) {
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  // Compute calculated amounts
  const cartSubtotal = cart.reduce((acc, cItem) => {
    return acc + cItem.price * cItem.quantity;
  }, 0);

  // Automatic Free Shipping Threshold (Rs. 5,000)
  const isFreeShipping = cartSubtotal >= 5000;
  const shippingCharge = cartSubtotal > 0 && !isFreeShipping ? 350 : 0;

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discountAmount = Math.round(cartSubtotal * (appliedCoupon.value / 100));
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCharge);

  // Apply Coupon manual string submission
  const handleApplyCouponCode = (code: string) => {
    setCouponError('');
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    const availableCoupons = coupons && coupons.length > 0 ? coupons : INITIAL_COUPONS;
    const found = availableCoupons.find(c => c.code === normalized);
    if (!found) {
      setCouponError('Invalid coupon code entered');
      return;
    }

    if (!found.isActive) {
      setCouponError('This coupon is no longer active');
      return;
    }

    if (found.expiresAt && new Date(found.expiresAt).getTime() < Date.now()) {
      setCouponError('This promotional coupon code has expired.');
      return;
    }

    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
    if (found.activeDays && found.activeDays.length > 0 && !found.activeDays.includes(currentDay)) {
      setCouponError(`This offer is valid only on: ${found.activeDays.join(', ')}`);
      return;
    }

    if (cartSubtotal < found.minSpend) {
      setCouponError(`Min spend to use this coupon is Rs. ${found.minSpend.toLocaleString()}`);
      return;
    }

    onApplyCoupon(found);
    setCouponCodeInput('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-neutral-150 flex flex-col h-full animate-slideLeft rounded-l-2xl">
          
          {/* Header Panel */}
          <div className="px-6 py-5 border-b border-neutral-150 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-950" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-950">
                Shopping Bag ({cart.reduce((acc, c) => acc + c.quantity, 0)})
              </h2>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Elements List */}
          <div className="flex-1 overflow-y-auto py-5 px-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-400 rounded-2xl">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-800">Your bag is empty</p>
                  <p className="text-xs text-neutral-400 font-light max-w-[220px] mx-auto leading-relaxed">
                    Browse our Autumn-Winter collections to add bespoke garments.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-4 bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest py-3.5 px-8 rounded-xl cursor-pointer border border-neutral-950 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            ) : (
              cart.map((cartItem) => {
                const variant = variants.find(v => v.id === cartItem.variantId);
                const product = products.find(p => p.id === cartItem.productId);
                
                if (!variant || !product) return null;
 
                const color = COLORS.find(c => c.id === variant.colorId);
                const size = SIZES.find(s => s.id === variant.sizeId);

                return (
                  <div key={cartItem.id} className="flex gap-4 p-4 border border-neutral-150 relative bg-white transition-all rounded-xl">
                    
                    {/* Item Thumbnail */}
                    <div className="w-18 aspect-[3/4] overflow-hidden bg-neutral-50 flex-none border border-neutral-200 rounded-lg">
                      <img src={product.images[0]} alt={product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover object-center grayscale-[10%]" />
                    </div>

                    {/* Item Text Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-serif italic text-neutral-950 leading-snug line-clamp-2">{product.name}</h4>
                          <button 
                            onClick={() => onRemoveItem(cartItem.id)}
                            className="p-1 text-neutral-400 hover:text-neutral-950 transition-colors cursor-pointer"
                            title="Remove garment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variant Attributes */}
                        <div className="flex flex-wrap gap-2 items-center text-[9px] font-bold text-neutral-400 mt-2 uppercase tracking-wider font-sans">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 border border-neutral-300 inline-block rounded-full" style={{ backgroundColor: color?.hex }} />
                            {color?.name}
                          </span>
                          <span className="text-neutral-200">|</span>
                          <span>Fit Size: {size?.name}</span>
                          <span className="text-neutral-200">|</span>
                          <span>SKU: {variant.sku}</span>
                        </div>
                      </div>

                      {/* Item Actions/Pricing */}
                      <div className="flex items-center justify-between mt-3">
                        {/* Compact Qty Selector */}
                        <div className="flex items-center border border-neutral-300 text-xs font-bold bg-white h-7.5 justify-between w-22 px-2.5 rounded-lg">
                          <button 
                            onClick={() => onUpdateQuantity(cartItem.id, Math.max(1, cartItem.quantity - 1))}
                            className="p-0.5 text-neutral-400 hover:text-neutral-950 cursor-pointer"
                            disabled={cartItem.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="select-none text-[11px] font-sans text-neutral-800">{cartItem.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(cartItem.id, cartItem.quantity + 1)}
                            className="p-0.5 text-neutral-400 hover:text-neutral-950 cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Price computation */}
                        <span className="text-xs font-bold text-neutral-950 font-sans">
                          Rs. {(cartItem.price * cartItem.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Sizing & Promotional Sub-panel */}
          {cart.length > 0 && (
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-150 space-y-3.5 rounded-none select-none">
              
              {/* Free Delivery Bar Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-neutral-600">
                  <span>{isFreeShipping ? '🎉 Free delivery achieved!' : `Add Rs. ${(5000 - cartSubtotal).toLocaleString()} for free courier`}</span>
                  <span>Rs. {cartSubtotal.toLocaleString()} / Rs. 5,000</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-neutral-950 h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${Math.min(100, (cartSubtotal / 5000) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Promo Coupon Inputs */}
              <div className="space-y-2">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter coupon (WELCOME10)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-1 bg-white border border-neutral-300 px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 text-neutral-800 uppercase tracking-widest font-bold placeholder-neutral-400 rounded-xl"
                  />
                  <button
                    onClick={() => handleApplyCouponCode(couponCodeInput)}
                    className="bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 cursor-pointer rounded-xl border border-neutral-950 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Inline Applied Coupon Tag */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-white text-neutral-950 text-xs p-2.5 border border-neutral-950 rounded-xl">
                    <span className="flex items-center gap-1.5 font-bold tracking-widest uppercase text-[9px]">
                      <Tag className="w-3.5 h-3.5" /> {appliedCoupon.code} APPLIED (-{appliedCoupon.type === 'PERCENTAGE' ? `${appliedCoupon.value}%` : `Rs.${appliedCoupon.value}`})
                    </span>
                    <button 
                      onClick={() => onApplyCoupon(null)}
                      className="text-neutral-900 hover:text-black font-extrabold text-[9px] uppercase underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  /* Coupon Suggestions Trigger */
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Suggested codes:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {INITIAL_COUPONS.filter(c => cartSubtotal >= c.minSpend).map((c) => (
                        <button
                          key={c.code}
                          onClick={() => onApplyCoupon(c)}
                          className="bg-white hover:bg-neutral-50 text-neutral-800 font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-1.5 rounded-lg border border-neutral-300 cursor-pointer"
                          title={c.description}
                        >
                          {c.code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {couponError && (
                  <p className="text-[10px] text-red-650 font-bold">{couponError}</p>
                )}
              </div>
            </div>
          )}

          {/* Pricing & Checkout Summary Panel */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-neutral-150 space-y-4 rounded-none select-none">
              <div className="space-y-2.5 text-xs font-sans font-light">
                <div className="flex justify-between text-neutral-450">
                  <span>Cart Subtotal:</span>
                  <span className="font-bold text-neutral-800">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-neutral-950">
                    <span>Discount:</span>
                    <span className="font-bold">- Rs. {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-450">
                  <span>Courier Delivery Dispatch:</span>
                  <span className="font-bold text-neutral-800">
                    {shippingCharge === 0 ? 'Complimentary' : `Rs. ${shippingCharge}`}
                  </span>
                </div>
                <div className="border-t border-neutral-150 pt-4 flex justify-between text-sm items-baseline">
                  <span className="font-bold text-neutral-950 uppercase tracking-widest text-[11px]">Estimated total:</span>
                  <span className="text-xl font-bold text-neutral-950">Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Checkout Actions */}
              <button
                onClick={onCheckout}
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-[0.2em] py-4.5 flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xl border border-neutral-950"
              >
                <span>Bespoke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
