import React, { useState, useMemo } from 'react';
import { Package, MapPin, Truck, RefreshCcw, Gift, Search, ArrowRight, UserCheck, ShieldAlert, CheckCircle, Clock, X, Heart, ShoppingBag, Eye } from 'lucide-react';
import { Order, OrderStatus, Product, ProductVariant } from '../types';

interface CustomerPortalProps {
  orders: Order[];
  currentCustomerEmail: string;
  setCurrentCustomerEmail: (email: string) => void;
  onTrackOrder: (orderId: string) => void;
  products: Product[];
  variants: ProductVariant[];
  watchedIds: string[];
  onToggleWatch: (productId: string) => void;
  onProductClick: (productId: string) => void;
  onAddToCart: (variantId: string, quantity: number) => void;
}

export default function CustomerPortal({
  orders,
  currentCustomerEmail,
  setCurrentCustomerEmail,
  onTrackOrder,
  products,
  variants,
  watchedIds,
  onToggleWatch,
  onProductClick,
  onAddToCart
}: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'loyalty' | 'favorites'>('overview');
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  // Derive favorite products matching watchedIds list
  const favoriteProducts = useMemo(() => {
    return products.filter(p => watchedIds.includes(p.id));
  }, [products, watchedIds]);

  // Filter orders matching current email
  const customerOrders = useMemo(() => {
    if (!currentCustomerEmail) return [];
    return orders.filter(o => o.email.toLowerCase().trim() === currentCustomerEmail.toLowerCase().trim());
  }, [orders, currentCustomerEmail]);

  // Handle searching a custom order number
  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNumber) return;
    
    const found = orders.find(
      o => o.orderNumber.toUpperCase().trim() === searchOrderNumber.toUpperCase().trim()
    );
    if (found) {
      setTrackedOrder(found);
    } else {
      alert('Order number not found. Make sure SKU/Order ID conforms to FAS-YYYYMMDD-XXXXXX.');
    }
  };

  // Compute total loyalty points
  const totalEarnedPoints = useMemo(() => {
    return customerOrders
      .filter(o => o.paymentStatus === 'PAID')
      .reduce((acc, order) => acc + Math.floor(order.grandTotal / 100), 0);
  }, [customerOrders]);

  // Order timeline statuses config
  const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'PENDING_PAYMENT', label: 'Order Registered', desc: 'Garments and stock successfully reserved.' },
    { status: 'PAID', label: 'Payment Confirmed', desc: 'Secure billing transaction completed.' },
    { status: 'CONFIRMED', label: 'Fulfillment Approved', desc: 'Order approved by dispatch control staff.' },
    { status: 'PICKING', label: 'Picking Stock', desc: 'Bespoke sizes retrieved from warehouse bins.' },
    { status: 'PACKED', label: 'Packed & Hems Checked', desc: 'Double-needle quality hems verified and packaged.' },
    { status: 'READY_TO_SHIP', label: 'Manifested', desc: 'Shipping label printed and courier assigned.' },
    { status: 'SHIPPED', label: 'In Transit', desc: 'Garments dispatched to courier hub.' },
    { status: 'DELIVERED', label: 'Successfully Delivered', desc: 'Handed over to consignee at destination.' }
  ];

  const getStepIndex = (status: OrderStatus) => {
    return TIMELINE_STEPS.findIndex(s => s.status === status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans text-neutral-900">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Links & Profile (3 columns width) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-neutral-150 p-5 space-y-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-neutral-950 text-white flex items-center justify-center font-bold rounded-xl select-none">
                {currentCustomerEmail ? currentCustomerEmail.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate select-none">
                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Client Profile</p>
                <p className="text-xs font-bold text-neutral-900 truncate">{currentCustomerEmail || 'Guest Account'}</p>
              </div>
            </div>

            {/* Email login simulation */}
            {!currentCustomerEmail ? (
              <div className="space-y-3 pt-4 border-t border-neutral-150">
                <p className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest">Connect Account</p>
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={searchOrderNumber}
                    onChange={(e) => setSearchOrderNumber(e.target.value)}
                    className="flex-1 bg-white border border-neutral-300 text-xs px-3 py-2 focus:outline-none focus:border-neutral-950 rounded-xl transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (searchOrderNumber.includes('@')) {
                        setCurrentCustomerEmail(searchOrderNumber);
                        setSearchOrderNumber('');
                      } else {
                        alert('Please enter a valid email.');
                      }
                    }}
                    className="bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    Load
                  </button>
                </div>
                <p className="text-[9px] text-neutral-400 font-light leading-relaxed">
                  Input the email used during checkout to automatically retrieve purchase history.
                </p>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentCustomerEmail('');
                  setTrackedOrder(null);
                }}
                className="w-full text-center border border-neutral-300 text-[10px] font-bold text-neutral-500 uppercase tracking-widest py-2 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-pointer rounded-xl"
              >
                Sign out of account
              </button>
            )}

            {/* Navigation Tabs */}
            <div className="flex flex-col gap-1 pt-4 border-t border-neutral-150 select-none">
              <button
                onClick={() => { setActiveTab('overview'); setTrackedOrder(null); }}
                className={`text-left text-[10px] font-bold py-2.5 px-3 uppercase tracking-widest rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'overview' && !trackedOrder ? 'bg-neutral-950 text-white' : 'hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Dashboard Overview
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setTrackedOrder(null); }}
                className={`text-left text-[10px] font-bold py-2.5 px-3 uppercase tracking-widest rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'orders' && !trackedOrder ? 'bg-neutral-950 text-white' : 'hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Purchase History ({customerOrders.length})
              </button>
              <button
                onClick={() => { setActiveTab('loyalty'); setTrackedOrder(null); }}
                className={`text-left text-[10px] font-bold py-2.5 px-3 uppercase tracking-widest rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'loyalty' && !trackedOrder ? 'bg-neutral-950 text-white' : 'hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                Lounge Loyalty Club
              </button>
              <button
                onClick={() => { setActiveTab('favorites'); setTrackedOrder(null); }}
                className={`text-left text-[10px] font-bold py-2.5 px-3 uppercase tracking-widest rounded-xl cursor-pointer transition-colors ${
                  activeTab === 'favorites' && !trackedOrder ? 'bg-neutral-950 text-white' : 'hover:bg-neutral-50 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                My Favorites ({watchedIds.length})
              </button>
            </div>
          </div>

          {/* Quick Track Search Widget */}
          <form onSubmit={handleSearchOrder} className="bg-white border border-neutral-150 p-5 space-y-3.5 rounded-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Track Order ID</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="FAS-20260914-XXXXX"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                className="w-full bg-white border border-neutral-300 text-xs py-2.5 pl-3.5 pr-9 focus:outline-none focus:border-neutral-950 font-bold uppercase tracking-widest rounded-xl transition-colors"
              />
              <button type="submit" className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-950 cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-neutral-400 font-light leading-relaxed">
              Directly look up single order delivery milestones by tracking ID.
            </p>
          </form>
        </div>

        {/* Right Side: Dynamic Content Panel (9 columns width) */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Active order tracker detail view overlay */}
          {trackedOrder ? (
            <div className="bg-white border border-neutral-150 p-6 md:p-8 space-y-8 rounded-2xl">
              
              {/* Tracker Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-150 pb-5 gap-3">
                <div>
                  <button 
                    onClick={() => setTrackedOrder(null)}
                    className="text-xs text-neutral-400 hover:text-neutral-950 font-semibold underline underline-offset-4 flex items-center gap-1 mb-2.5 cursor-pointer"
                  >
                    ← Back to Account
                  </button>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-neutral-950">
                    Order Status for #{trackedOrder.orderNumber}
                  </h2>
                </div>
                <div className="text-left sm:text-right">
                  <span className="bg-neutral-950 text-white text-[10px] font-bold uppercase tracking-[0.2em] py-1.5 px-3.5 rounded-xl">
                    {trackedOrder.status.replace('_', ' ')}
                  </span>
                  <p className="text-[11px] text-neutral-400 font-semibold mt-2">Confirmed: {new Date(trackedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Graphical Milestones Timeline */}
              <div className="space-y-6">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-450 select-none">Delivery Milestones</h3>
                
                <div className="relative pl-6 space-y-6 border-l border-neutral-200 ml-3 py-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const currentStepIdx = getStepIndex(trackedOrder.status);
                    const isCompleted = idx <= currentStepIdx;
                    const isActive = idx === currentStepIdx;
                    
                    // Look up timestamp in order status history if available
                    const historyRecord = trackedOrder.statusHistory.find(h => h.status === step.status);

                    return (
                      <div key={step.status} className="relative">
                        
                        {/* Bullet node */}
                        <div className={`absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                          isActive 
                            ? 'bg-neutral-950 border-neutral-950 scale-110' 
                            : isCompleted 
                            ? 'bg-neutral-950 border-neutral-950' 
                            : 'bg-white border-neutral-300'
                        }`}>
                          {isCompleted && !isActive && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                          {isActive && <Clock className="w-2.5 h-2.5 text-white" />}
                        </div>

                        {/* Text labels */}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${
                              isActive ? 'text-neutral-950' : isCompleted ? 'text-neutral-750' : 'text-neutral-400'
                            }`}>
                              {step.label}
                            </h4>
                            {historyRecord && (
                              <span className="text-[10px] text-neutral-400 font-medium">
                                ({new Date(historyRecord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 font-light mt-0.5 leading-relaxed">{step.desc}</p>
                          {historyRecord?.note && (
                            <p className="text-[11px] text-neutral-900 font-semibold mt-1 bg-neutral-50 py-1.5 px-3 border-l-2 border-neutral-950 w-fit font-sans rounded-r-lg">
                              Note: {historyRecord.note}
                            </p>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order address and detail copy review */}
              <div className="border-t border-neutral-150 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-1.5 font-sans font-light text-neutral-500">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9px] mb-2">Delivery Address</h4>
                  <p className="font-bold text-neutral-900">{trackedOrder.address.firstName} {trackedOrder.address.lastName}</p>
                  <p className="mt-1">{trackedOrder.address.addressLine1}</p>
                  <p>{trackedOrder.address.city}, {trackedOrder.address.province} {trackedOrder.address.postalCode}</p>
                  <p>{trackedOrder.address.country}</p>
                </div>
                <div className="space-y-1.5 font-sans font-light text-neutral-500">
                  <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9px] mb-2">Ledger Details</h4>
                  <p>Channel: <strong className="text-neutral-800 font-semibold">{trackedOrder.paymentMethod}</strong></p>
                  <p>Status: <strong className="text-neutral-800 font-semibold">{trackedOrder.paymentStatus}</strong></p>
                  <p className="pt-1 flex justify-between items-baseline">
                    <span>Grand Total:</span>
                    <strong className="text-base font-bold text-neutral-950">Rs. {trackedOrder.grandTotal.toLocaleString()}</strong>
                  </p>

                  {trackedOrder.bankSlipUrl && (
                    <div className="pt-2 border-t border-neutral-200/80 mt-2">
                      <p className="text-[9px] font-bold text-neutral-900 uppercase tracking-wider mb-1">Attached Bank Transfer Slip:</p>
                      <a href={trackedOrder.bankSlipUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-lg border border-neutral-200 transition-colors">
                        <img src={trackedOrder.bankSlipUrl} alt="Deposit Slip" className="w-8 h-8 object-cover rounded border border-neutral-300 shrink-0" />
                        <span className="text-[10px] font-bold text-neutral-900 underline">View Receipt</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <>
              {/* Tab 1: Account Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* Loyalty stats board */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-neutral-150 p-6 flex flex-col justify-between rounded-2xl">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Active Loyalty Tier</p>
                      <div className="mt-3.5 flex items-baseline gap-1.5">
                        <span className="text-xl font-bold text-neutral-950 tracking-tight font-serif italic">
                          {totalEarnedPoints > 300 ? 'Gold Status' : totalEarnedPoints > 100 ? 'Silver Status' : 'Bronze Member'}
                        </span>
                      </div>
                      <p className="text-[9px] text-neutral-450 font-light mt-2.5 leading-relaxed">
                        {totalEarnedPoints > 300 ? 'Premium priority early sale access active.' : 'Earn more points to unlock Gold discounts.'}
                      </p>
                    </div>

                    <div className="bg-white border border-neutral-150 p-6 flex flex-col justify-between rounded-2xl">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Club Points</p>
                      <div className="mt-3.5 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-neutral-950 font-sans">{totalEarnedPoints}</span>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-1">Points</span>
                      </div>
                      <p className="text-[9px] text-neutral-450 font-light mt-2.5 leading-relaxed">
                        Equivalent to Rs. {Math.round(totalEarnedPoints * 5).toLocaleString()} in claimable credits.
                      </p>
                    </div>

                    <div className="bg-white border border-neutral-150 p-6 flex flex-col justify-between rounded-2xl">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Purchases Logged</p>
                      <div className="mt-3.5 flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-neutral-950 font-sans">{customerOrders.length}</span>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-1">Orders</span>
                      </div>
                      <p className="text-[9px] text-neutral-450 font-light mt-2.5 leading-relaxed">
                        Active courier tracking active across all lines.
                      </p>
                    </div>
                  </div>

                  {/* Active Shipments Panel */}
                  <div className="bg-white border border-neutral-150 p-6 space-y-4 rounded-2xl">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 border-b border-neutral-200 pb-3.5 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-900" /> Active Garment Deliveries
                    </h3>

                    {customerOrders.length === 0 ? (
                      <div className="text-center py-10 text-xs text-neutral-400 font-light">
                        No active purchase orders registered under {currentCustomerEmail || 'this guest session'}.
                      </div>
                    ) : (
                      <div className="divide-y divide-neutral-150 space-y-3">
                        {customerOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').map((order) => (
                          <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 first:pt-0 gap-3 text-xs">
                            <div>
                              <p className="font-bold text-neutral-900 uppercase tracking-widest">Order #{order.orderNumber}</p>
                              <p className="text-neutral-400 font-semibold mt-1">Status: <strong className="text-neutral-800 font-bold">{order.status.replace('_', ' ')}</strong></p>
                            </div>
                            <button
                              onClick={() => setTrackedOrder(order)}
                              className="self-start sm:self-center bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 px-5 transition-colors cursor-pointer rounded-xl border border-neutral-950"
                            >
                              Track Live milestones
                            </button>
                          </div>
                        ))}
                        {customerOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length === 0 && (
                          <div className="text-center py-4 text-xs text-neutral-400 font-light">
                            All your past garments have been successfully delivered.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Tab 2: Purchase History */}
              {activeTab === 'orders' && (
                <div className="bg-white border border-neutral-150 p-6 space-y-4 rounded-2xl">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 border-b border-neutral-200 pb-3.5">
                    Bespoke Order History Log
                  </h3>

                  {customerOrders.length === 0 ? (
                    <div className="text-center py-16 text-xs text-neutral-400 font-light">
                      No purchase records found. Place an order to track delivery.
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-200">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="py-4 first:pt-0 last:pb-0 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans font-light">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-neutral-950 uppercase tracking-wider">Order #{order.orderNumber}</span>
                              <span className="text-[9px] font-bold border border-neutral-900 px-2 py-0.5 uppercase tracking-wider text-neutral-900 rounded-xl">
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-neutral-400 font-semibold">Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                            <p className="text-neutral-500 font-light line-clamp-1">{order.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}</p>
                          </div>

                          <div className="flex items-center gap-4 justify-between sm:justify-end">
                            <span className="font-bold text-neutral-950 text-sm">Rs. {order.grandTotal.toLocaleString()}</span>
                            <button
                              onClick={() => setTrackedOrder(order)}
                              className="border border-neutral-900 hover:bg-neutral-950 hover:text-white font-bold text-[9px] uppercase tracking-widest py-2.5 px-4 bg-white text-neutral-950 rounded-xl cursor-pointer transition-colors"
                            >
                              Track Order
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Loyalty & Club Benefits */}
              {activeTab === 'loyalty' && (
                <div className="space-y-6">
                  
                  {/* Loyalty details */}
                  <div className="bg-white border border-neutral-150 p-6 space-y-4 rounded-2xl">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 border-b border-neutral-200 pb-3.5 flex items-center gap-2">
                      <Gift className="w-4 h-4 text-neutral-950" /> Lounge Loyalty Club
                    </h3>
                    
                    <p className="text-xs text-neutral-500 leading-relaxed font-sans font-light">
                      Welcome to the **API &amp; Textile Lounge**. Points are automatically calculated following verified ledger payment confirmation.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                      <div className="p-5 border border-neutral-150 bg-white rounded-xl">
                        <span className="text-xl font-bold text-neutral-950">{totalEarnedPoints} Points</span>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">Available Point Balance</p>
                      </div>
                      <div className="p-5 border border-neutral-150 bg-white rounded-xl">
                        <span className="text-xl font-bold text-neutral-950">Rs. {Math.round(totalEarnedPoints * 5).toLocaleString()}</span>
                        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">Claimable Cash Value</p>
                      </div>
                    </div>
                  </div>

                  {/* Loyalty Tiers summary */}
                  <div className="bg-white border border-neutral-150 p-6 space-y-4 rounded-2xl">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-900">Tier Levels &amp; Milestones</h4>
                    
                    <div className="space-y-4 text-xs font-sans font-light leading-relaxed">
                      <div className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="w-8 h-8 bg-neutral-950 text-white font-bold flex items-center justify-center text-[10px] rounded-xl">B</div>
                        <div>
                          <h5 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Bronze Tier (0 - 100 Points)</h5>
                          <p className="text-[11px] text-neutral-400 font-light mt-0.5">Automatic registration. Standard customer courier shipping tracking and 14-day local store size exchange access.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="w-8 h-8 bg-neutral-950 text-white font-bold flex items-center justify-center text-[10px] rounded-xl">S</div>
                        <div>
                          <h5 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Silver Tier (101 - 300 Points)</h5>
                          <p className="text-[11px] text-neutral-400 font-light mt-0.5">Complimentary courier shipping on all orders without threshold limits. Personalized exclusive size guides tailored to custom model measurements.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                        <div className="w-8 h-8 bg-neutral-950 text-white font-bold flex items-center justify-center text-[10px] rounded-xl">G</div>
                        <div>
                          <h5 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Gold VIP Tier (301+ Points)</h5>
                          <p className="text-[11px] text-neutral-400 font-light mt-0.5">All silver benefits plus customized 1-on-1 fashion tailoring consultation, early access to limited edition autumn-winter drops, and automatic 5% additional discounts.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 4: Saved Favorites / Wishlist */}
              {activeTab === 'favorites' && (
                <div className="bg-white border border-neutral-150 p-6 space-y-6 rounded-2xl">
                  <div className="border-b border-neutral-150 pb-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-950 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-neutral-950 fill-neutral-950" /> My Saved Favorites
                    </h3>
                    <p className="text-xs text-neutral-450 font-light mt-1">Your personal collection of premium handcrafted Sri Lankan couture.</p>
                  </div>

                  {favoriteProducts.length === 0 ? (
                    <div className="text-center py-16 space-y-4">
                      <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-400 border border-neutral-150">
                        <Heart className="w-5 h-5 font-light" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-neutral-950 uppercase tracking-widest">No saved couture pieces</p>
                        <p className="text-[11px] text-neutral-400 font-light max-w-sm mx-auto">Explore our Sigiriya drapes, handlooms, and resort wear to curate your unique style signature.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {favoriteProducts.map((p) => {
                        // Find first size variant in stock
                        const pVariants = variants.filter(v => v.productId === p.id);
                        const firstVarId = pVariants[0]?.id;

                        return (
                          <div key={p.id} className="group relative border border-neutral-150 rounded-2xl overflow-hidden flex flex-col justify-between bg-white hover:shadow-md transition-all duration-300">
                            {/* Product Image */}
                            <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden rounded-t-2xl">
                              <img 
                                src={p.images[0]} 
                                alt={p.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                              />
                              <button
                                onClick={() => onToggleWatch(p.id)}
                                className="absolute top-2 right-2 p-1.5 bg-white/95 border border-neutral-150 text-neutral-900 hover:text-red-600 rounded-full cursor-pointer transition-colors shadow-2xs"
                                title="Remove from Favorites"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Details */}
                            <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase font-bold text-neutral-400 tracking-[0.15em]">{p.brand}</span>
                                <h4 className="text-xs sm:text-sm font-serif font-light text-neutral-950 italic line-clamp-1">{p.name}</h4>
                                <p className="text-xs font-bold text-neutral-950">Rs. {p.basePrice.toLocaleString()}</p>
                              </div>

                              <div className="flex gap-1.5 mt-4">
                                <button
                                  onClick={() => onProductClick(p.id)}
                                  className="flex-1 bg-white hover:bg-neutral-950 text-neutral-950 hover:text-white border border-neutral-950 text-[9px] font-bold uppercase tracking-widest py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>View Style</span>
                                </button>
                                {firstVarId && (
                                  <button
                                    onClick={() => onAddToCart(firstVarId, 1)}
                                    className="bg-neutral-950 hover:bg-neutral-850 text-white p-2 sm:p-2.5 rounded-xl cursor-pointer transition-colors"
                                    title="Add to Bag"
                                  >
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}
