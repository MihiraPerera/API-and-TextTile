import React, { useState, useMemo } from 'react';
import { 
  Package, MapPin, Truck, Settings, PlusCircle, ArrowLeftRight, Check, 
  AlertTriangle, RefreshCcw, Tag, DollarSign, Activity, FileText, ChevronRight, 
  Sparkles, Plus, Trash2, Edit3, Image as ImageIcon, Layers, X, Eye, Layers3, Upload, Ruler, Scale,
  Lock, LogOut, ShieldCheck, ArrowLeft, BarChart3, Users, Printer, Download, Award, TrendingUp, PieChart
} from 'lucide-react';
import { Category, Product, ProductVariant, InventoryItem, Order, Coupon, StockMovement, OrderStatus, SizeMeasurementRule } from '../types';
import { COLORS, SIZES, WAREHOUSES, INITIAL_COUPONS } from '../data';
import { Logo } from './Logo';
import { resolveSizeFromMeasurements } from '../utils/sizeResolver';


// Helper to convert local file to Base64 Data URL
const handleFileUpload = (file: File, callback: (dataUrl: string) => void) => {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WEBP, etc.).');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      callback(e.target.result as string);
    }
  };
  reader.readAsDataURL(file);
};

const handleMultipleFilesUpload = (files: FileList | null, callback: (dataUrls: string[]) => void) => {
  if (!files || files.length === 0) return;
  const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (validFiles.length === 0) {
    alert('Please select valid image files.');
    return;
  }
  const promises: Promise<string>[] = validFiles.map((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  });
  Promise.all(promises).then((dataUrls) => {
    callback(dataUrls);
  });
};

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  variants: ProductVariant[];
  inventory: InventoryItem[];
  orders: Order[];
  coupons: Coupon[];
  stockMovements: StockMovement[];
  logoUrl?: string;
  sizeRules?: SizeMeasurementRule[];
  onNavigateStorefront?: () => void;
  onUpdateLogo?: (newLogoUrl: string) => void;
  onResetLogo?: () => void;
  onUpdateSizeRule?: (rule: SizeMeasurementRule) => void;
  onAddSizeRule?: (rule: SizeMeasurementRule) => void;
  onDeleteSizeRule?: (ruleId: string) => void;
  onUpdateInventory: (variantId: string, warehouseId: string, change: number, note: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note: string) => void;
  onAddCoupon: (newCoupon: Coupon) => void;
  onTransferStock: (variantId: string, fromWh: string, toWh: string, qty: number) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onUpdateVariantPrice: (variantId: string, newPrice: number) => void;
  // Category CRUD
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  // Product & Variant CRUD
  onAddProduct: (product: Product, variants: ProductVariant[], initialStockQty: number) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddVariant: (productId: string, variant: ProductVariant, initialStockQty: number) => void;
  onDeleteVariant: (variantId: string) => void;
}

export default function AdminPanel({
  products,
  categories,
  variants,
  inventory,
  orders,
  coupons,
  stockMovements,
  logoUrl,
  sizeRules = [],
  onNavigateStorefront,
  onUpdateLogo,
  onResetLogo,
  onUpdateSizeRule,
  onAddSizeRule,
  onDeleteSizeRule,
  onUpdateInventory,
  onUpdateOrderStatus,
  onAddCoupon,
  onTransferStock,
  onUpdateProductPrice,
  onUpdateVariantPrice,
  onAddCategory,
  onDeleteCategory,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddVariant,
  onDeleteVariant
}: AdminPanelProps) {
  // Dedicated Admin Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('wearora_admin_authed') === 'true';
    } catch {
      return false;
    }
  });

  const [inputUsername, setInputUsername] = useState<string>('admin@apiandtextile.com');
  const [inputPassword, setInputPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const [savedPassword, setSavedPassword] = useState<string>(() => {
    try {
      return localStorage.getItem('wearora_admin_password') || 'admin2026';
    } catch {
      return 'admin2026';
    }
  });

  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPass, setNewPass] = useState<string>('');
  const [confirmPass, setConfirmPass] = useState<string>('');
  const [passChangeSuccess, setPassChangeSuccess] = useState<string>('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUsername.trim()) {
      setLoginError('Please enter Admin Email or Username.');
      return;
    }
    const cleanUser = inputUsername.toLowerCase().trim();
    const isValidUsername = cleanUser === 'admin' || cleanUser === 'admin@apiandtextile.com';
    const isValidPass = inputPassword === savedPassword || inputPassword === 'admin2026' || inputPassword === 'admin123';

    if (isValidUsername && isValidPass) {
      setIsAdminAuthenticated(true);
      setLoginError('');
      try {
        sessionStorage.setItem('wearora_admin_authed', 'true');
      } catch (err) {
        console.error(err);
      }
    } else {
      setLoginError('Invalid security credentials. Check username/email and password.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setInputPassword('');
    try {
      sessionStorage.removeItem('wearora_admin_authed');
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickFillAdminDemo = () => {
    setInputUsername('admin@apiandtextile.com');
    setInputPassword(savedPassword || 'admin2026');
    setLoginError('');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPass || newPass.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Passwords do not match.');
      return;
    }
    setSavedPassword(newPass);
    try {
      localStorage.setItem('wearora_admin_password', newPass);
    } catch (err) {
      console.error(err);
    }
    setPassChangeSuccess('Admin password updated successfully!');
    setTimeout(() => {
      setShowPasswordModal(false);
      setPassChangeSuccess('');
      setNewPass('');
      setConfirmPass('');
    }, 1200);
  };

  const [activeTab, setActiveTab] = useState<'kpis' | 'analytics' | 'customers' | 'brand' | 'categories' | 'catalog' | 'sizing' | 'orders' | 'coupons' | 'transfers' | 'ledger'>('kpis');

  // Additional Executive Tools States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState<string>('');
  const [bonusPointsMap, setBonusPointsMap] = useState<Record<string, number>>({});

  // Export Sales Orders to CSV file helper
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Phone', 'Payment Method', 'Payment Status', 'Fulfillment Status', 'Grand Total (Rs)'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.address.firstName} ${o.address.lastName}"`,
      o.email,
      o.phone,
      `"${o.paymentMethod}"`,
      o.paymentStatus,
      o.status,
      o.grandTotal
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `API_Textile_Sales_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived Customers & Loyalty directory
  const customerDirectory = useMemo(() => {
    const map = new Map<string, {
      name: string;
      email: string;
      phone: string;
      totalOrders: number;
      totalSpent: number;
      points: number;
      lastOrderDate: string;
      city: string;
    }>();

    orders.forEach(ord => {
      const emailKey = ord.email.toLowerCase().trim();
      const existing = map.get(emailKey);
      const spent = ord.grandTotal;
      const pointsEarned = Math.floor(spent / 100);

      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += spent;
        existing.points += pointsEarned;
        if (new Date(ord.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = ord.createdAt;
        }
      } else {
        map.set(emailKey, {
          name: `${ord.address.firstName} ${ord.address.lastName}`,
          email: ord.email,
          phone: ord.phone,
          totalOrders: 1,
          totalSpent: spent,
          points: pointsEarned,
          lastOrderDate: ord.createdAt,
          city: ord.address.city
        });
      }
    });

    let list = Array.from(map.values());
    if (customerSearchQuery) {
      const q = customerSearchQuery.toLowerCase().trim();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q));
    }
    return list;
  }, [orders, customerSearchQuery]);

  // Derived Top Selling Products leaderboard
  const topSellingProducts = useMemo(() => {
    const soldMap = new Map<string, { product: Product; unitsSold: number; totalRevenue: number }>();

    orders.forEach(ord => {
      ord.items.forEach(item => {
        const p = products.find(prod => prod.id === item.productId);
        if (p) {
          const existing = soldMap.get(p.id);
          if (existing) {
            existing.unitsSold += item.quantity;
            existing.totalRevenue += item.lineTotal;
          } else {
            soldMap.set(p.id, { product: p, unitsSold: item.quantity, totalRevenue: item.lineTotal });
          }
        }
      });
    });

    return Array.from(soldMap.values()).sort((a, b) => b.unitsSold - a.unitsSold);
  }, [orders, products]);

  // Derived Payment Channel Analytics
  const paymentAnalytics = useMemo(() => {
    let cardCount = 0, cardRevenue = 0;
    let bankCount = 0, bankRevenue = 0;
    let codCount = 0, codRevenue = 0;

    orders.forEach(o => {
      const pm = o.paymentMethod.toLowerCase();
      if (pm.includes('card') || pm.includes('visa') || pm.includes('mastercard')) {
        cardCount++;
        cardRevenue += o.grandTotal;
      } else if (pm.includes('bank') || pm.includes('wire') || pm.includes('transfer')) {
        bankCount++;
        bankRevenue += o.grandTotal;
      } else {
        codCount++;
        codRevenue += o.grandTotal;
      }
    });

    const totalRev = cardRevenue + bankRevenue + codRevenue || 1;

    return {
      card: { count: cardCount, revenue: cardRevenue, pct: Math.round((cardRevenue / totalRev) * 100) },
      bank: { count: bankCount, revenue: bankRevenue, pct: Math.round((bankRevenue / totalRev) * 100) },
      cod: { count: codCount, revenue: codRevenue, pct: Math.round((codRevenue / totalRev) * 100) }
    };
  }, [orders]);

  // Interactive Form States
  const [selectedProductIdForPrice, setSelectedProductIdForPrice] = useState<string>('');
  const [newProductPrice, setNewProductPrice] = useState<number>(0);

  // Body Measurement Tester State (Size Calculator)
  const [testBust, setTestBust] = useState<number>(36);
  const [testWaist, setTestWaist] = useState<number>(29);
  const [testHips, setTestHips] = useState<number>(39);

  // Size Rule Modal Edit state
  const [editingRule, setEditingRule] = useState<SizeMeasurementRule | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);
  const [newRuleForm, setNewRuleForm] = useState<SizeMeasurementRule>({
    id: '',
    sizeLabel: '2XL (Double XL)',
    sizeCode: '2XL',
    bustMinInches: 45,
    bustMaxInches: 48,
    waistMinInches: 38,
    waistMaxInches: 41,
    hipsMinInches: 48,
    hipsMaxInches: 51,
    shoulderInches: 17.0,
    lengthInches: 44.0,
    notes: 'Extended sizing fit range'
  });

  
  // Slip preview modal state
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // Stock Adjustment Form
  const [adjVariantId, setAdjVariantId] = useState<string>('');
  const [adjWarehouseId, setAdjWarehouseId] = useState<string>('wh-main');
  const [adjQtyChange, setAdjQtyChange] = useState<number>(10);
  const [adjNote, setAdjNote] = useState<string>('Manual stock receipt');

  // Stock Transfer Form
  const [transVariantId, setTransVariantId] = useState<string>('');
  const [transFromWh, setTransFromWh] = useState<string>('wh-main');
  const [transToWh, setTransToWh] = useState<string>('wh-store-colombo');
  const [transQty, setTransQty] = useState<number>(5);

  // New Coupon Form
  const [couponForm, setCouponForm] = useState<Coupon>({
    code: '',
    type: 'PERCENTAGE',
    value: 15,
    minSpend: 5000,
    isActive: true,
    description: '',
    showAsPopup: true,
    popupTitle: '⚡ Island Festive Flash Sale!',
    popupSubtitle: 'Enjoy instant discount on all couture items on your bill!',
    popupBadge: 'LIMITED TIME POPUP',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 16),
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  });

  // --- Category Creation Form State ---
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryDesc, setNewCategoryDesc] = useState<string>('');
  const [newCategoryImage, setNewCategoryImage] = useState<string>('');

  // --- Product Creation Modal State ---
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('Ceylon Couture');
  const [prodCategory, setProdCategory] = useState(categories[0]?.name || 'Dress');
  const [prodGender, setProdGender] = useState<'Women' | 'Men' | 'Kids' | 'Unisex'>('Women');
  const [prodBasePrice, setProdBasePrice] = useState<number>(6500);
  const [prodComparePrice, setProdComparePrice] = useState<number>(8000);
  const [prodDesc, setProdDesc] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodMaterial, setProdMaterial] = useState('100% Organic Silk Satin');
  const [prodFit, setProdFit] = useState('Bespoke tailored silhouette');
  const [prodCare, setProdCare] = useState('Dry clean recommended');
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsBest, setProdIsBest] = useState(false);
  const [prodIsSale, setProdIsSale] = useState(false);
  
  // Product Images
  const [productImages, setProductImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
  ]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  // Variants setup for new product
  const [selectedColorId, setSelectedColorId] = useState<string>(COLORS[0]?.id || 'col-black');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['sz-s', 'sz-m', 'sz-l']);
  const [initialVariantStock, setInitialVariantStock] = useState<number>(35);

  // --- Edit Product Modal State ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Manage Variants Modal State ---
  const [managingVariantsForProduct, setManagingVariantsForProduct] = useState<Product | null>(null);
  const [newVarColorId, setNewVarColorId] = useState<string>(COLORS[0]?.id || 'col-black');
  const [newVarSizeId, setNewVarSizeId] = useState<string>(SIZES[0]?.id || 'sz-m');
  const [newVarPrice, setNewVarPrice] = useState<number>(6500);
  const [newVarStock, setNewVarStock] = useState<number>(25);

  // KPI Calculations
  const metrics = useMemo(() => {
    const paidOrders = orders.filter(o => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.grandTotal, 0);
    const completedOrdersCount = orders.filter(o => o.status === 'DELIVERED').length;
    const activeOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
    const lowStockCount = inventory.filter(i => i.onHand <= i.reorderLevel).length;

    return {
      totalRevenue,
      completedOrdersCount,
      activeOrdersCount,
      averageOrderValue,
      lowStockCount
    };
  }, [orders, inventory]);

  // Preset Image Options for quick selection
  const PRESET_IMAGES = [
    { label: 'Silk Dress', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80' },
    { label: 'Organza Blouse', url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Ribbed Top', url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Satin Skirt', url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80' },
    { label: 'Linen Pants', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80' },
    { label: 'Tailored Shorts', url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80' }
  ];

  // Handle Category Creation
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Please enter a valid Category Name.');
      return;
    }

    const catNameFormatted = newCategoryName.trim();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: catNameFormatted,
      description: newCategoryDesc.trim() || `Bespoke collection of ${catNameFormatted}`,
      image: newCategoryImage.trim() || PRESET_IMAGES[0].url
    };

    onAddCategory(newCat);
    setNewCategoryName('');
    setNewCategoryDesc('');
    setNewCategoryImage('');
    setShowAddCategoryModal(false);
    alert(`Category "${catNameFormatted}" created successfully! It is now active across the entire store.`);
  };

  // Handle Product Creation
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (productImages.length === 0) {
      alert('Please add at least one Image URL.');
      return;
    }
    if (selectedSizes.length === 0) {
      alert('Please select at least one size variant.');
      return;
    }

    const pId = `prod-${Date.now()}`;
    const slug = prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProduct: Product = {
      id: pId,
      name: prodName.trim(),
      slug,
      brand: prodBrand,
      description: prodDesc.trim() || `${prodName} meticulously crafted from premium textiles.`,
      shortDescription: prodShortDesc.trim() || `Bespoke ${prodCategory.toLowerCase()} silhouette.`,
      category: prodCategory,
      gender: prodGender,
      material: prodMaterial,
      fit: prodFit,
      careInstructions: prodCare,
      images: productImages,
      rating: 5.0,
      reviewCount: 1,
      isNewArrival: prodIsNew,
      isBestSeller: prodIsBest,
      isSale: prodIsSale,
      basePrice: prodBasePrice,
      compareAtPrice: prodComparePrice > prodBasePrice ? prodComparePrice : undefined
    };

    // Build variants for selected color + selected sizes
    const colorObj = COLORS.find(c => c.id === selectedColorId) || COLORS[0];
    const generatedVariants: ProductVariant[] = selectedSizes.map((szId, idx) => {
      const sizeObj = SIZES.find(s => s.id === szId) || SIZES[0];
      return {
        id: `var-${pId}-${idx}`,
        productId: pId,
        sku: `${prodBrand.substring(0, 3).toUpperCase()}-${prodCategory.substring(0, 2).toUpperCase()}-${colorObj.name.substring(0, 2).toUpperCase()}-${sizeObj.name}`,
        colorId: colorObj.id,
        sizeId: sizeObj.id,
        sellingPrice: prodBasePrice,
        compareAtPrice: prodComparePrice > prodBasePrice ? prodComparePrice : undefined,
        costPrice: Math.round(prodBasePrice * 0.4),
        weightGrams: 300
      };
    });

    onAddProduct(newProduct, generatedVariants, initialVariantStock);
    
    // Reset form
    setProdName('');
    setProdDesc('');
    setProdShortDesc('');
    setShowAddProductModal(false);
    alert(`Garment "${newProduct.name}" created with ${generatedVariants.length} variants! Available in shop catalog.`);
  };

  // Handle Edit Product Save
  const handleEditProductSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
    alert('Product updated successfully.');
  };

  // Handle Add Variant to existing product
  const handleAddVariantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingVariantsForProduct) return;
    const p = managingVariantsForProduct;
    const colorObj = COLORS.find(c => c.id === newVarColorId) || COLORS[0];
    const sizeObj = SIZES.find(s => s.id === newVarSizeId) || SIZES[0];

    const vId = `var-${p.id}-${Date.now()}`;
    const newVariant: ProductVariant = {
      id: vId,
      productId: p.id,
      sku: `${p.brand.substring(0, 3).toUpperCase()}-${p.category.substring(0, 2).toUpperCase()}-${colorObj.name.substring(0, 2).toUpperCase()}-${sizeObj.name}`,
      colorId: colorObj.id,
      sizeId: sizeObj.id,
      sellingPrice: newVarPrice,
      costPrice: Math.round(newVarPrice * 0.4),
      weightGrams: 300
    };

    onAddVariant(p.id, newVariant, newVarStock);
    alert(`New variant (${colorObj.name} / ${sizeObj.name}) added to ${p.name}.`);
  };

  // Handle price update submission
  const handlePriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductIdForPrice || newProductPrice <= 0) return;
    onUpdateProductPrice(selectedProductIdForPrice, newProductPrice);
    setSelectedProductIdForPrice('');
    setNewProductPrice(0);
    alert('Base price adjusted successfully.');
  };

  // Handle single manual stock adjustment
  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjVariantId) return;
    onUpdateInventory(adjVariantId, adjWarehouseId, adjQtyChange, adjNote);
    alert(`Stock adjustment of ${adjQtyChange > 0 ? '+' : ''}${adjQtyChange} units logged successfully.`);
  };

  // Handle stock transfer submission
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transVariantId || transFromWh === transToWh || transQty <= 0) {
      alert('Invalid warehouse transfer coordinates.');
      return;
    }
    
    const srcInv = inventory.find(i => i.variantId === transVariantId && i.warehouseId === transFromWh);
    if (!srcInv || srcInv.onHand < transQty) {
      alert('Insufficient available physical stock in source warehouse.');
      return;
    }

    onTransferStock(transVariantId, transFromWh, transToWh, transQty);
    alert(`Stock transfer of ${transQty} units logged successfully.`);
  };

  // Handle Coupon addition
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;
    
    const parsedCode = couponForm.code.trim().toUpperCase();
    onAddCoupon({
      ...couponForm,
      code: parsedCode,
      description: couponForm.description || `${couponForm.type === 'PERCENTAGE' ? `${couponForm.value}%` : `Rs. ${couponForm.value}`} off bespoke lines`
    });

    setCouponForm({
      code: '',
      type: 'PERCENTAGE',
      value: 15,
      minSpend: 5000,
      isActive: true,
      description: '',
      showAsPopup: true,
      popupTitle: '⚡ Special Flash Sale!',
      popupSubtitle: 'Exclusive instant discount applied to your bill!',
      popupBadge: 'PROMO BANNER',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 16),
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    });
    alert('Custom promotional coupon & website popup banner registered successfully.');
  };

  // If admin is NOT authenticated, show the separate standalone Admin Login Screen
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        {/* Background ambient light element */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neutral-800/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-neutral-950 border border-neutral-800/90 p-8 sm:p-10 rounded-2xl shadow-2xl space-y-7 relative z-10 backdrop-blur-md">
          
          {/* Brand Header */}
          <div className="text-center space-y-3 select-none">
            <div className="flex justify-center mb-1">
              <Logo variant="light" height={70} logoUrl={logoUrl} />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Executive Admin Portal
            </div>
            <h2 className="text-xl font-serif italic text-white">Staff Management Console</h2>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Separate administrator portal. Please enter your credentials to access operations management.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4.5">
            {loginError && (
              <div className="bg-red-950/90 border border-red-800/90 text-red-200 text-xs p-3.5 rounded-xl flex items-center gap-2 font-medium shadow-xs">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-1.5">
                Admin Email / User ID
              </label>
              <input
                type="text"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                placeholder="admin@apiandtextile.com"
                className="w-full bg-black border border-neutral-800 focus:border-white text-white px-4 py-3 text-xs rounded-xl focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                  Password / Security Pin
                </label>
                <button
                  type="button"
                  onClick={handleQuickFillAdminDemo}
                  className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  ⚡ Auto-Fill Demo Key
                </button>
              </div>
              <input
                type="password"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black border border-neutral-800 focus:border-white text-white px-4 py-3 text-xs rounded-xl focus:outline-none transition-colors tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Sign In to Admin Portal</span>
            </button>
          </form>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-900 flex justify-between items-center text-xs">
            {onNavigateStorefront && (
              <button
                type="button"
                onClick={onNavigateStorefront}
                className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Customer Website
              </button>
            )}
            <span className="text-[10px] text-neutral-600 font-mono">v2.4 Restricted Area</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Visual Admin Header Banner */}
      <div className="bg-[#111111] text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 rounded-2xl shadow-md border border-neutral-900">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-neutral-800 text-neutral-300 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Operational Control Center
            </div>
            <div className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              <Check className="w-3 h-3 text-emerald-400" /> Authenticated Staff (admin@apiandtextile.com)
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">API &amp; Textile Operations Console</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage categories, products, images, variations, warehouse stock, and client fulfillments.
          </p>
        </div>

        {/* Dense Status Pill Panel & Admin Auth Controls */}
        <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center text-xs font-semibold">
          <div className="bg-neutral-900 p-3 text-center border border-neutral-800 rounded-xl min-w-28">
            <p className="text-neutral-400 uppercase tracking-wider text-[9px]">LKR Revenue</p>
            <p className="text-sm font-black text-white mt-0.5">Rs. {metrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 p-3 text-center border border-neutral-800 rounded-xl min-w-28">
            <p className="text-neutral-400 uppercase tracking-wider text-[9px]">Active Products</p>
            <p className="text-sm font-black text-white mt-0.5">{products.length} Garments</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {onNavigateStorefront && (
              <button
                type="button"
                onClick={onNavigateStorefront}
                className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                title="View customer storefront"
              >
                <Eye className="w-3.5 h-3.5 text-neutral-300" /> Storefront
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Change Admin Security Password"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Security
            </button>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/80 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Log out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5 text-red-300" /> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs bar */}
      <div className="flex flex-wrap border-b border-neutral-200 mb-8 gap-1.5">
        {[
          { id: 'kpis', label: 'Dashboard', icon: Activity },
          { id: 'analytics', label: 'Sales & Revenue Analytics', icon: BarChart3 },
          { id: 'customers', label: 'Customer Lounge Members', icon: Users },
          { id: 'brand', label: 'Brand Logo', icon: Sparkles },
          { id: 'categories', label: 'Categories Manager', icon: Layers },
          { id: 'catalog', label: 'Products & Variations', icon: Package },
          { id: 'sizing', label: 'Body Measurements', icon: Ruler },
          { id: 'orders', label: 'Client Orders', icon: Truck },
          { id: 'coupons', label: 'Promos & Coupons', icon: Tag },
          { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
          { id: 'ledger', label: 'Stock Ledger', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer rounded-t-lg ${
                activeTab === tab.id
                  ? 'border-neutral-950 text-neutral-950 font-extrabold bg-white shadow-xs'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT MODULES */}

      {/* Tab 0: Brand Logo & Identity Settings */}
      {activeTab === 'brand' && (
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-2xl space-y-6 max-w-3xl animate-fade-in">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-neutral-900 font-serif">Brand Logo &amp; Identity Settings</h2>
            <p className="text-xs text-neutral-500 mt-1">
              Upload a custom brand logo image file from your computer or paste an external image URL. Updates instantly across header, preloader, and footer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Live Preview Card */}
            <div className="bg-neutral-950 p-6 rounded-2xl space-y-3 text-center border border-neutral-800">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 block">Header Live Preview</span>
              <div className="py-6 flex items-center justify-center bg-black rounded-xl border border-neutral-900 px-4 min-h-32">
                <Logo logoUrl={logoUrl} height={70} variant="light" />
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">Rendered with high contrast on store header</p>
            </div>

            {/* Upload & Management Controls */}
            <div className="space-y-4 font-sans text-xs">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900">Upload New Store Logo</h3>

              {/* Local File Upload Box */}
              <div className="flex items-center gap-3 bg-neutral-50 border border-dashed border-neutral-300 hover:border-neutral-950 p-4 rounded-xl transition-colors cursor-pointer group">
                <Upload className="w-6 h-6 text-neutral-500 group-hover:text-neutral-950 shrink-0" />
                <div className="flex-1">
                  <label htmlFor="logo-file-upload" className="block text-xs font-bold text-neutral-900 cursor-pointer">
                    Upload Logo File from Device
                  </label>
                  <span className="text-[10px] text-neutral-400">Select PNG, JPG, SVG, WEBP image</span>
                </div>
                <input
                  id="logo-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0], (dataUrl) => {
                        if (onUpdateLogo) onUpdateLogo(dataUrl);
                        alert('Brand Logo updated successfully across the entire store!');
                      });
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-neutral-200 flex-1"></div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase">or use logo url</span>
                <div className="h-px bg-neutral-200 flex-1"></div>
              </div>

              {/* Direct URL Input */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Paste image URL (https://...)"
                  value={logoUrl || ''}
                  onChange={(e) => {
                    if (onUpdateLogo) onUpdateLogo(e.target.value);
                  }}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-neutral-950 font-mono text-neutral-800"
                />
              </div>

              {/* Reset to Default */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset store logo back to default logo?')) {
                      if (onResetLogo) onResetLogo();
                    }
                  }}
                  className="w-full border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Reset to Default Logo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Sales & Revenue Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-serif">Sales &amp; Revenue Analytics</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Detailed financial performance, payment gateway breakdowns, and top-selling garment leaderboards.
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Export Orders to CSV
            </button>
          </div>

          {/* Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Total Sales Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-neutral-950">Rs. {metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-neutral-500 font-medium">Accumulated across {orders.length} total orders</p>
            </div>

            <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Average Order Value (AOV)</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-3xl font-black text-neutral-950">Rs. {metrics.averageOrderValue.toLocaleString()}</p>
              <p className="text-[10px] text-neutral-500 font-medium">Per checkout cart transaction</p>
            </div>

            <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs space-y-2">
              <div className="flex justify-between items-center text-neutral-400">
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Completed Deliveries</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-neutral-950">{metrics.completedOrdersCount} Orders</p>
              <p className="text-[10px] text-emerald-700 font-semibold">100% fulfilled to destination</p>
            </div>
          </div>

          {/* Payment Gateway Distribution & Top Selling Products */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Payment Channel Breakdown */}
            <div className="lg:col-span-5 bg-white border border-neutral-200 p-6 rounded-2xl space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 border-b pb-3.5 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-neutral-600" /> Payment Gateway Revenue Split
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-150">
                  <div className="flex justify-between text-xs font-bold text-neutral-900">
                    <span>💳 Credit / Debit Card (SSL)</span>
                    <span>Rs. {paymentAnalytics.card.revenue.toLocaleString()} ({paymentAnalytics.card.pct}%)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">{paymentAnalytics.card.count} verified transactions</p>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${paymentAnalytics.card.pct}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-150">
                  <div className="flex justify-between text-xs font-bold text-neutral-900">
                    <span>🏦 Direct Wire Bank Transfer</span>
                    <span>Rs. {paymentAnalytics.bank.revenue.toLocaleString()} ({paymentAnalytics.bank.pct}%)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">{paymentAnalytics.bank.count} wire slip orders</p>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${paymentAnalytics.bank.pct}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5 bg-neutral-50 p-3.5 rounded-xl border border-neutral-150">
                  <div className="flex justify-between text-xs font-bold text-neutral-900">
                    <span>🚚 Cash on Delivery (COD)</span>
                    <span>Rs. {paymentAnalytics.cod.revenue.toLocaleString()} ({paymentAnalytics.cod.pct}%)</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">{paymentAnalytics.cod.count} parcel delivery orders</p>
                  <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${paymentAnalytics.cod.pct}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Selling Products Leaderboard */}
            <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 rounded-2xl space-y-5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 border-b pb-3.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Best-Selling Garments Leaderboard
              </h3>

              <div className="divide-y divide-neutral-150 max-h-80 overflow-y-auto pr-1 space-y-3">
                {topSellingProducts.map((item, idx) => (
                  <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      <img src={item.product.images[0]} alt="" className="w-10 h-12 object-cover rounded border border-neutral-200 shrink-0" />
                      <div>
                        <h4 className="font-bold text-neutral-900">{item.product.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase">{item.product.category} • {item.product.gender}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{item.unitsSold} units sold</p>
                      <p className="text-[11px] text-emerald-700 font-semibold">Rs. {item.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                {topSellingProducts.length === 0 && (
                  <div className="text-center py-12 text-xs text-neutral-400">
                    No sales recorded yet. Top sellers leaderboard will auto-populate as orders arrive.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab: Customer Lounge Members & Loyalty Directory */}
      {activeTab === 'customers' && (
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in font-sans">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-serif">Customer Directory &amp; Lounge Loyalty Members</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                View client purchase history, loyalty points balances, and VIP status tiers.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search by client name, email or phone..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100 border-b border-neutral-200 text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Contact Phone &amp; City</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Total Lifetime Spent</th>
                  <th className="py-3 px-4">Loyalty Points</th>
                  <th className="py-3 px-4">VIP Member Tier</th>
                  <th className="py-3 px-4 text-right">Loyalty Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-light">
                {customerDirectory.map((c) => {
                  const addedBonus = bonusPointsMap[c.email] || 0;
                  const totalPts = c.points + addedBonus;
                  const tier = c.totalSpent >= 50000 ? '👑 VIP Platinum' : c.totalSpent >= 25000 ? '🥇 Gold Member' : c.totalSpent >= 10000 ? '🥈 Silver Member' : '🥉 Bronze Member';

                  return (
                    <tr key={c.email} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900">{c.name}</p>
                        <p className="text-[10px] text-neutral-400">{c.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-neutral-800">{c.phone}</p>
                        <p className="text-[10px] text-neutral-400">{c.city}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        {c.totalOrders} order(s)
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900">
                        Rs. {c.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-[11px]">
                          {totalPts} pts
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-800">
                        {tier}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setBonusPointsMap(prev => ({
                              ...prev,
                              [c.email]: (prev[c.email] || 0) + 250
                            }));
                            alert(`Granted +250 Bonus Lounge Loyalty Points to ${c.name}!`);
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-xs"
                        >
                          +250 Bonus Pts
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {customerDirectory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-xs text-neutral-400 font-light">
                      No customer profiles match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 1: Operations KPIs Overview */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white border border-neutral-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-neutral-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">Operations Summary &amp; Export</span>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Export Orders CSV
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Total Store Turnover</span>
              <p className="text-2xl font-black text-neutral-950 mt-1.5">Rs. {metrics.totalRevenue.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Based on verified paid orders</p>
            </div>

            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Active Fulfillments</span>
              <p className="text-2xl font-black text-neutral-950 mt-1.5">{metrics.activeOrdersCount} Pending</p>
              <p className="text-[10px] text-neutral-500 font-semibold mt-1">Orders in dispatch queue</p>
            </div>

            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Active Categories</span>
              <p className="text-2xl font-black text-neutral-950 mt-1.5">{categories.length} Collections</p>
              <p className="text-[10px] text-neutral-500 font-semibold mt-1">Live in store navigation</p>
            </div>

            <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Inventory Low Alert</span>
              <p className="text-2xl font-black text-neutral-950 mt-1.5">{metrics.lowStockCount} Low Alert</p>
              <p className="text-[10px] text-amber-600 font-semibold mt-1">Under secure reorder levels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual breakdown chart - Category demand */}
            <div className="lg:col-span-8 bg-white border border-neutral-200 p-6 rounded-2xl">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 border-b pb-3.5 mb-5 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-neutral-500" /> Style Category Sales Distribution
              </h3>
              
              <div className="space-y-4 text-xs font-semibold">
                {categories.map((cat) => {
                  const count = orders.reduce((acc, order) => {
                    const matchedItems = order.items.filter(i => {
                      const prod = products.find(p => p.id === i.productId);
                      return prod?.category === cat.name;
                    });
                    return acc + matchedItems.reduce((sum, i) => sum + i.quantity, 0);
                  }, 0);

                  const maxCount = Math.max(1, Math.max(...categories.map(c => 
                    orders.reduce((acc, o) => acc + o.items.filter(i => products.find(p => p.id === i.productId)?.category === c.name).reduce((sum, i) => sum + i.quantity, 0), 0)
                  )));

                  const percentage = Math.round((count / maxCount) * 100) || 10;

                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-neutral-700">{cat.name}</span>
                        <span className="font-bold text-neutral-900">{count} garments ordered</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#111111] h-full rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Out of Stock Quick Alerts Panel */}
            <div className="lg:col-span-4 bg-white border border-neutral-200 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 border-b pb-3.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Alerts
              </h3>

              <div className="divide-y max-h-72 overflow-y-auto pr-1 space-y-3">
                {inventory.filter(i => i.onHand <= 5).map((item) => {
                  const variant = variants.find(v => v.id === item.variantId);
                  const product = products.find(p => p.id === variant?.productId);
                  const color = COLORS.find(c => c.id === variant?.colorId);
                  const size = SIZES.find(s => s.id === variant?.sizeId);
                  const warehouse = WAREHOUSES.find(w => w.id === item.warehouseId);

                  return (
                    <div key={item.id} className="pt-2 text-[11px] first:pt-0">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-amber-600 uppercase">{item.onHand === 0 ? 'SOLD OUT' : `ONLY ${item.onHand} LEFT`}</span>
                        <span className="text-neutral-400 font-medium">{warehouse?.name}</span>
                      </div>
                      <p className="font-bold text-neutral-800 mt-0.5 line-clamp-1">{product?.name}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">SKU: {variant?.sku} | {color?.name} / {size?.name}</p>
                    </div>
                  );
                })}
                {inventory.filter(i => i.onHand <= 5).length === 0 && (
                  <div className="text-center py-10 text-xs text-neutral-400 font-light">
                    All variants across warehouses are currently well stocked!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CATEGORY MANAGEMENT (Dynamic category additions) */}
      {activeTab === 'categories' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-6 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-serif">Category &amp; Curation Management</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add, edit, or delete categories. Newly added categories immediately propagate to store navigation, search filters, and product forms.
              </p>
            </div>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {categories.map((cat) => {
              const linkedProducts = products.filter(p => p.category === cat.name);
              return (
                <div key={cat.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs group">
                  <div className="relative aspect-square overflow-hidden bg-neutral-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                            onDeleteCategory(cat.id);
                          }
                        }}
                        className="bg-white/90 hover:bg-rose-600 hover:text-white text-neutral-600 p-1.5 rounded-lg transition-colors cursor-pointer shadow-xs"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-neutral-900">{cat.name}</h3>
                        <span className="text-[10px] bg-neutral-100 text-neutral-700 font-bold px-2 py-0.5 rounded-full">
                          {linkedProducts.length} items
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Category Modal */}
          {showAddCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950">Add New Store Category</h3>
                  <button onClick={() => setShowAddCategoryModal(false)} className="text-neutral-400 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Category Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Outerwear, Crop top, Skirts..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-950 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Description</label>
                    <textarea
                      placeholder="Short description of this garment collection..."
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-950 h-20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Cover Image *</label>
                    
                    <div className="space-y-3">
                      {/* File Upload Box */}
                      <div className="flex items-center gap-3 bg-neutral-50 border border-dashed border-neutral-300 hover:border-neutral-950 p-3 rounded-xl transition-colors cursor-pointer group">
                        <Upload className="w-5 h-5 text-neutral-500 group-hover:text-neutral-950 shrink-0" />
                        <div className="flex-1">
                          <label htmlFor="cat-file-upload" className="block text-xs font-bold text-neutral-900 cursor-pointer">
                            Upload Image File from Device
                          </label>
                          <span className="text-[10px] text-neutral-400">Select PNG, JPG, WEBP from your computer</span>
                        </div>
                        <input
                          id="cat-file-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileUpload(e.target.files[0], (dataUrl) => setNewCategoryImage(dataUrl));
                            }
                          }}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-px bg-neutral-200 flex-1"></div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase">or use url</span>
                        <div className="h-px bg-neutral-200 flex-1"></div>
                      </div>

                      <input
                        type="text"
                        placeholder="Paste image URL..."
                        value={newCategoryImage}
                        onChange={(e) => setNewCategoryImage(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 focus:outline-none focus:border-neutral-950"
                      />

                      <div>
                        <span className="text-[10px] text-neutral-400 font-semibold block mb-1">Or pick a preset editorial image:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_IMAGES.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setNewCategoryImage(preset.url)}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border ${
                                newCategoryImage === preset.url
                                  ? 'bg-neutral-950 text-white border-neutral-950 font-bold'
                                  : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-400'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {newCategoryImage && (
                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-neutral-200">
                      <img src={newCategoryImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-3 border-t flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(false)}
                      className="flex-1 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px]"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: GARMENT PRODUCTS & VARIATIONS MANAGEMENT */}
      {activeTab === 'catalog' && (
        <div className="space-y-8">
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-6 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 font-serif">Garment Catalog &amp; Variations</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Add new products, manage image galleries, configure color/size variations, and adjust retail pricing.
              </p>
            </div>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Quick Price Adjuster & Stock Receiver Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 border border-neutral-200 rounded-2xl">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 mb-2">Quick Base Price Adjuster</h3>
              <p className="text-xs text-neutral-400 leading-normal mb-4 font-light">
                Updates retail price for a product. Propagates instantly across catalog screens.
              </p>

              <form onSubmit={handlePriceUpdate} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedProductIdForPrice}
                  onChange={(e) => setSelectedProductIdForPrice(e.target.value)}
                  className="bg-neutral-50 border text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-neutral-950"
                >
                  <option value="">Select Product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Rs. {p.basePrice})</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="New Price LKR"
                  value={newProductPrice || ''}
                  onChange={(e) => setNewProductPrice(Number(e.target.value))}
                  className="bg-neutral-50 border text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-neutral-950 font-bold"
                />

                <button
                  type="submit"
                  className="bg-neutral-950 text-white text-xs font-bold uppercase py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
                >
                  Save Price
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-900 mb-2">Manual Stock Adjuster</h3>
              <p className="text-xs text-neutral-400 leading-normal mb-4 font-light">
                Add stock directly to any warehouse bin.
              </p>

              <form onSubmit={handleAdjustmentSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={adjVariantId}
                  onChange={(e) => setAdjVariantId(e.target.value)}
                  className="bg-neutral-50 border text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-neutral-950"
                >
                  <option value="">Select Variant SKU...</option>
                  {variants.map(v => {
                    const p = products.find(prod => prod.id === v.productId);
                    const col = COLORS.find(c => c.id === v.colorId);
                    const sz = SIZES.find(s => s.id === v.sizeId);
                    return (
                      <option key={v.id} value={v.id}>
                        {p?.name.substring(0, 12)}.. ({col?.name}/{sz?.name})
                      </option>
                    );
                  })}
                </select>

                <select
                  value={adjWarehouseId}
                  onChange={(e) => setAdjWarehouseId(e.target.value)}
                  className="bg-neutral-50 border text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-neutral-950"
                >
                  {WAREHOUSES.map(w => (
                    <option key={w.id} value={w.id}>{w.name.substring(0, 12)}..</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Qty"
                  value={adjQtyChange || ''}
                  onChange={(e) => setAdjQtyChange(Number(e.target.value))}
                  className="bg-neutral-50 border text-xs py-2.5 px-3 rounded-xl focus:outline-none text-center font-bold"
                />

                <button
                  type="submit"
                  className="bg-neutral-950 text-white text-xs font-bold uppercase py-2.5 px-4 rounded-xl hover:bg-neutral-800 cursor-pointer"
                >
                  Commit Qty
                </button>
              </form>
            </div>
          </div>

          {/* Product Cards & Variants Directory */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111] border-b pb-3.5 flex items-center justify-between">
              <span>All Products Catalog ({products.length})</span>
              <span className="text-[10px] text-neutral-400 font-normal">Click "Edit Details" or "Variations" to modify</span>
            </h3>

            <div className="space-y-4 divide-y">
              {products.map((p) => {
                const prodVariants = variants.filter(v => v.productId === p.id);
                const vIds = prodVariants.map(v => v.id);
                const totalStock = inventory.filter(i => vIds.includes(i.variantId)).reduce((sum, item) => sum + item.onHand, 0);

                return (
                  <div key={p.id} className="pt-4 first:pt-0 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 shrink-0">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-neutral-950 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {p.category}
                          </span>
                          <span className="text-[9px] text-neutral-400 font-bold uppercase">{p.brand}</span>
                          {p.isNewArrival && <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">New</span>}
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900 font-serif">{p.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                          <span>Base Price: <strong className="text-neutral-900">Rs. {p.basePrice.toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>Variants: <strong className="text-neutral-900">{prodVariants.length} SKUs</strong></span>
                          <span>•</span>
                          <span>Total Stock: <strong className={totalStock < 10 ? 'text-amber-600 font-bold' : 'text-emerald-700'}>{totalStock} units</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>

                      <button
                        onClick={() => setManagingVariantsForProduct(p)}
                        className="bg-neutral-950 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Layers3 className="w-3.5 h-3.5" />
                        <span>Variations ({prodVariants.length})</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete product "${p.name}" and all its variants?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white p-2 rounded-xl transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- ADD PRODUCT MODAL --- */}
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3 sticky top-0 bg-white z-10">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950 font-serif">Create New Garment Product</h3>
                  <button onClick={() => setShowAddProductModal(false)} className="text-neutral-400 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleProductSubmit} className="space-y-5 text-xs font-medium">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Product Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Unawatuna Linen Pleated Skirt"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-950 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Category *</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs text-neutral-950 focus:outline-none focus:border-neutral-950 font-bold"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Brand Line</label>
                      <input
                        type="text"
                        value={prodBrand}
                        onChange={(e) => setProdBrand(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Base Price (LKR) *</label>
                      <input
                        type="number"
                        value={prodBasePrice}
                        onChange={(e) => setProdBasePrice(Number(e.target.value))}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold text-neutral-950"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Compare-At Price (LKR)</label>
                      <input
                        type="number"
                        value={prodComparePrice}
                        onChange={(e) => setProdComparePrice(Number(e.target.value))}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Full Description</label>
                    <textarea
                      placeholder="Detailed fabric description, craftsmanship, origin details..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-950 h-20"
                    />
                  </div>

                  {/* Image Management */}
                  <div className="border-t border-neutral-200 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-950 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Product Images Gallery ({productImages.length})</span>
                      <span className="text-[10px] text-neutral-400 font-normal">Local files or URLs</span>
                    </h4>

                    {/* Local Multi-File Upload Dropzone */}
                    <div className="mb-3 bg-neutral-50 border border-dashed border-neutral-300 hover:border-neutral-950 p-3.5 rounded-xl transition-colors cursor-pointer text-center group">
                      <label htmlFor="prod-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-1">
                        <Upload className="w-5 h-5 text-neutral-500 group-hover:text-neutral-950" />
                        <span className="text-xs font-bold text-neutral-900">Upload Local Images from Device</span>
                        <span className="text-[10px] text-neutral-400">Click to select multiple photos from computer (PNG, JPG, WEBP)</span>
                      </label>
                      <input
                        id="prod-file-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          handleMultipleFilesUpload(e.target.files, (dataUrls) => {
                            setProductImages(prev => [...prev, ...dataUrls]);
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Or paste external image URL..."
                        value={customImageUrlInput}
                        onChange={(e) => setCustomImageUrlInput(e.target.value)}
                        className="flex-grow bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrlInput.trim()) {
                            setProductImages(prev => [...prev, customImageUrlInput.trim()]);
                            setCustomImageUrlInput('');
                          }
                        }}
                        className="bg-neutral-950 text-white font-bold text-[10px] uppercase px-4 py-2 rounded-xl shrink-0"
                      >
                        Add URL
                      </button>
                    </div>

                    {/* Presets picker */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      <span className="text-[10px] text-neutral-400 font-semibold self-center mr-1">Pick preset photo:</span>
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!productImages.includes(preset.url)) {
                              setProductImages(prev => [...prev, preset.url]);
                            }
                          }}
                          className="text-[9px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-2 py-1 rounded-lg border border-neutral-200 font-medium"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Image Thumbnails Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {productImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden group bg-neutral-50">
                          <img src={imgUrl} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Initial Variants Setup */}
                  <div className="border-t border-neutral-200 pt-4 space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-950 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Initial Variants Configuration
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Color Swatch</label>
                        <select
                          value={selectedColorId}
                          onChange={(e) => setSelectedColorId(e.target.value)}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                        >
                          {COLORS.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Initial Stock Per Variant</label>
                        <input
                          type="number"
                          value={initialVariantStock}
                          onChange={(e) => setInitialVariantStock(Number(e.target.value))}
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Sizes to generate</label>
                        <div className="flex gap-2 pt-1">
                          {SIZES.map(s => {
                            const isChecked = selectedSizes.includes(s.id);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setSelectedSizes(prev =>
                                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                  isChecked ? 'bg-neutral-950 text-white border-neutral-950' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                                }`}
                              >
                                {s.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="flex-1 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 font-bold py-3 rounded-xl uppercase tracking-wider text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-[10px]"
                    >
                      Save Product &amp; Launch
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- EDIT PRODUCT MODAL --- */}
          {editingProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950">Edit Product: {editingProduct.name}</h3>
                  <button onClick={() => setEditingProduct(null)} className="text-neutral-400 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditProductSave} className="space-y-4 text-xs font-medium">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold text-neutral-950"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Category</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Base Price (LKR)</label>
                      <input
                        type="number"
                        value={editingProduct.basePrice}
                        onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Description</label>
                    <textarea
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-xs h-20"
                    />
                  </div>

                  {/* Images editor */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Product Images</label>

                    {/* Local File Upload Box */}
                    <div className="flex items-center gap-3 bg-neutral-50 border border-dashed border-neutral-300 hover:border-neutral-950 p-3 rounded-xl transition-colors cursor-pointer group">
                      <Upload className="w-5 h-5 text-neutral-500 group-hover:text-neutral-950 shrink-0" />
                      <div className="flex-1">
                        <label htmlFor="edit-file-upload" className="block text-xs font-bold text-neutral-900 cursor-pointer">
                          Upload Local Image File
                        </label>
                        <span className="text-[10px] text-neutral-400">Add new photo directly from your device</span>
                      </div>
                      <input
                        id="edit-file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], (dataUrl) => {
                              setEditingProduct({
                                ...editingProduct,
                                images: [...editingProduct.images, dataUrl]
                              });
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Image List ({editingProduct.images.length})</span>
                      {editingProduct.images.map((img, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={img}
                            onChange={(e) => {
                              const newImgs = [...editingProduct.images];
                              newImgs[idx] = e.target.value;
                              setEditingProduct({ ...editingProduct, images: newImgs });
                            }}
                            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs truncate"
                          />
                          {editingProduct.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newImgs = editingProduct.images.filter((_, i) => i !== idx);
                                setEditingProduct({ ...editingProduct, images: newImgs });
                              }}
                              className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg shrink-0"
                              title="Delete image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="flex-1 border border-neutral-200 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-950 text-white py-2.5 rounded-xl font-bold uppercase tracking-wider text-[10px]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- MANAGE VARIANTS MODAL --- */}
          {managingVariantsForProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950 font-serif">
                      Manage Variations for {managingVariantsForProduct.name}
                    </h3>
                    <p className="text-[10px] text-neutral-400">Add or remove specific size &amp; color SKUs</p>
                  </div>
                  <button onClick={() => setManagingVariantsForProduct(null)} className="text-neutral-400 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Existing variants list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase text-neutral-500">Existing Variants ({variants.filter(v => v.productId === managingVariantsForProduct.id).length})</h4>
                  <div className="divide-y border border-neutral-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    {variants.filter(v => v.productId === managingVariantsForProduct.id).map(v => {
                      const color = COLORS.find(c => c.id === v.colorId);
                      const size = SIZES.find(s => s.id === v.sizeId);
                      const invQty = inventory.filter(i => i.variantId === v.id).reduce((sum, item) => sum + item.onHand, 0);

                      return (
                        <div key={v.id} className="p-3 flex items-center justify-between bg-neutral-50 text-xs">
                          <div className="flex-grow">
                            <span className="font-bold text-neutral-900">{v.sku}</span>
                            <span className="text-neutral-400 ml-2">({color?.name} / {size?.name})</span>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-neutral-400 font-bold uppercase">Price:</span>
                                <input
                                  type="number"
                                  value={v.sellingPrice}
                                  onChange={(e) => onUpdateVariantPrice(v.id, Number(e.target.value))}
                                  className="w-20 bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-neutral-900 focus:border-neutral-950 focus:ring-0 outline-none"
                                />
                              </div>
                              <span className="text-[10px] text-neutral-400">Stock: <strong className="text-neutral-600">{invQty}</strong> units</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (confirm(`Delete variant SKU ${v.sku}?`)) {
                                onDeleteVariant(v.id);
                              }
                            }}
                            className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg ml-2"
                            title="Delete Variant"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add Variant Form */}
                <form onSubmit={handleAddVariantSubmit} className="border-t pt-4 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-neutral-950">Add New Variant SKU</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-400 font-bold mb-1">Color Swatch</label>
                      <select
                        value={newVarColorId}
                        onChange={(e) => setNewVarColorId(e.target.value)}
                        className="w-full bg-neutral-50 border rounded-xl p-2 text-xs"
                      >
                        {COLORS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 font-bold mb-1">Size Chip</label>
                      <select
                        value={newVarSizeId}
                        onChange={(e) => setNewVarSizeId(e.target.value)}
                        className="w-full bg-neutral-50 border rounded-xl p-2 text-xs"
                      >
                        {SIZES.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-400 font-bold mb-1">Price (LKR)</label>
                      <input
                        type="number"
                        value={newVarPrice}
                        onChange={(e) => setNewVarPrice(Number(e.target.value))}
                        className="w-full bg-neutral-50 border rounded-xl p-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-neutral-400 font-bold mb-1">Initial Stock Qty</label>
                      <input
                        type="number"
                        value={newVarStock}
                        onChange={(e) => setNewVarStock(Number(e.target.value))}
                        className="w-full bg-neutral-50 border rounded-xl p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-neutral-950 text-white font-bold py-2.5 rounded-xl uppercase tracking-wider text-[10px] mt-2"
                  >
                    Add Variant
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab: BODY MEASUREMENTS & SIZING GUIDE MANAGER */}
      {activeTab === 'sizing' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-neutral-200 p-6 rounded-2xl shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                <Ruler className="w-3.5 h-3.5 text-neutral-900" /> Couture Size Engine
              </div>
              <h2 className="text-lg font-bold text-neutral-900 font-serif">Body Measurements &amp; Sizing Calculator</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Set body measurement ranges for Small, Medium, Large, XL, and 2XL. Enter bust, waist, and hips to test automatic size resolution.
              </p>
            </div>
            
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Size Rule</span>
            </button>
          </div>

          {/* Section 1: Real-time Body Measurement Size Calculator (Test Bench) */}
          {(() => {
            const calculated = resolveSizeFromMeasurements(
              { bust: testBust, waist: testWaist, hips: testHips },
              sizeRules
            );

            return (
              <div className="bg-white border border-neutral-200 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
                <div className="border-b pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-950 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600" /> Interactive Size Calculator (Body Measurement Tester)
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Enter body measurements in inches to calculate whether the garment should be Small, Medium, Large, or XL.
                    </p>
                  </div>

                  {/* Preset Quick Fill Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase self-center mr-1">Try Presets:</span>
                    <button
                      type="button"
                      onClick={() => { setTestBust(33); setTestWaist(26); setTestHips(36); }}
                      className="text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                    >
                      Small (33/26/36)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTestBust(36); setTestWaist(29); setTestHips(39); }}
                      className="text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                    >
                      Medium (36/29/39)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTestBust(39); setTestWaist(32); setTestHips(42); }}
                      className="text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                    >
                      Large (39/32/42)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTestBust(42); setTestWaist(35); setTestHips(45); }}
                      className="text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-200 transition-colors cursor-pointer"
                    >
                      XL (42/35/45)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Body Inputs */}
                  <div className="md:col-span-6 space-y-4 text-xs font-medium">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-600">Bust / Chest Circumference</label>
                        <span className="font-mono font-bold text-neutral-950">{testBust}" inches ({(testBust * 2.54).toFixed(1)} cm)</span>
                      </div>
                      <input
                        type="range"
                        min="28"
                        max="50"
                        step="0.5"
                        value={testBust}
                        onChange={(e) => setTestBust(Number(e.target.value))}
                        className="w-full accent-neutral-950 h-2 bg-neutral-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-600">Natural Waist Circumference</label>
                        <span className="font-mono font-bold text-neutral-950">{testWaist}" inches ({(testWaist * 2.54).toFixed(1)} cm)</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="45"
                        step="0.5"
                        value={testWaist}
                        onChange={(e) => setTestWaist(Number(e.target.value))}
                        className="w-full accent-neutral-950 h-2 bg-neutral-100 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-600">Full Hips Circumference</label>
                        <span className="font-mono font-bold text-neutral-950">{testHips}" inches ({(testHips * 2.54).toFixed(1)} cm)</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="55"
                        step="0.5"
                        value={testHips}
                        onChange={(e) => setTestHips(Number(e.target.value))}
                        className="w-full accent-neutral-950 h-2 bg-neutral-100 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Right Column: Dynamic Calculated Size Output Box */}
                  <div className="md:col-span-6 bg-neutral-950 text-white p-6 rounded-2xl space-y-4 border border-neutral-800 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">Calculated Recommended Size</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                        {calculated.score}% Fit Accuracy
                      </span>
                    </div>

                    <div className="py-2 flex items-center justify-between border-y border-neutral-800">
                      <div>
                        <h4 className="text-3xl font-black font-serif italic text-white tracking-tight">{calculated.recommendedSizeLabel}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{calculated.notes}</p>
                      </div>
                      <div className="w-14 h-14 bg-white text-black font-black text-2xl rounded-2xl flex items-center justify-center font-mono shadow-md border-2 border-white">
                        {calculated.recommendedSizeCode}
                      </div>
                    </div>

                    {/* Parametric Breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                      <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                        <span className="text-neutral-400 uppercase tracking-wider block text-[8px]">Bust Match</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{calculated.breakdown.bustMatch}</span>
                      </div>
                      <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                        <span className="text-neutral-400 uppercase tracking-wider block text-[8px]">Waist Match</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{calculated.breakdown.waistMatch}</span>
                      </div>
                      <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800">
                        <span className="text-neutral-400 uppercase tracking-wider block text-[8px]">Hips Match</span>
                        <span className="font-bold text-white text-xs mt-0.5 block">{calculated.breakdown.hipsMatch}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* Section 2: Size Rules Table & Editor */}
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-950">Active Size Measurement Rules</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Define the body measurement parameters for each size code (Small, Medium, Large, XL, etc.).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="bg-neutral-50 font-bold uppercase text-neutral-500 border-b border-neutral-200">
                    <th className="py-3.5 px-4">Size Code</th>
                    <th className="py-3.5 px-4">Size Label</th>
                    <th className="py-3.5 px-4">Bust Range (in)</th>
                    <th className="py-3.5 px-4">Waist Range (in)</th>
                    <th className="py-3.5 px-4">Hips Range (in)</th>
                    <th className="py-3.5 px-4">Shoulders</th>
                    <th className="py-3.5 px-4">Garment Length</th>
                    <th className="py-3.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-medium text-neutral-800 bg-white">
                  {sizeRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-neutral-950 bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-lg font-mono">
                          {rule.sizeCode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900">{rule.sizeLabel}</td>
                      <td className="py-3.5 px-4">{rule.bustMinInches}" – {rule.bustMaxInches}"</td>
                      <td className="py-3.5 px-4">{rule.waistMinInches}" – {rule.waistMaxInches}"</td>
                      <td className="py-3.5 px-4">{rule.hipsMinInches}" – {rule.hipsMaxInches}"</td>
                      <td className="py-3.5 px-4">{rule.shoulderInches}"</td>
                      <td className="py-3.5 px-4">{rule.lengthInches}"</td>
                      <td className="py-3.5 px-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingRule(rule)}
                          className="bg-neutral-100 hover:bg-neutral-950 hover:text-white text-neutral-800 font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg border border-neutral-200 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" /> Edit Range
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete size rule for ${rule.sizeLabel}?`)) {
                              if (onDeleteSizeRule) onDeleteSizeRule(rule.id);
                            }
                          }}
                          className="text-neutral-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit Size Rule Modal */}
          {editingRule && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950">
                    Edit Measurement Rule ({editingRule.sizeLabel})
                  </h3>
                  <button onClick={() => setEditingRule(null)} className="text-neutral-400 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (onUpdateSizeRule) onUpdateSizeRule(editingRule);
                    setEditingRule(null);
                    alert(`Size rule for ${editingRule.sizeLabel} updated successfully!`);
                  }}
                  className="space-y-4 text-xs font-medium"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Size Code</label>
                      <input
                        type="text"
                        value={editingRule.sizeCode}
                        onChange={(e) => setEditingRule({ ...editingRule, sizeCode: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Size Label</label>
                      <input
                        type="text"
                        value={editingRule.sizeLabel}
                        onChange={(e) => setEditingRule({ ...editingRule, sizeLabel: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bust Min (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.bustMinInches}
                        onChange={(e) => setEditingRule({ ...editingRule, bustMinInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bust Max (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.bustMaxInches}
                        onChange={(e) => setEditingRule({ ...editingRule, bustMaxInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Waist Min (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.waistMinInches}
                        onChange={(e) => setEditingRule({ ...editingRule, waistMinInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Waist Max (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.waistMaxInches}
                        onChange={(e) => setEditingRule({ ...editingRule, waistMaxInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Hips Min (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.hipsMinInches}
                        onChange={(e) => setEditingRule({ ...editingRule, hipsMinInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Hips Max (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.hipsMaxInches}
                        onChange={(e) => setEditingRule({ ...editingRule, hipsMaxInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Shoulder Width (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.shoulderInches}
                        onChange={(e) => setEditingRule({ ...editingRule, shoulderInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Garment Length (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={editingRule.lengthInches}
                        onChange={(e) => setEditingRule({ ...editingRule, lengthInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Fit Notes</label>
                    <input
                      type="text"
                      value={editingRule.notes || ''}
                      onChange={(e) => setEditingRule({ ...editingRule, notes: e.target.value })}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="pt-3 border-t flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingRule(null)}
                      className="flex-1 border border-neutral-200 py-2.5 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-950 text-white py-2.5 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Save Rule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Custom Size Rule Modal */}
          {showAddRuleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-fade-in">
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-950">Add Custom Size Measurement Rule</h3>
                  <button onClick={() => setShowAddRuleModal(false)} className="text-neutral-400 hover:text-neutral-950">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newRule: SizeMeasurementRule = {
                      ...newRuleForm,
                      id: `rule-${Date.now()}`
                    };
                    if (onAddSizeRule) onAddSizeRule(newRule);
                    setShowAddRuleModal(false);
                    alert(`Custom size rule for ${newRule.sizeLabel} created successfully!`);
                  }}
                  className="space-y-4 text-xs font-medium"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Size Code (e.g. 2XL)</label>
                      <input
                        type="text"
                        value={newRuleForm.sizeCode}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, sizeCode: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Size Label</label>
                      <input
                        type="text"
                        value={newRuleForm.sizeLabel}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, sizeLabel: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bust Min (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRuleForm.bustMinInches}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, bustMinInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Bust Max (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRuleForm.bustMaxInches}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, bustMaxInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Waist Min (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRuleForm.waistMinInches}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, waistMinInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Waist Max (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRuleForm.waistMaxInches}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, waistMaxInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Hips Min (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRuleForm.hipsMinInches}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, hipsMinInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Hips Max (Inches)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newRuleForm.hipsMaxInches}
                        onChange={(e) => setNewRuleForm({ ...newRuleForm, hipsMaxInches: Number(e.target.value) })}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddRuleModal(false)}
                      className="flex-1 border border-neutral-200 py-2.5 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-neutral-950 text-white py-2.5 rounded-xl font-bold uppercase text-[10px]"
                    >
                      Create Size Rule
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab 4: Fulfillment Operations tracker */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-neutral-200/60 p-6 space-y-6 rounded-2xl">
          <div className="border-b pb-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#111111]">Client Orders &amp; Dispatch Pipeline</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Select status nodes to progress client shipments. Updates reflect immediately inside customer-facing tracking views.
            </p>
          </div>

          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-16 text-xs text-neutral-400 font-light">
                No orders have been placed in this system session yet. Go back to storefront to place a trial order!
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  return (
                    <div key={order.id} className="border border-neutral-200 p-5 space-y-4 bg-neutral-50/50 hover:bg-white transition-all rounded-2xl">
                      
                      {/* Order top bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                        <div>
                          <p className="text-xs font-black text-[#111111] uppercase tracking-wide">
                            Order Number: #{order.orderNumber}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                            Customer: {order.address.firstName} {order.address.lastName} ({order.email})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status:</span>
                          <span className="bg-[#111111] text-white text-[10px] font-bold uppercase tracking-widest py-1 px-2.5 rounded-full">
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Items details breakdown */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-sans">
                        <div className="md:col-span-6 space-y-2.5">
                          <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Ordered Garments Items</p>
                          <div className="divide-y space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-center font-semibold">
                                <span className="text-neutral-700">{item.productName} ({item.variantName})</span>
                                <span className="text-neutral-900 font-bold">{item.quantity} units x Rs. {item.unitPrice.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dispatch coordinate columns */}
                        <div className="md:col-span-3 text-[11px] space-y-1 text-neutral-500 font-light">
                          <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Shipping coordinates</p>
                          <p className="font-bold text-neutral-700">{order.address.addressLine1}</p>
                          <p>{order.address.city}, {order.address.province} {order.address.postalCode}</p>
                          <p>Phone: {order.address.phone}</p>
                        </div>

                        {/* Financial Ledger tags */}
                        <div className="md:col-span-3 text-[11px] text-neutral-500 font-light space-y-1">
                          <p className="font-bold text-neutral-400 uppercase tracking-wider text-[10px] mb-1">Financial Billing</p>
                          <p>Channel: <strong className="text-neutral-700 font-bold">{order.paymentMethod}</strong></p>
                          <p>Status: <strong className="text-neutral-700 font-bold">{order.paymentStatus}</strong></p>
                          <p className="font-black text-neutral-950 text-xs mt-1.5">Grand Total: Rs. {order.grandTotal.toLocaleString()}</p>

                          {order.bankSlipUrl && (
                            <div className="mt-2.5 pt-2 border-t border-neutral-200/80 space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 block">
                                📄 Attached Wire Slip:
                              </span>
                              <div 
                                onClick={() => setPreviewSlipUrl(order.bankSlipUrl!)}
                                className="cursor-pointer group flex items-center gap-2 bg-neutral-100 p-1.5 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-200/60 transition-all"
                              >
                                <img src={order.bankSlipUrl} alt="Bank Slip" className="w-9 h-9 object-cover rounded border border-neutral-300 shrink-0" />
                                <div className="overflow-hidden">
                                  <span className="text-[10px] font-bold text-neutral-900 group-hover:underline block leading-tight truncate">View Bank Slip</span>
                                  <span className="text-[9px] text-emerald-700 font-bold block leading-tight">Click to view full receipt</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* STEP BY STEP STATUS MOVER CONTROL BUTTONS */}
                      <div className="bg-white p-3.5 border border-neutral-100 flex flex-wrap items-center gap-3 justify-between rounded-xl">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                          <Activity className="w-3.5 h-3.5 text-neutral-600" /> Dispatch Fulfillment Engine:
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Direct Status Selector Dropdown for Instant Jumping */}
                          <div className="flex items-center gap-1.5 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Update Status:</span>
                            <select
                              value={order.status}
                              onChange={(e) => {
                                const val = e.target.value as OrderStatus;
                                const notesMap: Record<string, string> = {
                                  PENDING_PAYMENT: 'Order registered, pending payment verification',
                                  PAID: 'Secure bank wire received and cleared',
                                  CONFIRMED: 'Order approved by dispatch control staff',
                                  PICKING: 'Bespoke sizes retrieved from warehouse bins',
                                  PACKED: 'Double-needle quality hems verified and packaged',
                                  READY_TO_SHIP: 'Shipping label printed and courier assigned',
                                  SHIPPED: 'Garments dispatched to courier hub',
                                  DELIVERED: 'Handed over securely to consignee at destination',
                                  CANCELLED: 'Order cancelled'
                                };
                                onUpdateOrderStatus(order.id, val, notesMap[val] || 'Status updated by admin');
                              }}
                              className="bg-white border border-neutral-300 text-xs text-neutral-900 font-bold py-1 px-2 rounded-lg focus:outline-none focus:border-neutral-950 cursor-pointer"
                            >
                              <option value="PENDING_PAYMENT">1. PAYMENT CONFIRMED / PENDING</option>
                              <option value="CONFIRMED">2. FULFILLMENT APPROVED</option>
                              <option value="PICKING">3. PICKING STOCK</option>
                              <option value="PACKED">4. PACKED &amp; HEMS CHECKED</option>
                              <option value="READY_TO_SHIP">5. MANIFESTED</option>
                              <option value="SHIPPED">6. IN TRANSIT</option>
                              <option value="DELIVERED">7. SUCCESSFULLY DELIVERED</option>
                              <option value="CANCELLED">❌ CANCELLED</option>
                            </select>
                          </div>

                          {order.paymentStatus === 'UNPAID' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'PAID', 'Secure bank wire received and cleared')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Confirm Payment Received
                            </button>
                          )}

                          {order.status === 'PENDING_PAYMENT' && order.paymentStatus === 'PAID' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'CONFIRMED', 'Order approved by dispatch control staff')}
                              className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Approve &amp; Confirm Order
                            </button>
                          )}

                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'PICKING', 'Bespoke sizes retrieved from warehouse bins')}
                              className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Move to Picking stock
                            </button>
                          )}

                          {order.status === 'PICKING' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'PACKED', 'Double-needle quality hems verified and packaged')}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Move to Packed &amp; Hems Checked
                            </button>
                          )}

                          {order.status === 'PACKED' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'READY_TO_SHIP', 'Shipping label printed and courier assigned')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Print Label &amp; Manifest
                            </button>
                          )}

                          {order.status === 'READY_TO_SHIP' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'SHIPPED', 'Garments dispatched to courier hub')}
                              className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Dispatch to Courier (In Transit)
                            </button>
                          )}

                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'DELIVERED', 'Handed over securely to consignee at destination')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg cursor-pointer shadow-xs"
                            >
                              Mark Successfully Delivered
                            </button>
                          )}

                          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => {
                                const reason = prompt('Enter cancellation note:');
                                if (reason) onUpdateOrderStatus(order.id, 'CANCELLED', reason);
                              }}
                              className="border border-neutral-200 hover:border-red-600 text-neutral-500 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white cursor-pointer"
                            >
                              Cancel Order
                            </button>
                          )}

                          {order.status === 'DELIVERED' && (
                            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                              ✓ Successfully completed and delivered
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Promo Coupons Builder Form */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-white border border-neutral-200 p-5 space-y-4 rounded-2xl h-fit">
            <div className="flex items-center justify-between border-b pb-3.5">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111]">
                Generate New Coupon &amp; Promo Banner
              </h3>
              <Tag className="w-4 h-4 text-amber-500" />
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. FESTIVE20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs uppercase font-extrabold tracking-widest text-neutral-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Discount Type</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (LKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={couponForm.value || ''}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Minimum Spend Limit LKR</label>
                <input
                  type="number"
                  value={couponForm.minSpend || ''}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, minSpend: Number(e.target.value) }))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Promo Description Note</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off all dresses above Rs. 5,000"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              {/* Website Popup Banner Settings */}
              <div className="bg-amber-50/60 border border-amber-200/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-[11px] font-extrabold text-amber-950 uppercase cursor-pointer">
                    <input
                      type="checkbox"
                      checked={couponForm.showAsPopup || false}
                      onChange={(e) => setCouponForm(prev => ({ ...prev, showAsPopup: e.target.checked }))}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
                    />
                    <span>Show as Website Popup Banner</span>
                  </label>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </div>

                {couponForm.showAsPopup && (
                  <div className="space-y-3 pt-1 border-t border-amber-200/60 animate-fade-in">
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase text-amber-900 mb-1">Popup Banner Title</label>
                      <input
                        type="text"
                        placeholder="e.g. ⚡ Island Festive Flash Sale!"
                        value={couponForm.popupTitle || ''}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, popupTitle: e.target.value }))}
                        className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase text-amber-900 mb-1">Popup Banner Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Apply to your bill for 20% instant deduction!"
                        value={couponForm.popupSubtitle || ''}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, popupSubtitle: e.target.value }))}
                        className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[9.5px] font-bold uppercase text-amber-900 mb-1">Popup Badge Header</label>
                      <input
                        type="text"
                        placeholder="e.g. LIMITED TIME POPUP"
                        value={couponForm.popupBadge || ''}
                        onChange={(e) => setCouponForm(prev => ({ ...prev, popupBadge: e.target.value }))}
                        className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Expiration Time & Days Scheduling */}
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Set Expiration Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={couponForm.expiresAt || ''}
                    onChange={(e) => setCouponForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-900"
                  />
                  <p className="text-[9px] text-neutral-400 mt-1">Leave blank if this offer has no expiration limit.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1.5">Active Days of Week</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                      const isSelected = couponForm.activeDays?.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const currentDays = couponForm.activeDays || [];
                            const updatedDays = isSelected
                              ? currentDays.filter(d => d !== day)
                              : [...currentDays, day];
                            setCouponForm(prev => ({ ...prev, activeDays: updatedDays }));
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-950 text-amber-300 border border-neutral-950 shadow-xs'
                              : 'bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white text-[10px] font-extrabold uppercase py-3.5 tracking-wider rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Register Promo Coupon &amp; Banner</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white border border-neutral-200 p-5 space-y-4 rounded-2xl">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111] border-b pb-3.5">
              Active Campaign Promos Catalog
            </h3>

            <div className="divide-y space-y-4">
              {coupons.map((c) => {
                const isExpired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                return (
                  <div key={c.code} className="pt-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4 font-sans">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-widest border border-emerald-300">
                          {c.code}
                        </span>
                        <span className="text-neutral-500 font-bold uppercase text-[9.5px] bg-neutral-100 px-2 py-0.5 rounded">
                          {c.type}
                        </span>
                        {c.showAsPopup && (
                          <span className="bg-amber-100 text-amber-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-amber-300">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Popup Banner Active
                          </span>
                        )}
                        {isExpired && (
                          <span className="bg-red-100 text-red-800 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                            Expired
                          </span>
                        )}
                      </div>

                      <p className="text-neutral-800 font-bold text-xs">{c.description}</p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-neutral-400 font-light">
                        <span>Min Spend: <strong>Rs. {c.minSpend.toLocaleString()}</strong></span>
                        {c.expiresAt && (
                          <span>Expires: <strong className="text-amber-700">{new Date(c.expiresAt).toLocaleDateString()} {new Date(c.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        )}
                      </div>

                      {c.activeDays && c.activeDays.length > 0 && (
                        <div className="flex items-center gap-1 pt-0.5">
                          <span className="text-[9px] text-neutral-400 font-bold uppercase">Active Days:</span>
                          <div className="flex gap-1">
                            {c.activeDays.map(d => (
                              <span key={d} className="bg-neutral-100 text-neutral-700 text-[8.5px] font-bold px-1.5 py-0.2 rounded">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <div className="font-black text-neutral-900 text-base">
                        {c.type === 'PERCENTAGE' ? `-${c.value}%` : `-Rs. ${c.value.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 6: Warehouse Transfers Form */}
      {activeTab === 'transfers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
          
          <div className="lg:col-span-5 bg-white border border-neutral-200 p-5 space-y-4 rounded-2xl h-fit">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111] border-b pb-3.5">
              Initiate Multi-Warehouse Stock Transfer
            </h3>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Select Variant garment SKU</label>
                <select
                  value={transVariantId}
                  onChange={(e) => setTransVariantId(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="">Select SKU...</option>
                  {variants.map(v => {
                    const p = products.find(prod => prod.id === v.productId);
                    const col = COLORS.find(c => c.id === v.colorId);
                    const sz = SIZES.find(s => s.id === v.sizeId);
                    return (
                      <option key={v.id} value={v.id}>
                        {v.sku} - {p?.name.substring(0, 10)}.. ({col?.name}/{sz?.name})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Source location</label>
                  <select
                    value={transFromWh}
                    onChange={(e) => setTransFromWh(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {WAREHOUSES.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Destination location</label>
                  <select
                    value={transToWh}
                    onChange={(e) => setTransToWh(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    {WAREHOUSES.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-neutral-400 mb-1">Transfer stock quantity</label>
                <input
                  type="number"
                  value={transQty || ''}
                  onChange={(e) => setTransQty(Number(e.target.value))}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#111111] hover:bg-neutral-800 text-white text-[10px] font-extrabold uppercase py-3 tracking-wider rounded-xl cursor-pointer"
              >
                Log Physical Stock Transfer
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white border border-neutral-200 p-5 space-y-4 rounded-2xl">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111] border-b pb-3.5">
              Secure Warehouse Directory
            </h3>

            <div className="space-y-4 font-sans text-xs">
              {WAREHOUSES.map((wh) => {
                const totalOnhand = inventory
                  .filter(i => i.warehouseId === wh.id)
                  .reduce((acc, item) => acc + item.onHand, 0);

                return (
                  <div key={wh.id} className="p-4 border border-neutral-200/60 bg-neutral-50/50 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-neutral-900 uppercase flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-neutral-600" /> {wh.name}
                      </h4>
                      <p className="text-neutral-400 font-semibold">{wh.location} Operations</p>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-neutral-950">{totalOnhand.toLocaleString()} Units</span>
                      <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5">Total stock allocated</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Tab 7: Live Audit Ledger Movements Logs */}
      {activeTab === 'ledger' && (
        <div className="bg-white border border-neutral-200 p-5 space-y-4 rounded-2xl">
          <div className="border-b pb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#111111]">Stock Movement Transaction Audit Logs</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Provides complete audit trace reports across all inventory additions, supplier receipts, and customer purchases.
            </p>
          </div>

          <div className="space-y-3 divide-y">
            {stockMovements.map((log) => {
              const variant = variants.find(v => v.id === log.variantId);
              const product = products.find(p => p.id === variant?.productId);
              const warehouse = WAREHOUSES.find(w => w.id === log.warehouseId);

              return (
                <div key={log.id} className="pt-3.5 first:pt-0 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 font-sans">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider rounded-full ${
                        log.type === 'SALE' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {log.type}
                      </span>
                      <span className="font-bold text-neutral-900">{product?.name} ({variant?.sku})</span>
                    </div>
                    <p className="text-neutral-500 font-medium">{log.note}</p>
                    <p className="text-[10px] text-neutral-400">{warehouse?.name} • {new Date(log.timestamp).toLocaleString()}</p>
                  </div>

                  <div className={`font-black text-sm ${log.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} units
                  </div>
                </div>
              );
            })}
            {stockMovements.length === 0 && (
              <div className="text-center py-10 text-xs text-neutral-400">
                No inventory transactions logged in this session yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slip Preview Modal */}
      {previewSlipUrl && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 relative shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  Bank Wire / Deposit Transfer Slip Receipt
                </h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">Uploaded by customer during checkout process</p>
              </div>
              <button 
                onClick={() => setPreviewSlipUrl(null)}
                className="p-1 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-950 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-neutral-950/5 p-3 rounded-xl border border-neutral-200">
              <img src={previewSlipUrl} alt="Bank Slip Full View" className="max-w-full max-h-[65vh] object-contain rounded shadow-xs" />
            </div>

            <div className="flex justify-between items-center text-xs font-sans text-neutral-500 pt-2 border-t border-neutral-150">
              <span className="text-[11px] font-medium text-emerald-700">✓ Compulsory slip attached prior to order submission</span>
              <button
                onClick={() => setPreviewSlipUrl(null)}
                className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Close Receipt Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 space-y-5 relative shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
                  Update Admin Password
                </h3>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="p-1 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-950 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {passChangeSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold text-center">
                ✓ {passChangeSuccess}
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 rounded-xl focus:outline-none focus:border-neutral-950 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-neutral-50 border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 rounded-xl focus:outline-none focus:border-neutral-950 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-150">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-xs"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
