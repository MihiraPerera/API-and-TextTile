import React, { useState, useMemo } from 'react';
import { ChevronRight, Heart, Share2, Info, ArrowLeft, Plus, Minus, MapPin, CheckCircle, HelpCircle, X, Scale, Ruler } from 'lucide-react';
import { Product, ProductVariant, Color, Size, InventoryItem, Warehouse, SizeMeasurementRule } from '../types';
import { COLORS, SIZES, WAREHOUSES } from '../data';
import { resolveSizeFromMeasurements } from '../utils/sizeResolver';

interface CustomerProductDetailProps {
  product: Product;
  variants: ProductVariant[];
  inventory: InventoryItem[];
  sizeRules?: SizeMeasurementRule[];
  onAddToCart: (variantId: string, quantity: number) => void;
  onBuyNow: (variantId: string, quantity: number) => void;
  onBackToCatalog: () => void;
}

export default function CustomerProductDetail({
  product,
  variants,
  inventory,
  sizeRules = [],
  onAddToCart,
  onBuyNow,
  onBackToCatalog
}: CustomerProductDetailProps) {
  // Select first available variant's color and size as defaults
  const productVariants = useMemo(() => {
    return variants.filter(v => v.productId === product.id);
  }, [variants, product.id]);

  const availableColorIds = useMemo(() => {
    return Array.from(new Set(productVariants.map(v => v.colorId)));
  }, [productVariants]);

  const availableSizeIds = useMemo(() => {
    return Array.from(new Set(productVariants.map(v => v.sizeId)));
  }, [productVariants]);

  const [selectedColorId, setSelectedColorId] = useState<string>(availableColorIds[0] || '');
  const [selectedSizeId, setSelectedSizeId] = useState<string>(availableSizeIds[0] || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Customer Body Measurement Calculator state inside size guide modal
  const [custBust, setCustBust] = useState<number>(36);
  const [custWaist, setCustWaist] = useState<number>(29);
  const [custHips, setCustHips] = useState<number>(39);

  // Find currently selected variant based on selected color + size
  const selectedVariant = useMemo(() => {
    return productVariants.find(
      v => v.colorId === selectedColorId && v.sizeId === selectedSizeId
    );
  }, [productVariants, selectedColorId, selectedSizeId]);

  // Read inventory levels dynamically for the selected variant across warehouses
  const warehouseInventory = useMemo(() => {
    if (!selectedVariant) return [];
    return WAREHOUSES.map(wh => {
      const inv = inventory.find(
        i => i.variantId === selectedVariant.id && i.warehouseId === wh.id
      );
      return {
        warehouse: wh,
        qty: inv ? inv.onHand : 0,
        lowStock: inv ? inv.onHand <= inv.reorderLevel : true
      };
    });
  }, [inventory, selectedVariant]);

  const totalStockAvailable = useMemo(() => {
    return warehouseInventory.reduce((acc, item) => acc + item.qty, 0);
  }, [warehouseInventory]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart(selectedVariant.id, quantity);
    }
  };

  const handleBuyNow = () => {
    if (selectedVariant) {
      onBuyNow(selectedVariant.id, quantity);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      
      {/* Breadcrumb Navigation Row */}
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 mb-10 select-none">
        <button onClick={onBackToCatalog} className="hover:text-neutral-950 transition-colors flex items-center gap-1.5 cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Catalog
        </button>
        <ChevronRight className="w-3 h-3 text-neutral-300" />
        <span>{product.category}</span>
        <ChevronRight className="w-3 h-3 text-neutral-300" />
        <span className="text-neutral-900 font-bold truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Side: Photo Gallery Layout */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] bg-neutral-50 overflow-hidden border border-neutral-150 relative rounded-2xl">
            <img
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-all duration-300 grayscale-[5%]"
            />
          </div>

          {/* Alternate Thumbnail Previews */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-[3/4] bg-neutral-50 overflow-hidden border rounded-xl transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-neutral-950 ring-2 ring-neutral-950/10' : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover object-center grayscale-[5%]" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Configuration & Details panel */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div className="space-y-8">
            
            {/* Header copy */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-neutral-400">{product.brand}</span>
                <span className="text-[9px] font-bold text-neutral-900 border border-neutral-900 px-3 py-1 rounded-full uppercase tracking-widest">{product.gender}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-light text-neutral-950 tracking-tight mt-3 font-serif italic">{product.name}</h1>
              
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1 bg-neutral-950 text-white px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-lg">
                  ★ {product.rating.toFixed(1)}
                </div>
                <span className="text-xs text-neutral-400 font-light underline underline-offset-4 cursor-pointer hover:text-neutral-900 transition-colors">
                  {product.reviewCount} Verified Customer Reviews
                </span>
              </div>
            </div>

            {/* Price Tags */}
            <div className="border-y border-neutral-150 py-5 flex items-center gap-4">
              <span className="text-2xl font-bold text-neutral-950">
                Rs. {selectedVariant ? selectedVariant.sellingPrice.toLocaleString() : product.basePrice.toLocaleString()}
              </span>
              {product.compareAtPrice && (
                <span className="text-xs text-neutral-400 line-through font-light">
                  Rs. {product.compareAtPrice.toLocaleString()}
                </span>
              )}
              {product.compareAtPrice && (
                <span className="border border-neutral-950 text-neutral-950 text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                  Save {Math.round(((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Short Intro */}
            <p className="text-sm text-neutral-500 leading-relaxed font-sans font-light tracking-wide">{product.shortDescription}</p>

            {/* Color Swatch Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950">Color Swatch</h4>
                <span className="text-xs text-neutral-500 font-light">
                  {COLORS.find(c => c.id === selectedColorId)?.name || 'Select Color'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {COLORS.filter(c => availableColorIds.includes(c.id)).map((col) => {
                  const isSel = selectedColorId === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setSelectedColorId(col.id)}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        isSel ? 'border-neutral-950 ring-2 ring-neutral-950/10 scale-105' : 'border-neutral-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    >
                      {isSel && (
                        <span className={`w-2.5 h-2.5 rounded-full ${col.hex === '#FAF9F6' ? 'bg-black' : 'bg-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Chips & Sizing Guide Indicator */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950">Fit Size</h4>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs font-bold text-neutral-950 hover:underline underline-offset-4 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5 text-emerald-600" /> Body Measurement Size Calculator
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.filter(s => availableSizeIds.includes(s.id)).map((sz) => {
                  const isSel = selectedSizeId === sz.id;
                  return (
                    <button
                      key={sz.id}
                      onClick={() => setSelectedSizeId(sz.id)}
                      className={`py-3 px-2 border text-xs font-bold text-center transition-all rounded-xl cursor-pointer ${
                        isSel
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-400 text-neutral-700 bg-white'
                      }`}
                    >
                      {sz.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multi-Warehouse Live Inventory Tracker */}
            <div className="bg-neutral-50 border border-neutral-150 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-neutral-800" /> Showroom Availability
                </span>
                <span className="text-xs font-semibold text-neutral-800">
                  Total: {totalStockAvailable} units
                </span>
              </div>
              <div className="space-y-3">
                {warehouseInventory.map((item) => (
                  <div key={item.warehouse.id} className="flex items-center justify-between text-xs pb-2 border-b border-dashed border-neutral-200 last:border-0 last:pb-0 font-sans font-light">
                    <span className="font-semibold text-neutral-700">{item.warehouse.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.qty === 0 ? 'bg-neutral-300' : item.lowStock ? 'bg-amber-500' : 'bg-neutral-950'
                      }`} />
                      <span className="font-bold text-neutral-900">
                        {item.qty === 0 ? 'Sold Out' : `${item.qty} units left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Operational Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-neutral-150">
              
              {/* Quant Counter */}
              <div className="flex items-center border border-neutral-300 h-13 w-full sm:w-32 justify-between px-3.5 bg-white rounded-xl">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-1.5 text-neutral-500 hover:text-neutral-950 cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-neutral-900 select-none">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-950 cursor-pointer"
                  disabled={quantity >= totalStockAvailable}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAddToCart}
                disabled={totalStockAvailable === 0}
                className={`flex-1 w-full h-13 text-xs uppercase font-bold tracking-[0.2em] transition-all cursor-pointer rounded-xl ${
                  totalStockAvailable === 0
                    ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed'
                    : 'bg-neutral-950 hover:bg-neutral-800 text-white shadow-xs'
                }`}
              >
                {totalStockAvailable === 0 ? 'Sold Out' : 'Add to Shopping Bag'}
              </button>

              {/* Buy Now Direct CTA */}
              <button
                onClick={handleBuyNow}
                disabled={totalStockAvailable === 0}
                className={`flex-1 w-full h-13 text-xs uppercase font-bold tracking-[0.2em] border transition-all cursor-pointer rounded-xl ${
                  totalStockAvailable === 0
                    ? 'hidden'
                    : 'border-neutral-950 hover:bg-neutral-950 hover:text-white bg-white text-neutral-950'
                }`}
              >
                Direct Buy Now
              </button>
            </div>

          </div>

          {/* Textile Specifications Accordion/Info Card */}
          <div className="mt-10 pt-8 border-t border-neutral-150 grid grid-cols-2 gap-4 text-xs font-sans font-light tracking-wide select-none">
            <div className="p-4 border border-neutral-100 bg-neutral-50 rounded-xl">
              <p className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">Composition</p>
              <p className="text-neutral-800 font-semibold mt-1">{product.material}</p>
            </div>
            <div className="p-4 border border-neutral-100 bg-neutral-50 rounded-xl">
              <p className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">Drape Fit</p>
              <p className="text-neutral-800 font-semibold mt-1">{product.fit}</p>
            </div>
            <div className="p-4 border border-neutral-100 bg-neutral-50 rounded-xl">
              <p className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">Laundering</p>
              <p className="text-neutral-800 font-semibold mt-1">{product.careInstructions}</p>
            </div>
            <div className="p-4 border border-neutral-100 bg-neutral-50 rounded-xl">
              <p className="font-bold text-neutral-400 uppercase tracking-widest text-[9px]">Weight Code</p>
              <p className="text-neutral-800 font-semibold mt-1">
                {selectedVariant ? `${selectedVariant.weightGrams}g Heavyweight` : 'Sartorial Knit'}
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Size Guide & Body Measurement Calculator Dialog Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 bg-neutral-950/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-xl w-full p-6 sm:p-8 relative rounded-2xl border border-neutral-150 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                <Ruler className="w-3.5 h-3.5" /> Body Measurement Calculator
              </div>
              <h3 className="text-xl font-light font-serif italic text-neutral-950 uppercase">
                Find Your Perfect Size
              </h3>
              <p className="text-xs text-neutral-500 font-light mt-0.5">
                Enter your body measurements below to automatically determine whether you are Small, Medium, Large, or XL.
              </p>
            </div>

            {/* Interactive Calculator Component */}
            {(() => {
              const res = resolveSizeFromMeasurements(
                { bust: custBust, waist: custWaist, hips: custHips },
                sizeRules
              );

              return (
                <div className="space-y-5 bg-neutral-50 border border-neutral-200 p-5 rounded-2xl">
                  <div className="space-y-3 text-xs font-medium">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-600">Bust / Chest (Inches)</label>
                        <span className="font-mono font-bold text-neutral-950">{custBust}" ({(custBust * 2.54).toFixed(0)} cm)</span>
                      </div>
                      <input
                        type="range"
                        min="28"
                        max="48"
                        step="0.5"
                        value={custBust}
                        onChange={(e) => setCustBust(Number(e.target.value))}
                        className="w-full accent-neutral-950 h-2 bg-neutral-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-600">Waist (Inches)</label>
                        <span className="font-mono font-bold text-neutral-950">{custWaist}" ({(custWaist * 2.54).toFixed(0)} cm)</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="44"
                        step="0.5"
                        value={custWaist}
                        onChange={(e) => setCustWaist(Number(e.target.value))}
                        className="w-full accent-neutral-950 h-2 bg-neutral-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-neutral-600">Hips (Inches)</label>
                        <span className="font-mono font-bold text-neutral-950">{custHips}" ({(custHips * 2.54).toFixed(0)} cm)</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="52"
                        step="0.5"
                        value={custHips}
                        onChange={(e) => setCustHips(Number(e.target.value))}
                        className="w-full accent-neutral-950 h-2 bg-neutral-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculated Recommendation Banner */}
                  <div className="bg-neutral-950 text-white p-4 rounded-xl flex items-center justify-between shadow-md">
                    <div>
                      <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-400 block">
                        Recommended Fit ({res.score}% Match)
                      </span>
                      <h4 className="text-xl font-bold font-serif italic text-white mt-0.5">{res.recommendedSizeLabel}</h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const szObj = SIZES.find(s => s.name === res.recommendedSizeCode);
                        if (szObj && availableSizeIds.includes(szObj.id)) {
                          setSelectedSizeId(szObj.id);
                        }
                        setShowSizeGuide(false);
                      }}
                      className="bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase px-4 py-2.5 rounded-xl cursor-pointer transition-colors shrink-0"
                    >
                      Select {res.recommendedSizeCode} Size
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Standard Size Guide Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Standard Size Specifications Table</h4>
              <table className="w-full text-left text-xs border-collapse font-sans rounded-xl overflow-hidden border border-neutral-200">
                <thead>
                  <tr className="bg-neutral-100 font-bold uppercase text-neutral-600 border-b border-neutral-200">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Bust Range</th>
                    <th className="py-2.5 px-3">Waist Range</th>
                    <th className="py-2.5 px-3">Hips Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-medium text-neutral-800 bg-white">
                  {sizeRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="py-2.5 px-3 font-bold bg-neutral-50 text-neutral-950">{rule.sizeCode}</td>
                      <td className="py-2.5 px-3">{rule.bustMinInches}"–{rule.bustMaxInches}"</td>
                      <td className="py-2.5 px-3">{rule.waistMinInches}"–{rule.waistMaxInches}"</td>
                      <td className="py-2.5 px-3">{rule.hipsMinInches}"–{rule.hipsMaxInches}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-[0.2em] py-3.5 w-full rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

