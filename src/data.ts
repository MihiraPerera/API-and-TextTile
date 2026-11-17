import { Color, Size, Warehouse, Category, Product, ProductVariant, InventoryItem, Coupon, SizeMeasurementRule } from './types';

export const COLORS: Color[] = [
  { id: 'col-black', name: 'Charcoal Black', hex: '#111111' },
  { id: 'col-white', name: 'Alabaster White', hex: '#FFFFFF' },
  { id: 'col-beige', name: 'Warm Sand', hex: '#E6DFD3' },
  { id: 'col-rose', name: 'Rose Dust', hex: '#D4A5A5' },
  { id: 'col-sage', name: 'Sage Moss', hex: '#8A9A86' }
];

export const SIZES: Size[] = [
  { id: 'sz-s', name: 'S', displayOrder: 1 },
  { id: 'sz-m', name: 'M', displayOrder: 2 },
  { id: 'sz-l', name: 'L', displayOrder: 3 },
  { id: 'sz-xl', name: 'XL', displayOrder: 4 }
];

export const WAREHOUSES: Warehouse[] = [
  { id: 'wh-main', name: 'Central Distribution Center', location: 'Colombo HQ' },
  { id: 'wh-store-colombo', name: 'Colombo flagship Store', location: 'Galle Road' },
  { id: 'wh-store-kandy', name: 'Kandy Premium Store', location: 'Kandy City Center' }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-skirt',
    name: 'Skirts',
    description: 'Flowing sarong wraps, pleated satin midis, and structured skirts.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-blouse',
    name: 'Blouse',
    description: 'Sheer organza, batik resort shirts, and draped silk blouses.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-croptop',
    name: 'Crop top',
    description: 'Bespoke ribbed crop tops, corseted silhouettes, and knit crops.',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-shorts',
    name: 'Shorts',
    description: 'Pleated linen shorts, high-waisted resort shorts, and sartorial fits.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-pants',
    name: 'Pants',
    description: 'French flax linen wide-leg trousers, tailored pants, and slacks.',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'cat-dress',
    name: 'Dress',
    description: 'Couture sari drape dresses, silk slip dresses, and kaftans.',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-satin-dress',
    name: 'Sigiriya Silk Sari-Inspired Drape Dress',
    slug: 'sigiriya-silk-sari-inspired-drape-dress',
    brand: 'Ceylon Couture',
    description: 'A modern homage to traditional Sri Lankan heritage. A beautifully unstructured bias-cut luxury dress featuring a high-neck asymmetrical sash drape reminiscent of a Kandyan sari. Crafted from double-weight mulberry silk satin for a gorgeous, fluid drape that looks breathtaking during island sunsets.',
    shortDescription: 'Asymmetric bias-cut mulberry silk sari-inspired drape dress.',
    category: 'Dress',
    gender: 'Women',
    material: '100% Pure Mulberry Silk',
    fit: 'Asymmetric bias drape',
    careInstructions: 'Dry clean recommended. Hand wash cold with silk detergent, line dry in shade.',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 184,
    isNewArrival: true,
    isBestSeller: true,
    isSale: false,
    basePrice: 12500,
    compareAtPrice: 15000
  },
  {
    id: 'prod-pleated-dress',
    name: 'Bentota Handloom Kaftan Dress',
    slug: 'bentota-handloom-kaftan-dress',
    brand: 'Ceylon Studio',
    description: 'Crafted by master weavers in the coastal town of Bentota, Sri Lanka. This luxurious resort kaftan dress features custom woven indigo pinstripes, an elegant deep v-neckline, side splits for fluid movement, and an adjustable waist drawcord. Unlined and exceptionally breathable.',
    shortDescription: 'Hand-loomed organic cotton kaftan dress with custom pinstripes.',
    category: 'Dress',
    gender: 'Women',
    material: '100% Hand-loomed Organic Cotton',
    fit: 'Relaxed resort kaftan drape',
    careInstructions: 'Gentle machine wash cold inside out, hang to dry. Medium steam iron.',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 96,
    isNewArrival: true,
    isBestSeller: false,
    isSale: false,
    basePrice: 9500
  },
  {
    id: 'prod-organza-blouse',
    name: 'Hikkaduwa Indigo Batik Resort Blouse',
    slug: 'hikkaduwa-indigo-batik-resort-blouse',
    brand: 'Ceylon Couture',
    description: 'Featuring individual hand-cracked organic indigo dye patterns created by veteran batik artisans in Hikkaduwa, Sri Lanka. Tailored with a modern Cuban camp collar, real coconut shell buttons, and a comfortable relaxed silhouette. Each blouse is a completely unique wearable artwork.',
    shortDescription: 'Camp-collar resort blouse with hand-cracked indigo batik dye patterns.',
    category: 'Blouse',
    gender: 'Women',
    material: '100% Fine Mercerized Cotton Batik',
    fit: 'Relaxed camp collar regular fit',
    careInstructions: 'Dry clean only. Cool iron on reverse using a press cloth.',
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewCount: 65,
    isNewArrival: true,
    isBestSeller: true,
    isSale: false,
    basePrice: 6800,
    compareAtPrice: 8500
  },
  {
    id: 'prod-cashmere-crop',
    name: 'Ceylon Tea-Trails Silk Ribbed Crop Top',
    slug: 'ceylon-tea-trails-silk-ribbed-crop-top',
    brand: 'Ceylon Knitwear',
    description: 'Spun from ultra-soft silk blend rib-knit. Features a sleek high neck, tailored arm cutouts, and a flattering cropped waistband designed for high-rise skirts or tailored pants.',
    shortDescription: 'Premium fine rib-knit silk cropped top.',
    category: 'Crop top',
    gender: 'Women',
    material: '70% Mulberry Silk, 30% Fine Cashmere',
    fit: 'Tailored fitted crop silhouette',
    careInstructions: 'Hand wash cold, lay flat to dry on a soft towel. Do not wring.',
    images: [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviewCount: 42,
    isNewArrival: false,
    isBestSeller: true,
    isSale: false,
    basePrice: 5400,
    compareAtPrice: 6800
  },
  {
    id: 'prod-satin-skirt',
    name: 'Unawatuna Golden Hour Sarong Skirt',
    slug: 'unawatuna-golden-hour-sarong-skirt',
    brand: 'Ceylon Studio',
    description: 'Capturing the liquid gold of Unawatuna beaches at dusk. This beautiful draped sarong midi skirt features a high-rise waist, an elegant side-tie closure, and subtle knife pleats that catch the light beautifully. Fully lined with lightweight silk-blend fabric.',
    shortDescription: 'Liquid-shine draped sarong wrap skirt with elegant side-tie.',
    category: 'Skirts',
    gender: 'Women',
    material: '92% Heavy Silk Satin, 8% Elastane',
    fit: 'High-waisted draped sarong wrap',
    careInstructions: 'Machine wash cold in a delicate laundry bag, hang dry. Do not iron pleats.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 78,
    isNewArrival: false,
    isBestSeller: true,
    isSale: true,
    basePrice: 5800,
    compareAtPrice: 7200
  },
  {
    id: 'prod-linen-trousers',
    name: 'Galle Fort Linen Tailored Pants',
    slug: 'galle-fort-linen-tailored-pants',
    brand: 'Ceylon Studio',
    description: 'Sartorial luxury designed for warm tropical weather. Impeccably cut from heavy-weight French flax linen, these pants feature an elegant high-rise waist, relaxed wide-leg profile, adjustable side button tabs, and double-pleated front detailing.',
    shortDescription: 'High-rise pleated wide-leg French flax linen pants.',
    category: 'Pants',
    gender: 'Women',
    material: '100% Organic French Flax Linen',
    fit: 'High-waisted wide-leg sartorial fit',
    careInstructions: 'Dry clean recommended or gentle hand wash, hang dry while damp. Steam iron.',
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewCount: 112,
    isNewArrival: false,
    isBestSeller: false,
    isSale: false,
    basePrice: 8200
  },
  {
    id: 'prod-linen-shorts',
    name: 'Colombo Sartorial Linen Shorts',
    slug: 'colombo-sartorial-linen-shorts',
    brand: 'Ceylon Outerwear',
    description: 'High-waisted tailored shorts crafted from breathable linen. Features front pleats, deep side pockets, and an adjustable waist belt for a sharp resort aesthetic.',
    shortDescription: 'High-waisted pleated linen resort shorts.',
    category: 'Shorts',
    gender: 'Women',
    material: '100% Belgian Linen',
    fit: 'High-waisted tailored pleated shorts',
    careInstructions: 'Gentle hand wash, steam iron.',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 51,
    isNewArrival: true,
    isBestSeller: false,
    isSale: true,
    basePrice: 4800,
    compareAtPrice: 6200
  }
];

// Generate comprehensive variants for all products, colors, and sizes
export const INITIAL_VARIANTS: ProductVariant[] = [];
export const INITIAL_INVENTORY: InventoryItem[] = [];

let variantCounter = 1;
let invCounter = 1;

PRODUCTS.forEach(p => {
  let productColors = COLORS;
  if (p.id === 'prod-satin-dress') {
    productColors = COLORS.filter(c => ['col-black', 'col-white', 'col-rose'].includes(c.id));
  } else if (p.id === 'prod-pleated-dress') {
    productColors = COLORS.filter(c => ['col-white', 'col-beige', 'col-sage'].includes(c.id));
  }

  productColors.forEach(color => {
    SIZES.forEach(size => {
      const vId = `var-${variantCounter++}`;
      const sellingPrice = p.basePrice;
      const compareAtPrice = p.compareAtPrice;
      const costPrice = Math.round(sellingPrice * 0.4);
      
      INITIAL_VARIANTS.push({
        id: vId,
        productId: p.id,
        sku: `${p.brand.substring(0, 3).toUpperCase()}-${p.category.substring(0, 2).toUpperCase()}-${color.name.substring(0, 2).toUpperCase()}-${size.name}`,
        colorId: color.id,
        sizeId: size.id,
        sellingPrice,
        compareAtPrice,
        costPrice,
        weightGrams: p.category === 'Jackets' ? 1200 : p.category === 'Hoodies' ? 950 : 220
      });

      // Allocate inventory across warehouses
      WAREHOUSES.forEach(wh => {
        let stockQty = 0;
        if (wh.id === 'wh-main') {
          stockQty = Math.floor(Math.random() * 40) + 20; // 20 - 60
        } else {
          stockQty = Math.floor(Math.random() * 10) + 2; // 2 - 12
        }

        if (p.id === 'prod-trench-coat' && size.id === 'sz-xl' && wh.id !== 'wh-main') {
          stockQty = 0;
        }

        INITIAL_INVENTORY.push({
          id: `inv-${invCounter++}`,
          variantId: vId,
          warehouseId: wh.id,
          onHand: stockQty,
          reserved: 0,
          damaged: 0,
          reorderLevel: wh.id === 'wh-main' ? 10 : 2
        });
      });
    });
  });
});

export const INITIAL_COUPONS: Coupon[] = [
  { 
    code: 'FESTIVE20', 
    type: 'PERCENTAGE', 
    value: 20, 
    minSpend: 5000, 
    isActive: true, 
    description: '20% off sartorial collections above Rs.5,000',
    showAsPopup: true,
    popupTitle: '⚡ Island Festive Flash Sale!',
    popupSubtitle: 'Enjoy 20% instant deduction on your total couture bill on orders above Rs. 5,000.',
    popupBadge: 'LIMITED TIME EXCLUSIVE',
    popupBgTheme: 'gold',
    expiresAt: new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 16),
    activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minSpend: 2000, isActive: true, description: '10% off your first luxury order, minimum spend Rs.2,000' },
  { code: 'SARTORIAL3000', type: 'FIXED', value: 3000, minSpend: 15000, isActive: true, description: 'Save Rs.3,000 on premium fits above Rs.15,000' },
  { code: 'FREESHIP', type: 'PERCENTAGE', value: 0, minSpend: 5000, isActive: true, description: 'Free delivery on premium selections above Rs.5,000 (Applied automatically)' }
];

export const INITIAL_SIZE_RULES: SizeMeasurementRule[] = [
  {
    id: 'rule-s',
    sizeLabel: 'Small (S)',
    sizeCode: 'S',
    bustMinInches: 32.0,
    bustMaxInches: 34.0,
    waistMinInches: 25.0,
    waistMaxInches: 27.0,
    hipsMinInches: 35.0,
    hipsMaxInches: 37.0,
    shoulderInches: 14.5,
    lengthInches: 38.0,
    notes: 'Ideal for bust 32"-34", waist 25"-27", hips 35"-37". Petite & slim tailoring.'
  },
  {
    id: 'rule-m',
    sizeLabel: 'Medium (M)',
    sizeCode: 'M',
    bustMinInches: 35.0,
    bustMaxInches: 37.0,
    waistMinInches: 28.0,
    waistMaxInches: 30.0,
    hipsMinInches: 38.0,
    hipsMaxInches: 40.0,
    shoulderInches: 15.0,
    lengthInches: 39.5,
    notes: 'Ideal for bust 35"-37", waist 28"-30", hips 38"-40". Regular standard couture fit.'
  },
  {
    id: 'rule-l',
    sizeLabel: 'Large (L)',
    sizeCode: 'L',
    bustMinInches: 38.0,
    bustMaxInches: 40.0,
    waistMinInches: 31.0,
    waistMaxInches: 33.0,
    hipsMinInches: 41.0,
    hipsMaxInches: 43.0,
    shoulderInches: 15.5,
    lengthInches: 41.0,
    notes: 'Ideal for bust 38"-40", waist 31"-33", hips 41"-43". Comfortable relaxed drape.'
  },
  {
    id: 'rule-xl',
    sizeLabel: 'Extra Large (XL)',
    sizeCode: 'XL',
    bustMinInches: 41.0,
    bustMaxInches: 44.0,
    waistMinInches: 34.0,
    waistMaxInches: 37.0,
    hipsMinInches: 44.0,
    hipsMaxInches: 47.0,
    shoulderInches: 16.2,
    lengthInches: 42.5,
    notes: 'Ideal for bust 41"-44", waist 34"-37", hips 44"-47". Generous couture silhouette.'
  }
];

