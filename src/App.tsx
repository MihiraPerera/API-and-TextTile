import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Heart, Sparkles, CheckCircle, MapPin, X, Scale, ShieldCheck, Instagram, Facebook } from 'lucide-react';
import { Product, Category, ProductVariant, InventoryItem, CartItem, Order, Coupon, StockMovement, OrderAddress, OrderStatus, SizeMeasurementRule } from './types';
import { PRODUCTS, INITIAL_CATEGORIES, INITIAL_VARIANTS, INITIAL_INVENTORY, INITIAL_COUPONS, INITIAL_SIZE_RULES, COLORS, SIZES, WAREHOUSES } from './data';
import CustomerHeader from './components/CustomerHeader';
import CustomerHero from './components/CustomerHero';
import CustomerProductGrid from './components/CustomerProductGrid';
import CustomerProductDetail from './components/CustomerProductDetail';
import CustomerCart from './components/CustomerCart';
import CustomerCheckout from './components/CustomerCheckout';
import CustomerPortal from './components/CustomerPortal';
import AdminPanel from './components/AdminPanel';
import { Logo } from './components/Logo';
import { NewsletterForm } from './components/NewsletterForm';
import BackToTop from './components/BackToTop';
import { PromoPopupBanner } from './components/PromoPopupBanner';

export default function App() {
  // Brand Preloader Sequence States
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Synchronized Domain States (Persisted via Browser Storage)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_categories');
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_products');
      return saved ? JSON.parse(saved) : PRODUCTS;
    } catch {
      return PRODUCTS;
    }
  });

  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_variants');
      return saved ? JSON.parse(saved) : INITIAL_VARIANTS;
    } catch {
      return INITIAL_VARIANTS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_coupons');
      return saved ? JSON.parse(saved) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_stock_movements');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync state changes to browser storage
  useEffect(() => {
    try { localStorage.setItem('wearora_categories', JSON.stringify(categories)); } catch (err) {}
  }, [categories]);

  useEffect(() => {
    try { localStorage.setItem('wearora_products', JSON.stringify(products)); } catch (err) {}
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem('wearora_variants', JSON.stringify(variants)); } catch (err) {}
  }, [variants]);

  useEffect(() => {
    try { localStorage.setItem('wearora_inventory', JSON.stringify(inventory)); } catch (err) {}
  }, [inventory]);

  useEffect(() => {
    try { localStorage.setItem('wearora_coupons', JSON.stringify(coupons)); } catch (err) {}
  }, [coupons]);

  useEffect(() => {
    try { localStorage.setItem('wearora_orders', JSON.stringify(orders)); } catch (err) {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem('wearora_stock_movements', JSON.stringify(stockMovements)); } catch (err) {}
  }, [stockMovements]);

  useEffect(() => {
    try { localStorage.setItem('wearora_cart', JSON.stringify(cart)); } catch (err) {}
  }, [cart]);

  // Body Measurement Size Rules State (synchronized via localStorage)
  const [sizeRules, setSizeRules] = useState<SizeMeasurementRule[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_size_rules');
      return saved ? JSON.parse(saved) : INITIAL_SIZE_RULES;
    } catch {
      return INITIAL_SIZE_RULES;
    }
  });

  const handleUpdateSizeRule = (updatedRule: SizeMeasurementRule) => {
    const updated = sizeRules.map(r => r.id === updatedRule.id ? updatedRule : r);
    setSizeRules(updated);
    try {
      localStorage.setItem('wearora_size_rules', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSizeRule = (newRule: SizeMeasurementRule) => {
    const updated = [...sizeRules, newRule];
    setSizeRules(updated);
    try {
      localStorage.setItem('wearora_size_rules', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSizeRule = (ruleId: string) => {
    const updated = sizeRules.filter(r => r.id !== ruleId);
    setSizeRules(updated);
    try {
      localStorage.setItem('wearora_size_rules', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };


  // UX Navigation States
  const [currentView, setView] = useState<'store' | 'portal' | 'admin' | 'checkout'>('store');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGenderFilter, setActiveGenderFilter] = useState<string>('All');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [currentCustomerEmail, setCurrentCustomerEmail] = useState<string>('');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Global Wishlist/Favorites State (synchronized via localStorage)
  const [watchedIds, setWatchedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('wearora_watched');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Brand Logo State (synchronized via localStorage)
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('wearora_logo_url') || '';
    } catch {
      return '';
    }
  });

  const handleUpdateLogo = (newUrl: string) => {
    setLogoUrl(newUrl);
    try {
      localStorage.setItem('wearora_logo_url', newUrl);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetLogo = () => {
    setLogoUrl('');
    try {
      localStorage.removeItem('wearora_logo_url');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleWatch = (productId: string) => {
    const updated = watchedIds.includes(productId)
      ? watchedIds.filter(id => id !== productId)
      : [...watchedIds, productId];
    setWatchedIds(updated);
    try {
      localStorage.setItem('wearora_watched', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Brand Preloader simulation effect
  useEffect(() => {
    const start = Date.now();
    const duration = 1200; // Fast and ultra-smooth brand loading
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setLoadingProgress(progress);
      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => setIsAppLoading(false), 150);
      }
    }, 20);
    return () => clearInterval(interval);
  }, []);

  // Force scroll window to top whenever active view or selected product details page shifts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentView, selectedProductId]);

  // Listen for /admin, ?admin=true, ?view=admin, or #admin URL parameters to switch to Admin Portal
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path.includes('/admin') || search.includes('admin=true') || search.includes('view=admin') || hash.includes('admin')) {
        setView('admin');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Setup some past dummy completed orders to populate the portal initially
  useEffect(() => {
    // Generate initial dummy order to make dashboard/portal look professional immediately
    const pastAddress: OrderAddress = {
      firstName: 'Mihiraj',
      lastName: 'Prasad',
      email: 'mihiraj@chinesedragoncafe.com',
      phone: '+94 77 123 4567',
      addressLine1: '45 Galle Road',
      city: 'Colombo',
      province: 'Western',
      postalCode: '00300',
      country: 'Sri Lanka'
    };

    const dummyItem1 = {
      id: 'itm-dummy-1',
      productId: 'prod-satin-dress',
      variantId: 'var-1',
      sku: 'API-DR-BL-S',
      productName: 'Sigiriya Silk Sari-Inspired Drape Dress',
      variantName: 'Charcoal Black / S',
      quantity: 1,
      unitPrice: 12500,
      discount: 0,
      lineTotal: 12500
    };

    const dummyOrder: Order = {
      id: 'ord-dummy-past',
      orderNumber: 'API-20260914-000104',
      email: 'mihiraj@chinesedragoncafe.com',
      phone: '+94 77 123 4567',
      status: 'DELIVERED',
      subtotal: 12500,
      discountTotal: 0,
      shippingTotal: 0,
      grandTotal: 12500,
      paymentMethod: 'Visa / Mastercard Secure Gateway',
      paymentStatus: 'PAID',
      address: pastAddress,
      items: [dummyItem1],
      statusHistory: [
        { status: 'PENDING_PAYMENT', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Couture garment stock registered successfully' },
        { status: 'PAID', timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), note: 'Visa payment verified securely' },
        { status: 'CONFIRMED', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), note: 'Order approved by dispatch' },
        { status: 'PICKING', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), note: 'Garment retrieved from central showroom' },
        { status: 'PACKED', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Double-needle couture hems verified' },
        { status: 'READY_TO_SHIP', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Courier label printed' },
        { status: 'SHIPPED', timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), note: 'Dispatched via premium courier fleet' },
        { status: 'DELIVERED', timestamp: new Date(Date.now() - 0.5 * 86400000).toISOString(), note: 'Handed over securely to consignee' }
      ],
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    };

    setOrders([dummyOrder]);
    setCurrentCustomerEmail('mihiraj@chinesedragoncafe.com');
  }, []);

  // Operational Handler: Add item to shopping bag
  const handleAddToCart = (variantId: string, quantity: number) => {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return;

    setCart(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
        return prev.map(item =>
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          productId: variant.productId,
          variantId,
          quantity,
          price: variant.sellingPrice
        }
      ];
    });

    setIsCartOpen(true);
  };

  // Express direct buy handler
  const handleBuyNow = (variantId: string, quantity: number) => {
    handleAddToCart(variantId, quantity);
    setView('checkout');
    setIsCartOpen(false);
  };

  // Update item quantity inside bag
  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    setCart(prev => prev.map(item =>
      item.id === cartItemId ? { ...item, quantity: newQty } : item
    ));
  };

  // Remove item from bag
  const handleRemoveCartItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  // Place Trial order - inventory reductions, ledger registration, timeline generation
  const handlePlaceOrder = (address: OrderAddress, paymentMethod: string, bankSlipUrl?: string) => {
    // 1. Double check available warehouse stock and deduct from Central Warehouse ('wh-main') first
    const updatedInventory = [...inventory];
    const newMovements: StockMovement[] = [];

    // Form items breakdown
    const orderItems = cart.map((cartItem, idx) => {
      const variant = variants.find(v => v.id === cartItem.variantId)!;
      const product = products.find(p => p.id === cartItem.productId)!;
      
      const col = COLORS.find(c => c.id === variant.colorId);
      const sz = SIZES.find(s => s.id === variant.sizeId);

      // Decrement central warehouse stock (or fallback to store locations)
      let targetWhId = 'wh-main';
      let invRecord = updatedInventory.find(i => i.variantId === cartItem.variantId && i.warehouseId === targetWhId);
      
      if (!invRecord || invRecord.onHand < cartItem.quantity) {
        // Fallback to Colombo Flagship store if Central is out of stock
        targetWhId = 'wh-store-colombo';
        invRecord = updatedInventory.find(i => i.variantId === cartItem.variantId && i.warehouseId === targetWhId);
      }

      if (invRecord) {
        invRecord.onHand = Math.max(0, invRecord.onHand - cartItem.quantity);
      }

      // Record stock ledger adjustment movement trace
      newMovements.push({
        id: `move-${Date.now()}-${idx}`,
        variantId: cartItem.variantId,
        warehouseId: targetWhId,
        type: 'SALE',
        quantityChange: -cartItem.quantity,
        note: `Customer checkout purchase order FAS-${idx}`,
        timestamp: new Date().toISOString()
      });

      return {
        id: `orditm-${Date.now()}-${idx}`,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        sku: variant.sku,
        productName: product.name,
        variantName: `${col?.name} / ${sizeName(variant.sizeId)}`,
        quantity: cartItem.quantity,
        unitPrice: cartItem.price,
        discount: 0,
        lineTotal: cartItem.price * cartItem.quantity
      };
    });

    const cartSubtotal = cart.reduce((acc, cItem) => acc + cItem.price * cItem.quantity, 0);
    const isFree = cartSubtotal >= 5000;
    const shipping = cartSubtotal > 0 && !isFree ? 350 : 0;
    
    let discount = 0;
    if (appliedCoupon && cartSubtotal >= appliedCoupon.minSpend) {
      discount = appliedCoupon.type === 'PERCENTAGE' 
        ? Math.round(cartSubtotal * (appliedCoupon.value / 100)) 
        : appliedCoupon.value;
    }

    const total = Math.max(0, cartSubtotal - discount + shipping);

    // Build unique Order ID sequence
    const randomSeq = Math.floor(Math.random() * 90000) + 10000;
    const orderNum = `FAS-20260914-${randomSeq}`;

    const isBankOrCod = paymentMethod.toLowerCase().includes('cash') || paymentMethod.toLowerCase().includes('bank');

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      email: address.email,
      phone: address.phone,
      status: isBankOrCod ? 'PENDING_PAYMENT' : 'PAID',
      subtotal: cartSubtotal,
      discountTotal: discount,
      shippingTotal: shipping,
      grandTotal: total,
      paymentMethod,
      paymentStatus: isBankOrCod ? 'UNPAID' : 'PAID',
      bankSlipUrl,
      address,
      items: orderItems,
      statusHistory: [
        { 
          status: 'PENDING_PAYMENT' as OrderStatus, 
          timestamp: new Date().toISOString(), 
          note: bankSlipUrl 
            ? 'Order registered with compulsory Bank Transfer Slip attached. Pending admin verification.' 
            : 'Order registered and stock reserved in warehouse.' 
        },
        ...(!isBankOrCod ? [{ status: 'PAID' as OrderStatus, timestamp: new Date().toISOString(), note: 'Online secure checkout payment approved.' }] : [])
      ],
      createdAt: new Date().toISOString()
    };

    // Apply updates to global state engines
    setInventory(updatedInventory);
    setStockMovements(prev => [...newMovements, ...prev]);
    setOrders(prev => [newOrder, ...prev]);
    setCurrentCustomerEmail(address.email);
    setCart([]); // Clear cart
    setAppliedCoupon(null); // Clear coupons
    setConfirmedOrder(newOrder); // Open Order Confirmation Modal
    setView('portal'); // Take customer directly to their purchase portal
  };

  // Helper size resolver
  const sizeName = (sizeId: string) => {
    return SIZES.find(s => s.id === sizeId)?.name || 'M';
  };

  // Admin Operational Handlers
  const handleUpdateInventory = (variantId: string, warehouseId: string, change: number, note: string) => {
    setInventory(prev => prev.map(item => {
      if (item.variantId === variantId && item.warehouseId === warehouseId) {
        return { ...item, onHand: Math.max(0, item.onHand + change) };
      }
      return item;
    }));

    setStockMovements(prev => [
      {
        id: `move-${Date.now()}`,
        variantId,
        warehouseId,
        type: change > 0 ? 'TRANSFER_IN' : 'ADJUSTMENT',
        quantityChange: change,
        note,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, note: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const payStat = newStatus === 'PAID' || order.paymentStatus === 'PAID' ? 'PAID' as const : 'UNPAID' as const;
        return {
          ...order,
          status: newStatus,
          paymentStatus: payStat,
          statusHistory: [
            ...order.statusHistory,
            { status: newStatus, timestamp: new Date().toISOString(), note }
          ]
        };
      }
      return order;
    }));
  };

  const handleAddCoupon = (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const handleTransferStock = (variantId: string, fromWh: string, toWh: string, qty: number) => {
    // Deduct source
    setInventory(prev => prev.map(item => {
      if (item.variantId === variantId && item.warehouseId === fromWh) {
        return { ...item, onHand: Math.max(0, item.onHand - qty) };
      }
      if (item.variantId === variantId && item.warehouseId === toWh) {
        return { ...item, onHand: item.onHand + qty };
      }
      return item;
    }));

    setStockMovements(prev => [
      {
        id: `move-${Date.now()}-out`,
        variantId,
        warehouseId: fromWh,
        type: 'TRANSFER_OUT',
        quantityChange: -qty,
        note: `Inter-warehouse transfer outbound to ${toWh}`,
        timestamp: new Date().toISOString()
      },
      {
        id: `move-${Date.now()}-in`,
        variantId,
        warehouseId: toWh,
        type: 'TRANSFER_IN',
        quantityChange: qty,
        note: `Inter-warehouse transfer inbound from ${fromWh}`,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, basePrice: newPrice } : p
    ));
    setVariants(prev => prev.map(v =>
      v.productId === productId ? { ...v, sellingPrice: newPrice } : v
    ));
  };

  const handleUpdateVariantPrice = (variantId: string, newPrice: number) => {
    setVariants(prev => prev.map(v =>
      v.id === variantId ? { ...v, sellingPrice: newPrice } : v
    ));
  };

  // Category Management Handlers
  const handleAddCategory = (newCat: Category) => {
    setCategories(prev => [...prev, newCat]);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Product Management Handlers
  const handleAddProduct = (newProduct: Product, newVariants: ProductVariant[], initialStockQty: number) => {
    setProducts(prev => [newProduct, ...prev]);
    setVariants(prev => [...prev, ...newVariants]);
    
    // Allocate initial inventory across warehouses for each variant
    const newInventoryItems: InventoryItem[] = [];
    const newMovements: StockMovement[] = [];
    let invCount = Date.now();

    newVariants.forEach(v => {
      WAREHOUSES.forEach(wh => {
        const qty = wh.id === 'wh-main' ? initialStockQty : Math.floor(initialStockQty / 3);
        const invId = `inv-${invCount++}`;
        newInventoryItems.push({
          id: invId,
          variantId: v.id,
          warehouseId: wh.id,
          onHand: qty,
          reserved: 0,
          damaged: 0,
          reorderLevel: wh.id === 'wh-main' ? 10 : 2
        });

        if (qty > 0) {
          newMovements.push({
            id: `move-${invCount++}`,
            variantId: v.id,
            warehouseId: wh.id,
            type: 'OPENING',
            quantityChange: qty,
            note: `Initial catalog intake for ${newProduct.name}`,
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    setInventory(prev => [...prev, ...newInventoryItems]);
    setStockMovements(prev => [...newMovements, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    const varIds = variants.filter(v => v.productId === productId).map(v => v.id);
    setVariants(prev => prev.filter(v => v.productId !== productId));
    setInventory(prev => prev.filter(i => !varIds.includes(i.variantId)));
  };

  const handleAddVariant = (productId: string, newVariant: ProductVariant, initialStockQty: number) => {
    setVariants(prev => [...prev, newVariant]);
    
    const newInv: InventoryItem[] = [];
    let invCount = Date.now();
    WAREHOUSES.forEach(wh => {
      const qty = wh.id === 'wh-main' ? initialStockQty : Math.floor(initialStockQty / 3);
      newInv.push({
        id: `inv-${invCount++}`,
        variantId: newVariant.id,
        warehouseId: wh.id,
        onHand: qty,
        reserved: 0,
        damaged: 0,
        reorderLevel: wh.id === 'wh-main' ? 10 : 2
      });
    });

    setInventory(prev => [...prev, ...newInv]);
  };

  const handleDeleteVariant = (variantId: string) => {
    setVariants(prev => prev.filter(v => v.id !== variantId));
    setInventory(prev => prev.filter(i => i.variantId !== variantId));
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  if (isAppLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 select-none font-sans transition-opacity duration-500 ease-in-out">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          {/* Elegant Display Mark */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-light font-serif tracking-[0.25em] text-neutral-900 italic">
              API &amp; TEXTILE
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-400">
              Sartorial Couture &amp; Showrooms
            </p>
          </div>

          {/* Minimalist Linear Progress Bar */}
          <div className="space-y-2.5">
            <div className="w-48 h-[2px] bg-neutral-200 mx-auto rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-neutral-950 transition-all duration-150 ease-out rounded-full"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.2em] font-sans">
              Establishing Luxury Line... <span className="font-serif italic font-light text-neutral-950 text-xs">{loadingProgress}%</span>
            </p>
          </div>

          {/* Elegant Footer Details */}
          <div className="pt-10 border-t border-neutral-200/60 max-w-[200px] mx-auto">
            <p className="text-[8px] text-neutral-400 uppercase tracking-widest font-light">
              Colombo • Kandy • Welisara
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#111111] font-sans flex flex-col justify-between">
      
      {/* Frontstore Shared Header Nav */}
      <CustomerHeader
        cart={cart}
        categories={categories}
        currentView={currentView}
        setView={(v) => { setView(v); setSelectedProductId(null); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCartClick={() => setIsCartOpen(true)}
        activeGenderFilter={activeGenderFilter}
        setActiveGenderFilter={setActiveGenderFilter}
        logoUrl={logoUrl}
      />

      {/* Primary Dynamic Main Body View Transitions */}
      <main className="flex-grow">
        {currentView === 'store' && (
          <div key={selectedProductId ? `store-detail-${selectedProductId}` : 'store-catalog'} className="animate-fade-in">
            {!selectedProductId && (
              <CustomerHero
                onShopNow={() => {
                  const element = document.getElementById('shop-catalog');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                activeGenderFilter={activeGenderFilter}
                setActiveGenderFilter={setActiveGenderFilter}
              />
            )}

            {selectedProductId && selectedProduct ? (
              <CustomerProductDetail
                product={selectedProduct}
                variants={variants}
                inventory={inventory}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onBackToCatalog={() => setSelectedProductId(null)}
              />
            ) : (
              <CustomerProductGrid
                products={products}
                categories={categories}
                variants={variants}
                inventory={inventory}
                searchQuery={searchQuery}
                activeGenderFilter={activeGenderFilter}
                setActiveGenderFilter={setActiveGenderFilter}
                onProductClick={(pId) => setSelectedProductId(pId)}
                onQuickAdd={(pId) => {
                  // Find first size variant of this product in stock
                  const firstVar = variants.find(v => v.productId === pId);
                  if (firstVar) {
                    handleAddToCart(firstVar.id, 1);
                    alert('Garment added to Shopping Bag.');
                  }
                }}
                watchedIds={watchedIds}
                onToggleWatch={toggleWatch}
              />
            )}
          </div>
        )}

        {currentView === 'checkout' && (
          <div key="checkout" className="animate-fade-in">
            <CustomerCheckout
              cart={cart}
              products={products}
              variants={variants}
              appliedCoupon={appliedCoupon}
              onPlaceOrder={handlePlaceOrder}
              onCancelCheckout={() => setView('store')}
            />
          </div>
        )}

        {currentView === 'portal' && (
          <div key="portal" className="animate-fade-in">
            <CustomerPortal
              orders={orders}
              currentCustomerEmail={currentCustomerEmail}
              setCurrentCustomerEmail={setCurrentCustomerEmail}
              onTrackOrder={(oId) => {
                const o = orders.find(ord => ord.id === oId);
                if (o) setView('portal');
              }}
              products={products}
              variants={variants}
              watchedIds={watchedIds}
              onToggleWatch={toggleWatch}
              onProductClick={(pId) => {
                setSelectedProductId(pId);
                setView('store');
              }}
              onAddToCart={(vId, qty) => {
                handleAddToCart(vId, qty);
                alert('Garment added to Shopping Bag.');
              }}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <div key="admin" className="animate-fade-in">
            <AdminPanel
              products={products}
              categories={categories}
              variants={variants}
              inventory={inventory}
              orders={orders}
              coupons={coupons}
              stockMovements={stockMovements}
              logoUrl={logoUrl}
              onNavigateStorefront={() => setView('store')}
              onUpdateLogo={handleUpdateLogo}
              onResetLogo={handleResetLogo}
              onUpdateInventory={handleUpdateInventory}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAddCoupon={handleAddCoupon}
              onTransferStock={handleTransferStock}
              onUpdateProductPrice={handleUpdateProductPrice}
              onUpdateVariantPrice={handleUpdateVariantPrice}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddVariant={handleAddVariant}
              onDeleteVariant={handleDeleteVariant}
            />
          </div>
        )}
      </main>

      {/* Shopping Bag slide over drawer */}
      <CustomerCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        products={products}
        variants={variants}
        coupons={coupons}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
        onCheckout={() => {
          setIsCartOpen(false);
          setView('checkout');
        }}
      />

      {/* Website Promotional Flash Offer Popup Banner */}
      <PromoPopupBanner
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={setAppliedCoupon}
      />

      {/* Premium Minimalistic Footer */}
      <footer className="bg-black border-t border-neutral-900 py-12 text-xs text-neutral-400 font-light select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="mb-2 -ml-3">
              <Logo variant="light" height={60} logoUrl={logoUrl} />
            </div>
            <p className="leading-relaxed text-neutral-400">
              We design and craft premium couture girls' apparel and garments. Available island-wide through secure premium couriers and central showroom boutiques.
            </p>
            <div className="flex gap-3 pt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-white hover:bg-neutral-900 transition-all cursor-pointer flex items-center justify-center" 
                title="Follow us on Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-white hover:bg-neutral-900 transition-all cursor-pointer flex items-center justify-center" 
                title="Follow us on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://tiktok.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-full border border-neutral-800 text-neutral-400 hover:text-white hover:border-white hover:bg-neutral-900 transition-all cursor-pointer flex items-center justify-center" 
                title="Follow us on TikTok"
              >
                <svg 
                  className="w-3.5 h-3.5 fill-none stroke-current" 
                  viewBox="0 0 24 24" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">Client Care</h5>
            <ul className="space-y-2">
              <li className="hover:text-white transition-colors"><a href="#shop-catalog" onClick={() => setView('store')}>Shop Girls' Collections</a></li>
              <li className="hover:text-white transition-colors"><a href="#shop-catalog" onClick={() => setView('portal')}>Track Delivery Milestones</a></li>
              <li className="hover:text-white transition-colors">Bespoke Size Exchanges</li>
              <li className="hover:text-white transition-colors">Returns &amp; Refunds Policy</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-wider text-[10px]">API &amp; Textile Showrooms</h5>
            <ul className="space-y-2 text-neutral-400">
              <li>Colombo central flag: 245 Galle Road, Colombo 3</li>
              <li>Kandy premium center: Kandy City Center, Floor 2</li>
              <li>Central Distribution: 40 Welisara Logistics hub</li>
            </ul>
          </div>
          <div>
            <NewsletterForm />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-900 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 API &amp; Textile Private Limited. All Rights Reserved. Crafted for premium retail excellence.</p>
          <div className="flex gap-4 items-center">
            <button onClick={() => setShowTermsModal(true)} className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-light text-neutral-400">Terms &amp; Conditions</button>
            <span>•</span>
            <span className="hover:text-white transition-colors">Privacy Charter</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Sartorial Guidelines</span>
            <span>•</span>
            <button 
              onClick={() => { setView('admin'); window.location.hash = 'admin'; }} 
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-light text-neutral-400"
              title="Staff Portal Login"
            >
              Staff Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Terms & Conditions Modal Popup */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-fade-in" id="terms-modal-wrapper">
          <div className="relative w-full max-w-2xl bg-white border border-neutral-150 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up animate-fade-in" id="terms-modal">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-150 p-5 md:p-6 select-none">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-neutral-950" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-950">Terms &amp; Conditions</h3>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-950 transition-all cursor-pointer"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-neutral-600 font-sans font-light leading-relaxed">
              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9.5px]">1. Scope of Sartorial Agreement</h4>
                <p>
                  By accessing Ceylon Couture, shopping from our collections, or placing orders via our secure channels, you enter a mutual agreement respecting authentic textile design. All garments are crafted with premium fabrics sourced carefully across South Asia and finished inside our local showrooms.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9.5px]">2. Sizing &amp; Custom Tailoring Measurements</h4>
                <p>
                  Our sizing corresponds to verified bespoke retail profiles. Clients are advised to reference the specific measurements provided on each product page prior to ordering. Minor material tolerance of &plusmn;0.5 inches remains a characteristic of hand-loomed and bias-cut artisan draping.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9.5px]">3. Transaction Gateways &amp; Escrow</h4>
                <p>
                  We offer double-authenticated payments via credit/debit card gateways, direct bank transfers, or secure Cash on Delivery (COD). In compliance with local Sri Lankan trade regulations, cash collection upon delivery requires matching verification SMS codes to release sealed premium parcel shipments.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9.5px]">4. Island-Wide Premium Logistics</h4>
                <p>
                  Orders are dispatched within 24–48 working hours from our central distribution hub in Welisara. Delivery milestones are tracked live via our customer portal. We guarantee safe transit across Colombo, Kandy, Galle, Jaffna, and other regional island territories.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 uppercase tracking-widest text-[9.5px]">5. Intellectual Property &amp; Brand Copyright</h4>
                <p>
                  All catalog imagery, brand logos, custom fabric motifs, and proprietary software interfaces remain the exclusive intellectual property of API &amp; Textile Private Limited. Duplication or unauthorized reproduction is strictly prohibited under federal laws.
                </p>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="border-t border-neutral-150 p-5 bg-neutral-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 text-[9px] font-semibold text-neutral-400 uppercase tracking-wider select-none">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Sri Lanka Trade Compliant
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-widest py-3 px-6 transition-all cursor-pointer rounded-xl border border-neutral-950 shadow-xs"
              >
                I Understand &amp; Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Success Modal */}
      {confirmedOrder && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-serif italic text-neutral-950">
                Order Confirmed Successfully!
              </h3>
              <p className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-widest bg-neutral-100 py-1.5 px-3 rounded-lg w-fit mx-auto border border-neutral-200">
                Order Ref: {confirmedOrder.orderNumber}
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-2.5 text-xs font-sans">
              <div className="flex justify-between items-center text-neutral-600">
                <span>Payment Channel:</span>
                <span className="font-bold text-neutral-900">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Fulfillment Status:</span>
                <span className="font-bold text-neutral-900 px-2.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                  {confirmedOrder.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-neutral-600">
                <span>Customer Email:</span>
                <span className="font-bold text-neutral-900">{confirmedOrder.email}</span>
              </div>
              <div className="flex justify-between items-center text-neutral-600 border-t border-neutral-200 pt-2 font-bold">
                <span>Grand Total:</span>
                <span className="text-base text-neutral-950">Rs. {confirmedOrder.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {confirmedOrder.paymentMethod.toLowerCase().includes('cash') && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-950 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900 uppercase tracking-wider text-[10px]">
                  💵 Cash on Delivery Instructions:
                </p>
                <p>
                  Your Cash on Delivery order is confirmed! Please hand over exact cash payment of <strong>Rs. {confirmedOrder.grandTotal.toLocaleString()}</strong> to the courier dispatch team upon package arrival.
                </p>
              </div>
            )}

            {confirmedOrder.paymentMethod.toLowerCase().includes('bank') && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-950 text-xs leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900 uppercase tracking-wider text-[10px]">
                  🏦 Bank Transfer Slip Received:
                </p>
                <p>
                  Your wire deposit slip has been attached. Our dispatch accounting team will review and confirm your payment shortly.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setView('portal');
                }}
                className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-[0.15em] py-3.5 rounded-xl cursor-pointer transition-colors border border-neutral-950 shadow-xs"
              >
                Track Order in Client Lounge
              </button>
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setView('store');
                }}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs uppercase tracking-[0.15em] py-3.5 rounded-xl cursor-pointer transition-colors border border-neutral-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elegant Back to Top Floating Button */}
      <BackToTop />

    </div>
  );
}
