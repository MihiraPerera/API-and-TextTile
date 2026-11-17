/**
 * Wearora E-Commerce Domain Types
 */

export interface Color {
  id: string;
  name: string;
  hex: string;
}

export interface Size {
  id: string;
  name: string;
  displayOrder: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  shortDescription: string;
  category: string;
  gender: 'Men' | 'Women' | 'Kids' | 'Unisex';
  material: string;
  fit: string;
  careInstructions: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isSale: boolean;
  basePrice: number;
  compareAtPrice?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  colorId: string;
  sizeId: string;
  sellingPrice: number;
  compareAtPrice?: number;
  costPrice: number;
  weightGrams: number;
}

export interface InventoryItem {
  id: string;
  variantId: string;
  warehouseId: string;
  onHand: number;
  reserved: number;
  damaged: number;
  reorderLevel: number;
}

export interface CartItem {
  id: string; // unique ID for this cart row (combination of variant + custom options if any)
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CONFIRMED'
  | 'PICKING'
  | 'PACKED'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  variantName: string; // e.g. "Crimson / M"
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone: string;
  status: OrderStatus;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  bankSlipUrl?: string;
  address: OrderAddress;
  items: OrderItem[];
  statusHistory: { status: OrderStatus; timestamp: string; note: string }[];
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  isActive: boolean;
  description: string;
  showAsPopup?: boolean;
  popupTitle?: string;
  popupSubtitle?: string;
  popupBadge?: string;
  popupBgTheme?: 'gold' | 'dark' | 'rose' | 'emerald';
  expiresAt?: string;
  activeDays?: string[];
}

export interface StockMovement {
  id: string;
  variantId: string;
  warehouseId: string;
  type: 'OPENING' | 'SALE' | 'SALE_CANCEL' | 'CUSTOMER_RETURN' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';
  quantityChange: number; // positive or negative
  note: string;
  timestamp: string;
}

export interface SizeMeasurementRule {
  id: string;
  sizeLabel: string; // e.g., 'Small (S)', 'Medium (M)', 'Large (L)', 'XL'
  sizeCode: string; // e.g., 'S', 'M', 'L', 'XL'
  bustMinInches: number;
  bustMaxInches: number;
  waistMinInches: number;
  waistMaxInches: number;
  hipsMinInches: number;
  hipsMaxInches: number;
  shoulderInches: number;
  lengthInches: number;
  notes?: string;
}

