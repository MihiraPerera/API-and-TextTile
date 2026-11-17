import React, { useState, useMemo, useRef } from 'react';
import { ShieldCheck, Lock, CreditCard, Landmark, Truck, Check, HelpCircle, Gift, ArrowLeft, X, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CartItem, Product, ProductVariant, Color, Size, Coupon, OrderAddress, Order } from '../types';
import { COLORS, SIZES } from '../data';

interface CustomerCheckoutProps {
  cart: CartItem[];
  products: Product[];
  variants: ProductVariant[];
  appliedCoupon: Coupon | null;
  onPlaceOrder: (address: OrderAddress, paymentMethod: string, bankSlipUrl?: string) => void;
  onCancelCheckout: () => void;
}

export default function CustomerCheckout({
  cart,
  products,
  variants,
  appliedCoupon,
  onPlaceOrder,
  onCancelCheckout
}: CustomerCheckoutProps) {
  // Input fields state
  const [form, setForm] = useState<OrderAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Colombo',
    province: 'Western',
    postalCode: '',
    country: 'Sri Lanka'
  });

  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Bank slip upload state
  const [bankSlipUrl, setBankSlipUrl] = useState<string>('');
  const [bankSlipFileName, setBankSlipFileName] = useState<string>('');
  const [isUploadingSlip, setIsUploadingSlip] = useState<boolean>(false);
  const [slipUploadProgress, setSlipUploadProgress] = useState<number>(0);
  const [formErrorSummary, setFormErrorSummary] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Demo Auto-Fill helper
  const handleQuickFillDemo = () => {
    setForm({
      firstName: 'Amal',
      lastName: 'Perera',
      email: 'amal.perera@example.com',
      phone: '+94 77 123 4567',
      addressLine1: 'No. 45, Galle Road, Bambalapitiya',
      addressLine2: 'Suite 4B',
      city: 'Colombo',
      province: 'Western',
      postalCode: '00400',
      country: 'Sri Lanka'
    });

    if (paymentMethod === 'card') {
      setCardNumber('4111222233334444');
      setCardExpiry('12/28');
      setCardCVC('123');
    } else if (paymentMethod === 'bank' && !bankSlipUrl) {
      handleUseSampleSlip();
    }

    setErrors({});
    setFormErrorSummary('');
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, cItem) => acc + cItem.price * cItem.quantity, 0);
  }, [cart]);

  const isFreeShipping = cartSubtotal >= 5000;
  const shippingCharge = cartSubtotal > 0 && !isFreeShipping ? 350 : 0;

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < appliedCoupon.minSpend) return 0;
    if (appliedCoupon.type === 'PERCENTAGE') {
      const disc = Math.round(cartSubtotal * (appliedCoupon.value / 100));
      return appliedCoupon.maxDiscount && disc > appliedCoupon.maxDiscount ? appliedCoupon.maxDiscount : disc;
    }
    return appliedCoupon.value;
  }, [appliedCoupon, cartSubtotal]);

  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCharge);

  // Loyalty calculation: Rs. 100 spent = 1 point
  const earnedLoyaltyPoints = Math.floor(grandTotal / 100);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (formErrorSummary) {
      setFormErrorSummary('');
    }
  };

  const handleSlipFileSelect = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrors(prev => ({ ...prev, bankSlip: 'Please select a valid image file (JPG, PNG, WEBP) or PDF receipt document.' }));
      return;
    }
    
    setIsUploadingSlip(true);
    setSlipUploadProgress(20);
    setErrors(prev => ({ ...prev, bankSlip: '' }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSlipUploadProgress(70);
      setTimeout(() => {
        setSlipUploadProgress(100);
        setBankSlipUrl(result);
        setBankSlipFileName(file.name);
        setIsUploadingSlip(false);
      }, 350);
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleSlip = () => {
    setIsUploadingSlip(true);
    setSlipUploadProgress(40);
    setErrors(prev => ({ ...prev, bankSlip: '' }));
    
    const sampleSlip = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80";
    setTimeout(() => {
      setSlipUploadProgress(100);
      setBankSlipUrl(sampleSlip);
      setBankSlipFileName("Commercial_Bank_Transfer_Slip_REF89402.png");
      setIsUploadingSlip(false);
    }, 450);
  };

  const validateForm = () => {
    const tempErrors: { [key: string]: string } = {};
    const missing: string[] = [];

    if (!form.firstName.trim()) { tempErrors.firstName = 'First Name is required'; missing.push('First Name'); }
    if (!form.lastName.trim()) { tempErrors.lastName = 'Last Name is required'; missing.push('Last Name'); }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { tempErrors.email = 'Valid email is required'; missing.push('Email Address'); }
    if (!form.phone.trim() || form.phone.length < 9) { tempErrors.phone = 'Valid contact phone required (min 9 digits)'; missing.push('Contact Phone'); }
    if (!form.addressLine1.trim()) { tempErrors.addressLine1 = 'Street Address Line 1 is required'; missing.push('Address Line 1'); }
    if (!form.postalCode.trim()) { tempErrors.postalCode = 'Postal Code is required'; missing.push('Postal Code'); }

    if (paymentMethod === 'card') {
      if (!cardNumber.trim() || cardNumber.length < 16) { tempErrors.cardNumber = 'Invalid 16-digit card number'; missing.push('Card Number'); }
      if (!cardExpiry.trim()) { tempErrors.cardExpiry = 'Expiry required'; missing.push('Card Expiry'); }
      if (!cardCVC.trim() || cardCVC.length < 3) { tempErrors.cardCVC = 'CVC required'; missing.push('CVC'); }
    }

    if (paymentMethod === 'bank') {
      if (!bankSlipUrl) {
        tempErrors.bankSlip = 'Bank transfer slip upload is COMPULSORY. Please upload your deposit slip image before placing the order.';
        missing.push('Bank Transfer Slip Image');
      }
    }

    setErrors(tempErrors);

    if (missing.length > 0) {
      setFormErrorSummary(`Cannot place order. Please complete required fields: ${missing.join(', ')}.`);
      return false;
    }

    setFormErrorSummary('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onPlaceOrder(
        form,
        paymentMethod === 'card' ? 'Visa / Mastercard Secure Gateway' : paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer',
        paymentMethod === 'bank' ? bankSlipUrl : undefined
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Side: Contact / Shipping Forms (7 columns width) */}
        <div className="lg:col-span-7 space-y-8 bg-white border border-neutral-150 p-6 md:p-8 rounded-2xl">
          
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-150 pb-4 gap-2 select-none">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-950 flex items-center gap-1.5">
                Secure Checkout Portal
              </h2>
              <button
                type="button"
                onClick={handleQuickFillDemo}
                className="text-[10px] font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-amber-300 flex items-center gap-1"
                title="Auto-fill demo client address and payment details"
              >
                ⚡ Quick Fill Demo Details
              </button>
            </div>
            <button
              onClick={onCancelCheckout}
              className="text-xs text-neutral-400 hover:text-neutral-950 font-semibold underline underline-offset-4 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </button>
          </div>

          {formErrorSummary && (
            <div className="bg-red-50 border border-red-300 p-4 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2.5 shadow-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
              <div className="flex-grow">{formErrorSummary}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Contact Information */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2.5">
                <span className="w-5 h-5 bg-neutral-950 text-white flex items-center justify-center font-bold text-[10px] rounded-full">1</span>
                Contact Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="client@email.com"
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 placeholder-neutral-350 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                  {errors.email && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="+94 77 123 4567"
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 placeholder-neutral-350 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                  {errors.phone && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="space-y-4 border-t border-neutral-150 pt-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2.5">
                <span className="w-5 h-5 bg-neutral-950 text-white flex items-center justify-center font-bold text-[10px] rounded-full">2</span>
                Delivery Destination
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                  {errors.firstName && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                  {errors.lastName && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleInputChange}
                  placeholder="Street address, building number, block"
                  className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 placeholder-neutral-350 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                />
                {errors.addressLine1 && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.addressLine1}</p>}
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2 || ''}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, unit, floor"
                  className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 placeholder-neutral-350 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Province</label>
                  <input
                    type="text"
                    name="province"
                    value={form.province}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleInputChange}
                    placeholder="00100"
                    className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs text-neutral-900 placeholder-neutral-350 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                  {errors.postalCode && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.postalCode}</p>}
                </div>
              </div>
            </div>

            {/* 3. Secure Payment Method Selector */}
            <div className="space-y-4 border-t border-neutral-150 pt-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 flex items-center gap-2.5">
                <span className="w-5 h-5 bg-neutral-950 text-white flex items-center justify-center font-bold text-[10px] rounded-full">3</span>
                Secure Billing Channel
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`border p-5 flex flex-col justify-between h-24 cursor-pointer relative transition-all select-none rounded-xl ${
                  paymentMethod === 'card' ? 'border-neutral-950 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="paymentChannel"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="absolute top-4 right-4 accent-neutral-950 cursor-pointer"
                  />
                  <CreditCard className="w-5 h-5 text-neutral-850" />
                  <div>
                    <p className="text-xs font-bold text-neutral-950 leading-none">Credit / Debit</p>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">Visa / Mastercard</p>
                  </div>
                </label>

                <label className={`border p-5 flex flex-col justify-between h-24 cursor-pointer relative transition-all select-none rounded-xl ${
                  paymentMethod === 'cod' ? 'border-neutral-950 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="paymentChannel"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="absolute top-4 right-4 accent-neutral-950 cursor-pointer"
                  />
                  <Truck className="w-5 h-5 text-neutral-850" />
                  <div>
                    <p className="text-xs font-bold text-neutral-950 leading-none">Cash on Delivery</p>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">Pay on delivery</p>
                  </div>
                </label>

                <label className={`border p-5 flex flex-col justify-between h-24 cursor-pointer relative transition-all select-none rounded-xl ${
                  paymentMethod === 'bank' ? 'border-neutral-950 bg-neutral-50 shadow-xs' : 'border-neutral-200 hover:border-neutral-400 bg-white'
                }`}>
                  <input
                    type="radio"
                    name="paymentChannel"
                    value="bank"
                    checked={paymentMethod === 'bank'}
                    onChange={() => setPaymentMethod('bank')}
                    className="absolute top-4 right-4 accent-neutral-950 cursor-pointer"
                  />
                  <Landmark className="w-5 h-5 text-neutral-850" />
                  <div>
                    <p className="text-xs font-bold text-neutral-950 leading-none">Bank Transfer</p>
                    <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1.5">Direct Wire Transfer</p>
                  </div>
                </label>
              </div>

              {/* Dynamic Sub-form Inputs based on Payment selection */}
              {paymentMethod === 'card' && (
                <div className="bg-neutral-50 p-5 border border-neutral-150 space-y-4 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">
                    <Lock className="w-3.5 h-3.5 text-neutral-950" /> 256-bit SSL encrypted gateway
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                    />
                    {errors.cardNumber && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs font-bold focus:outline-none focus:border-neutral-950 rounded-xl text-center transition-colors"
                      />
                      {errors.cardExpiry && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.cardExpiry}</p>}
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">Security Code (CVC)</label>
                      <input
                        type="password"
                        maxLength={3}
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ''))}
                        placeholder="•••"
                        className="w-full bg-white border border-neutral-300 px-3.5 py-3 text-xs font-bold focus:outline-none focus:border-neutral-950 rounded-xl text-center tracking-widest transition-colors"
                      />
                      {errors.cardCVC && <p className="text-[10px] text-red-650 font-bold mt-1">{errors.cardCVC}</p>}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank' && (
                <div className="bg-neutral-50 p-5 border border-neutral-200 text-xs text-neutral-700 space-y-4 font-sans rounded-xl">
                  <div className="space-y-1.5 font-light">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-neutral-900 uppercase tracking-widest text-[9px]">Direct wire bank instructions:</p>
                      <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-red-200">
                        Slip Required *
                      </span>
                    </div>
                    <p><strong className="text-neutral-900 font-semibold">Bank:</strong> Commercial Bank of Ceylon PLC</p>
                    <p><strong className="text-neutral-900 font-semibold">Account Name:</strong> API &amp; Textile Private Limited</p>
                    <p><strong className="text-neutral-900 font-semibold">Account No:</strong> 1000 2345 6789 (Colombo Corporate Branch)</p>
                    <p><strong className="text-neutral-900 font-semibold">Branch Code:</strong> 014 (Main City Center)</p>
                  </div>

                  {/* MANDATORY SLIP UPLOAD BOX */}
                  <div className="border-t border-neutral-200/90 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-950">
                        Payment Transfer Slip Upload <span className="text-red-600 font-black">* COMPULSORY</span>
                      </label>
                    </div>
                    
                    <p className="text-[11px] text-neutral-500 font-light leading-relaxed">
                      Please attach a clear photo, screenshot, or PDF of your online bank transfer confirmation or deposit slip. Orders can only be placed after a valid transfer slip is attached.
                    </p>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleSlipFileSelect(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    {bankSlipUrl ? (
                      <div className="bg-emerald-50/90 border border-emerald-300 p-4 rounded-xl space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Slip Uploaded &amp; Verified</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setBankSlipUrl('');
                              setBankSlipFileName('');
                            }}
                            className="text-[10px] text-neutral-500 hover:text-red-650 font-bold underline cursor-pointer"
                          >
                            Remove / Change Slip
                          </button>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-200">
                          {bankSlipUrl.startsWith('data:image') || bankSlipUrl.startsWith('http') ? (
                            <img src={bankSlipUrl} alt="Bank Slip Preview" className="w-14 h-14 object-cover rounded border border-neutral-200 shrink-0" />
                          ) : (
                            <div className="w-14 h-14 bg-neutral-100 rounded flex items-center justify-center text-neutral-600 shrink-0">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="text-xs font-sans overflow-hidden">
                            <p className="font-bold text-neutral-900 truncate">{bankSlipFileName || 'Bank_Transfer_Slip_Receipt.png'}</p>
                            <p className="text-[10px] text-emerald-700 font-bold mt-0.5 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ready to place order
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleSlipFileSelect(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                            errors.bankSlip
                              ? 'border-red-400 bg-red-50/70 hover:bg-red-50'
                              : 'border-neutral-300 bg-white hover:border-neutral-950 hover:bg-neutral-50'
                          }`}
                        >
                          {isUploadingSlip ? (
                            <div className="space-y-2 py-2">
                              <div className="flex items-center justify-center gap-2 text-neutral-900 font-bold text-xs">
                                <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
                                <span>Uploading bank transfer slip... ({slipUploadProgress}%)</span>
                              </div>
                              <div className="w-48 bg-neutral-200 h-1.5 rounded-full mx-auto overflow-hidden">
                                <div className="bg-neutral-950 h-full transition-all duration-300" style={{ width: `${slipUploadProgress}%` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <Upload className="w-6 h-6 mx-auto text-neutral-600" />
                              <p className="text-xs font-bold text-neutral-950">
                                Click to select transfer slip file or drag &amp; drop here
                              </p>
                              <p className="text-[10px] text-neutral-500 font-semibold">
                                Supports PNG, JPG, WEBP or PDF receipt (Max 10MB)
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-0.5">
                          <span className="text-neutral-400">Testing shortcut:</span>
                          <button
                            type="button"
                            onClick={handleUseSampleSlip}
                            className="text-[10px] font-bold text-neutral-900 hover:underline bg-neutral-200/80 hover:bg-neutral-200 px-2.5 py-1 rounded transition-colors"
                          >
                            ⚡ Attach Sample Transfer Slip (Quick Test)
                          </button>
                        </div>
                      </div>
                    )}

                    {errors.bankSlip && (
                      <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg border border-red-200 text-[11px] font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-red-650" />
                        <span>{errors.bankSlip}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-neutral-50 p-5 border border-neutral-150 text-xs text-neutral-600 font-sans font-light rounded-xl">
                  <p className="font-bold text-neutral-900 uppercase tracking-widest text-[9px]">Cash on Delivery Conditions:</p>
                  <p className="mt-1 leading-relaxed">
                    A delivery confirmation code will be messaged to your phone. Please hand over the exact cash payment to the dispatch courier team upon delivery to release your sealed garments.
                  </p>
                </div>
              )}
            </div>

            {/* Action CTA Button */}
            <div className="pt-6 border-t border-neutral-150 space-y-3">
              {formErrorSummary && (
                <div className="bg-red-50 border border-red-300 p-3.5 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2 shadow-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-650" />
                  <span>{formErrorSummary}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-[0.2em] py-4.5 flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-xl border border-neutral-950 shadow-xs"
              >
                <ShieldCheck className="w-5 h-5 text-neutral-100" />
                <span>Confirm order &amp; pay Rs. {grandTotal.toLocaleString()}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Order Review / Sizing summary (5 columns width) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Order Basket Summary */}
          <div className="bg-neutral-50 border border-neutral-150 p-6 space-y-5 rounded-2xl">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-200 pb-3.5 select-none">
              Garments Basket Review
            </h3>

            <div className="divide-y divide-neutral-200 max-h-80 overflow-y-auto pr-1 space-y-4">
              {cart.map((cartItem) => {
                const variant = variants.find(v => v.id === cartItem.variantId);
                const product = products.find(p => p.id === cartItem.productId);
                if (!variant || !product) return null;

                const color = COLORS.find(c => c.id === variant.colorId);
                const size = SIZES.find(s => s.id === variant.sizeId);

                return (
                  <div key={cartItem.id} className="flex gap-4 pt-4 first:pt-0">
                    <img src={product.images[0]} alt="" referrerPolicy="no-referrer" className="w-12 aspect-[3/4] object-cover object-center border border-neutral-200 rounded-lg grayscale-[5%]" />
                    <div className="flex-grow text-xs font-sans">
                      <h4 className="font-serif italic text-neutral-900 leading-tight">{product.name}</h4>
                      <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
                        {color?.name} / Size {size?.name}
                      </p>
                      <div className="flex justify-between items-center mt-2 font-bold text-neutral-800">
                        <span className="text-neutral-500 font-light">Quantity: {cartItem.quantity}</span>
                        <span>Rs. {(cartItem.price * cartItem.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Pricing Summary */}
            <div className="border-t border-neutral-200 pt-5 space-y-2 text-xs font-sans font-light">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal amount:</span>
                <span className="font-bold text-neutral-800">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-neutral-950 font-semibold">
                  <span>Applied Coupon Discount:</span>
                  <span className="font-bold">- Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-500">
                <span>Courier Dispatch:</span>
                <span className="font-bold text-neutral-800">
                  {shippingCharge === 0 ? 'Complimentary' : `Rs. ${shippingCharge}`}
                </span>
              </div>
              <div className="border-t border-neutral-200 pt-4 flex justify-between text-sm items-baseline">
                <span className="font-bold text-neutral-950 uppercase tracking-widest text-[11px]">Grand Total:</span>
                <span className="text-xl font-bold text-neutral-950">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Interactive Loyalty program preview */}
          <div className="bg-neutral-50 border border-neutral-150 p-6 space-y-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-neutral-900">
              <Gift className="w-4 h-4 text-neutral-950" />
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em]">Lounge Club Loyalty</h4>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed font-sans font-light">
              By confirming this order, you will immediately earn <strong className="text-neutral-900">{earnedLoyaltyPoints} Club Points</strong> in your Lounge Club profile. Redeem points on subsequent purchases to claim rewards.
            </p>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-neutral-200 font-bold text-neutral-900 font-sans">
              <span>Points Earned:</span>
              <span>+ {earnedLoyaltyPoints} pts</span>
            </div>
          </div>

          {/* Trusted Security guarantees */}
          <div className="p-4 border border-neutral-150 space-y-2 text-[10px] text-neutral-400 font-sans font-light leading-relaxed rounded-2xl select-none">
            <p className="font-bold text-neutral-800 uppercase tracking-widest flex items-center gap-1">
              🔐 Authentic Shopping Guarantee
            </p>
            <p>
              Your billing and payment information is tokenized and is never persisted on our local servers. For help or exchanges, contact assistance at care@apiandtextile.com.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
