import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Sliders, ChevronDown, Check, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Product, ProductVariant, Color, Size, InventoryItem, Category } from '../types';
import { COLORS, SIZES } from '../data';

interface CustomerProductGridProps {
  products: Product[];
  categories: Category[];
  variants: ProductVariant[];
  inventory: InventoryItem[];
  searchQuery: string;
  activeGenderFilter: string;
  setActiveGenderFilter: (gender: string) => void;
  onProductClick: (productId: string) => void;
  onQuickAdd: (productId: string) => void;
  watchedIds: string[];
  onToggleWatch: (productId: string) => void;
}

export default function CustomerProductGrid({
  products,
  categories: categoryList,
  variants,
  inventory,
  searchQuery,
  activeGenderFilter,
  setActiveGenderFilter,
  onProductClick,
  onQuickAdd,
  watchedIds,
  onToggleWatch
}: CustomerProductGridProps) {
  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Derive available categories list (combines categoryList names and any extra found in products)
  const categoryNames = useMemo(() => {
    const fromList = categoryList.map(c => c.name);
    const fromProds = products.map(p => p.category);
    return Array.from(new Set([...fromList, ...fromProds]));
  }, [categoryList, products]);

  // Handle category toggle
  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Handle color toggle
  const toggleColor = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    );
  };

  // Handle size toggle
  const toggleSize = (sizeId: string) => {
    setSelectedSizes(prev =>
      prev.includes(sizeId) ? prev.filter(s => s !== sizeId) : [...prev, sizeId]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMaxPrice(20000);
    setActiveGenderFilter('All');
  };

  // Main filter/sort logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Keyword Search match (Name, Category, Brand, Description)
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(query);
          const matchCategory = product.category.toLowerCase().includes(query);
          const matchBrand = product.brand.toLowerCase().includes(query);
          const matchDesc = product.description.toLowerCase().includes(query);
          if (!matchName && !matchCategory && !matchBrand && !matchDesc) {
            return false;
          }
        }

        // Category/Department filter from Header (e.g. Dresses, Shirts, Trousers, Jackets)
        if (activeGenderFilter !== 'All') {
          if (product.category !== activeGenderFilter) {
            return false;
          }
        }

        // Category filter
        if (selectedCategories.length > 0) {
          if (!selectedCategories.includes(product.category)) {
            return false;
          }
        }

        // Price filter
        if (product.basePrice > maxPrice) {
          return false;
        }

        // Color & Size filter matching variants
        const productVariants = variants.filter(v => v.productId === product.id);
        
        if (selectedColors.length > 0) {
          const hasColor = productVariants.some(v => selectedColors.includes(v.colorId));
          if (!hasColor) return false;
        }

        if (selectedSizes.length > 0) {
          const hasSize = productVariants.some(v => selectedSizes.includes(v.sizeId));
          if (!hasSize) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.basePrice - b.basePrice;
        }
        if (sortBy === 'price-high') {
          return b.basePrice - a.basePrice;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'newest') {
          return b.isNewArrival === a.isNewArrival ? 0 : b.isNewArrival ? 1 : -1;
        }
        // 'featured' sorting (bestsellers / custom ranking)
        return b.isBestSeller === a.isBestSeller ? 0 : b.isBestSeller ? 1 : -1;
      });
  }, [products, variants, searchQuery, activeGenderFilter, selectedCategories, selectedColors, selectedSizes, maxPrice, sortBy]);

  // Calculate inventory status for a quick-reference dot
  const getProductStockStatus = (productId: string) => {
    const pVariants = variants.filter(v => v.productId === productId);
    const vIds = pVariants.map(v => v.id);
    const pInv = inventory.filter(i => vIds.includes(i.variantId));
    const totalQty = pInv.reduce((acc, item) => acc + item.onHand, 0);
    
    if (totalQty === 0) return { label: 'Sold Out', color: 'bg-rose-500' };
    if (totalQty < 15) return { label: 'Low Stock', color: 'bg-amber-500' };
    return { label: 'In Stock', color: 'bg-emerald-500' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="shop-catalog">
      
      {/* Spring & Summer Style "Shop by Curation" rounded collections row */}
      <div className="mb-14 bg-white border border-neutral-100 p-8 rounded-2xl shadow-xs">
        <h3 className="text-[11px] font-bold text-neutral-900 uppercase tracking-[0.3em] mb-8 select-none flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-neutral-950 rounded-full" />
          <span>Curated Silhouette Collections</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 select-none">
          {categoryList.map((catItem) => {
            const isSelected = selectedCategories.includes(catItem.name);
            return (
              <button
                key={catItem.id}
                onClick={() => {
                  setSelectedCategories(isSelected ? [] : [catItem.name]);
                }}
                className="group flex flex-col items-center cursor-pointer text-center relative focus:outline-none"
              >
                <div className={`w-full aspect-square border bg-white overflow-hidden relative transition-all duration-300 rounded-2xl ${
                  isSelected ? 'border-neutral-950 scale-[1.02] shadow-md' : 'border-neutral-200 group-hover:border-neutral-400'
                }`}>
                  <img
                    src={catItem.image}
                    alt={catItem.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover grayscale-20 transition-all duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-neutral-950/10 group-hover:bg-transparent transition-colors duration-300" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-neutral-950/25 flex items-center justify-center">
                      <div className="bg-white text-neutral-950 p-2.5 border border-neutral-950 rounded-xl">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest mt-3 transition-colors ${
                  isSelected ? 'text-neutral-950 underline underline-offset-4' : 'text-neutral-700 group-hover:text-neutral-950'
                }`}>
                  {catItem.name}
                </span>
                <span className="text-[10px] text-neutral-400 font-light tracking-wide mt-1 line-clamp-1">
                  {catItem.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Header and Sorting Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-100 pb-6 mb-10 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-neutral-950 font-serif uppercase">
            {activeGenderFilter === 'All' ? 'Bespoke Catalog' : `${activeGenderFilter}'s Apparel`}
          </h2>
          <p className="text-xs text-neutral-400 font-light mt-1">
            Displaying {filteredProducts.length} style coordinates matching your criteria.
          </p>
        </div>

        {/* Sort and Filters Button panel */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 px-5 py-2.5 border border-neutral-950 text-[10px] font-bold uppercase tracking-widest text-neutral-950 bg-white hover:bg-neutral-950 hover:text-white transition-colors rounded-xl"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-neutral-200 text-xs py-2 px-3 focus:outline-none focus:border-neutral-950 text-neutral-800 font-medium rounded-lg"
            >
              <option value="featured">Best Sellers</option>
              <option value="newest">New Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highly Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block md:col-span-1 border-r border-neutral-150 pr-8 space-y-8">
          
          {/* Active Filter Clearer */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-950 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5" /> Filters
            </span>
            {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || maxPrice < 20000 || activeGenderFilter !== 'All') && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-neutral-400 hover:text-neutral-950 underline underline-offset-4 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Gender checkboxes */}
          <div className="border-t border-neutral-100 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 mb-4">Category Segments</h4>
            <div className="space-y-2.5">
              {['All', 'Men', 'Women', 'Kids', 'Unisex'].map((g) => (
                <label key={g} className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-neutral-950 cursor-pointer">
                  <input
                    type="radio"
                    name="genderFilter"
                    checked={activeGenderFilter === g}
                    onChange={() => setActiveGenderFilter(g)}
                    className="accent-neutral-950"
                  />
                  <span>{g === 'All' ? 'All Segments' : g}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Product Category Checkboxes */}
          <div className="border-t border-neutral-100 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 mb-4">Style Silhouette</h4>
            <div className="space-y-2.5">
              {categoryNames.map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 text-xs text-neutral-600 hover:text-neutral-950 cursor-pointer">
                   <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="rounded border-neutral-350 text-neutral-950 focus:ring-neutral-950 accent-neutral-950"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Premium Colors Swatches */}
          <div className="border-t border-neutral-100 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 mb-4">Color Swatches</h4>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => {
                const isSelected = selectedColors.includes(col.id);
                return (
                  <button
                    key={col.id}
                    onClick={() => toggleColor(col.id)}
                    className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'border-neutral-950 ring-2 ring-neutral-950/10 scale-105' : 'border-neutral-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && (
                      <Check className={`w-3.5 h-3.5 ${col.hex === '#FAF9F6' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Chips */}
          <div className="border-t border-neutral-100 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950 mb-4">Sizing Chips</h4>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map((sz) => {
                const isSelected = selectedSizes.includes(sz.id);
                return (
                  <button
                    key={sz.id}
                    onClick={() => toggleSize(sz.id)}
                    className={`py-1.5 px-1.5 text-xs font-medium border rounded-lg transition-all text-center ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
                    }`}
                  >
                    {sz.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="border-t border-neutral-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-950">Max Budget</h4>
              <span className="text-xs font-medium text-neutral-850">Rs. {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-neutral-950 bg-neutral-150 h-1 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>Rs. 2,000</span>
              <span>Rs. 20,000</span>
            </div>
          </div>

        </aside>

        {/* Product Grid Layout */}
        <main className="col-span-1 md:col-span-3">
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-neutral-50 border border-dashed border-neutral-200 p-8">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">No styles match your criteria.</p>
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center justify-center bg-neutral-950 text-white text-[10px] uppercase tracking-widest font-bold px-6 py-3.5 hover:bg-neutral-850 transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-6 sm:gap-x-8">
              {filteredProducts.map((p) => {
                const stockStatus = getProductStockStatus(p.id);
                const isWatched = watchedIds.includes(p.id);

                // Derive pseudo-stable watcher/sold metrics
                const charCodeSum = p.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                const soldCount = (charCodeSum % 22) + 6;
                const watchingCount = (charCodeSum % 14) + 4;

                // Total stock calculation
                const pVariants = variants.filter(v => v.productId === p.id);
                const vIds = pVariants.map(v => v.id);
                const pInv = inventory.filter(i => vIds.includes(i.variantId));
                const totalStock = pInv.reduce((acc, item) => acc + item.onHand, 0);

                return (
                  <div
                    key={p.id}
                    className="group relative bg-white border border-neutral-150 flex flex-col justify-between h-full hover:shadow-md rounded-2xl overflow-hidden transition-all duration-300 select-none cursor-pointer"
                    onClick={() => onProductClick(p.id)}
                  >
                    {/* Visual Media Wrapper with rounded border radius (Modern boutique rounded style) */}
                    <div className="relative aspect-[3/4] bg-neutral-50 overflow-hidden border-b border-neutral-100 rounded-t-2xl">
                      
                      {/* Product Status Badge */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 items-start">
                        {p.isNewArrival ? (
                          <span className="bg-neutral-950 text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs">
                            New In
                          </span>
                        ) : p.isBestSeller ? (
                          <span className="bg-white text-neutral-950 border border-neutral-950 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs">
                            Best Seller
                          </span>
                        ) : p.isSale ? (
                          <span className="bg-neutral-900 text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-2xs">
                            Sale
                          </span>
                        ) : null}
                      </div>
 
                      {/* Stock Status Indicator Dot */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex items-center gap-1 sm:gap-1.5 bg-white/95 border border-neutral-200 py-0.5 px-1.5 sm:py-1 sm:px-2.5 text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-neutral-800 rounded-full shadow-3xs">
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${stockStatus.color}`} />
                        <span className="hidden xxs:inline">{stockStatus.label}</span>
                      </div>

                      {/* Persistent Watchlist (Heart) button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatch(p.id);
                        }}
                        className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20 p-1.5 sm:p-2.5 rounded-full transition-all duration-300 cursor-pointer shadow-xs border ${
                          isWatched 
                            ? 'bg-neutral-950 border-neutral-950 text-white scale-110' 
                            : 'bg-white/95 hover:bg-neutral-950 border-neutral-200 text-neutral-400 hover:text-white'
                        }`}
                        title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isWatched ? 'fill-current' : ''}`} />
                      </button>
  
                      {/* Dual-image Hover Loop */}
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out absolute inset-0 grayscale-[10%]"
                      />
                      {p.images[1] && (
                        <img
                          src={p.images[1]}
                          alt={`${p.name} Alternate`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:opacity-100 opacity-0 transition-opacity duration-700 ease-out absolute inset-0 grayscale-[10%]"
                        />
                      )}

                      {/* Hover Slide Up details trigger buttons */}
                      <div className="absolute inset-0 bg-neutral-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 sm:p-4 gap-1.5 sm:gap-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onProductClick(p.id);
                          }}
                          className="flex-1 bg-white hover:bg-neutral-950 text-neutral-950 hover:text-white font-bold text-[8px] sm:text-[9px] uppercase tracking-[0.15em] py-2 sm:py-3 flex items-center justify-center gap-1 sm:gap-1.5 shadow-md transition-all cursor-pointer border border-neutral-950 rounded-xl"
                        >
                          <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                          <span className="hidden xxs:inline">Quick View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickAdd(p.id);
                          }}
                          className="bg-white hover:bg-neutral-950 text-neutral-950 hover:text-white p-2 sm:p-3 shadow-md border border-neutral-950 transition-all cursor-pointer rounded-xl shrink-0"
                          title="Quick Add to Bag"
                        >
                          <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Details */}
                    <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[8px] sm:text-[9px] uppercase font-bold text-neutral-400 tracking-[0.15em]">{p.brand}</span>
                          <span className="text-[7px] sm:text-[8px] bg-neutral-50 border border-neutral-150 text-neutral-600 font-bold uppercase tracking-wider px-1 py-0.5 sm:px-1.5 rounded">{p.category}</span>
                        </div>
                        <h3 
                          className="text-xs sm:text-base font-serif font-light text-neutral-950 hover:underline cursor-pointer tracking-tight mt-1 sm:mt-2 line-clamp-1 italic"
                        >
                          {p.name}
                        </h3>

                        {/* Customer Rating Stars */}
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex text-neutral-950 text-[10px] sm:text-xs tracking-tighter">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>
                                {i < Math.floor(p.rating) ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="text-[8px] sm:text-[10px] text-neutral-400 font-light font-sans">
                            {p.rating.toFixed(1)} <span className="font-light hidden xs:inline">({p.reviewCount})</span>
                          </span>
                        </div>

                        {/* Conversational Stock & Watcher Counters */}
                        <div className="mt-1.5 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[8px] sm:text-[10px] text-neutral-500 items-center font-sans font-light">
                          <span className="flex items-center gap-0.5">
                            🔥 <span className="font-semibold text-neutral-700">{soldCount} sold</span>
                          </span>
                          <span className="text-neutral-300">•</span>
                          <span className="flex items-center gap-0.5">
                            👁️ <span className="text-neutral-500">{watchingCount} views</span>
                          </span>
                        </div>

                        {/* Low stock notice */}
                        {totalStock > 0 && totalStock < 15 && (
                          <span className="text-[8px] sm:text-[10px] font-bold text-neutral-900 mt-1.5 sm:mt-2 block tracking-wide">
                            ⌛ Only {totalStock} left
                          </span>
                        )}
                      </div>

                      {/* Pricing Tag */}
                      <div className="mt-2.5 sm:mt-4 border-t border-neutral-100 pt-2 sm:pt-3">
                        <div className="flex flex-wrap items-baseline gap-x-1 sm:gap-x-1.5 gap-y-0.5">
                          <span className="text-xs sm:text-base font-bold text-neutral-950">Rs. {p.basePrice.toLocaleString()}</span>
                          {p.compareAtPrice && (
                            <span className="text-[9px] sm:text-xs text-neutral-400 line-through font-light">
                              Rs. {p.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                          {p.compareAtPrice && (
                            <span className="text-[7px] sm:text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded-md">
                              -{Math.round(((p.compareAtPrice - p.basePrice) / p.compareAtPrice) * 100)}%
                            </span>
                          )}
                        </div>
                        
                        {/* Shipping Promotion Tag */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-1 text-[7px] sm:text-[9px] leading-none">
                          <span className="font-bold text-neutral-800 uppercase tracking-wider">Free Delivery</span>
                          <span className="text-neutral-400 font-light">over 5K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden flex justify-end">
          <div className="fixed inset-0 bg-black/40 transition-opacity" onClick={() => setShowMobileFilters(false)} />
          
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col py-6 overflow-y-auto px-5 gap-6 animate-slideLeft">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-neutral-900">Bespoke Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-neutral-500 hover:text-neutral-950">
                <Check className="w-5 h-5" />
              </button>
            </div>

            {/* Repeat sidebar elements inside mobile view */}
            <div className="space-y-6">
              {/* Category Radio buttons */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">Sartorial Segments</h4>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Men', 'Women', 'Kids', 'Unisex'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setActiveGenderFilter(g)}
                      className={`px-3 py-1.5 text-xs font-semibold border ${
                        activeGenderFilter === g ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">Silhouettes</h4>
                <div className="flex flex-wrap gap-2">
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold border ${
                        selectedCategories.includes(cat) ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">Sizes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {SIZES.map((sz) => (
                    <button
                      key={sz.id}
                      onClick={() => toggleSize(sz.id)}
                      className={`py-2 border text-xs font-bold text-center ${
                        selectedSizes.includes(sz.id) ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-700'
                      }`}
                    >
                      {sz.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">Colors</h4>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((col) => {
                    const isSel = selectedColors.includes(col.id);
                    return (
                      <button
                        key={col.id}
                        onClick={() => toggleColor(col.id)}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                          isSel ? 'border-neutral-900 ring-2 ring-neutral-900/10' : 'border-neutral-200'
                        }`}
                        style={{ backgroundColor: col.hex }}
                      >
                        {isSel && <Check className={`w-4 h-4 ${col.hex === '#FAF9F6' ? 'text-black' : 'text-white'}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Budget Limit</h4>
                  <span className="text-xs font-bold text-neutral-900">Rs. {maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="20000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-neutral-950 h-1.5"
                />
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#111111] text-white py-3 text-xs uppercase tracking-widest font-bold mt-4"
              >
                Apply Bespoke Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
