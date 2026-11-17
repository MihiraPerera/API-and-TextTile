import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Settings, Search, Menu, X, Sparkles } from 'lucide-react';
import { CartItem, Category } from '../types';
import { Logo } from './Logo';

interface CustomerHeaderProps {
  cart: CartItem[];
  categories: Category[];
  currentView: string;
  setView: (view: 'store' | 'portal' | 'admin') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCartClick: () => void;
  activeGenderFilter: string;
  setActiveGenderFilter: (gender: string) => void;
  logoUrl?: string;
}

export default function CustomerHeader({
  cart,
  categories,
  currentView,
  setView,
  searchQuery,
  setSearchQuery,
  onCartClick,
  activeGenderFilter,
  setActiveGenderFilter,
  logoUrl
}: CustomerHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Scroll detection effect to make navbar sticky and translucent on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: "All Apparel", value: 'All' },
    ...categories.map(cat => ({ label: cat.name, value: cat.name }))
  ];

  return (
    <header className={`sticky top-0 z-50 w-full text-white transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/80 backdrop-blur-md border-b border-white/10 shadow-2xl' 
        : 'bg-black border-b border-neutral-900 shadow-sm'
    }`}>
      {/* Premium Announcement Bar - collapses cleanly on scroll for maximum sticky navbar viewport space */}
      {!isScrolled && (
        <div className="w-full bg-[#111111] text-white text-[10px] sm:text-xs py-2 px-4 flex items-center justify-between text-center select-none font-sans font-medium tracking-[0.15em] border-b border-neutral-900 transition-all duration-300">
          <div className="hidden sm:flex items-center gap-1.5 text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AUTUMN-WINTER '26 LINE RELEASED</span>
          </div>
          <div className="mx-auto sm:mx-0 font-semibold text-white">
            <span>FREE EXPRESS ISLAND-WIDE DELIVERY OVER RS. 5,000</span>
          </div>
          <div className="hidden md:block text-neutral-300">
            <span>STANDARD DELIVERY 2-3 DAYS</span>
          </div>
        </div>
      )}

      {/* Main Navigation Row - Always Sticky */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between gap-4">
        
        {/* Brand Logo - Preserved 100% sharp and un-filtered */}
        <div 
          onClick={() => { setView('store'); setActiveGenderFilter('All'); }} 
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity shrink-0"
        >
          <Logo variant="light" height={70} logoUrl={logoUrl} />
        </div>

        {/* Live Search Input Bar - High-Contrast Sharp Contrast */}
        <div className="hidden md:flex flex-grow max-w-xl lg:max-w-2xl items-center mx-6">
          <div className="flex items-center w-full border border-neutral-800 rounded-xl bg-neutral-950/90 focus-within:border-white/40 transition-all overflow-hidden shadow-xs">
            {/* Category selection */}
            <select
              value={activeGenderFilter}
              onChange={(e) => {
                setView('store');
                setActiveGenderFilter(e.target.value);
              }}
              className="bg-black text-neutral-200 text-xs py-2.5 px-4 border-r border-neutral-800 hover:bg-neutral-900 transition-colors cursor-pointer outline-none font-medium rounded-l-xl"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Input field */}
            <div className="relative flex-grow flex items-center">
              <input
                type="text"
                placeholder="Search catalog (silk slip dresses, organza blouses...)"
                value={searchQuery}
                onChange={(e) => {
                  setView('store');
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-transparent text-xs py-2.5 pl-4 pr-10 text-white placeholder-neutral-400 focus:outline-none border-0 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Action Search button */}
            <button
              onClick={() => {
                setView('store');
                const el = document.getElementById('shop-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white hover:bg-neutral-200 text-black font-bold text-xs uppercase tracking-[0.15em] py-2.5 px-6 transition-colors flex items-center gap-2 shrink-0 border-l border-white rounded-r-xl cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Action Controls Panel */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Customer Portal Button */}
          <button
            onClick={() => setView('portal')}
            className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 border text-xs font-semibold cursor-pointer ${
              currentView === 'portal'
                ? 'bg-white text-black border-white shadow-md'
                : 'border-white/15 text-neutral-200 hover:text-white hover:bg-white/10 hover:border-white/30 bg-black/60'
            }`}
            title="My Orders & Profile"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">My Account</span>
          </button>

          {/* Cart Bag Trigger */}
          <button
            onClick={onCartClick}
            className="p-2.5 rounded-xl text-neutral-200 hover:text-white border border-white/15 transition-all relative hover:bg-white/10 bg-black/60 cursor-pointer"
            title="Shopping Bag"
          >
            <ShoppingBag className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-white text-black text-[9px] w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold tracking-tight border border-black shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-200 hover:bg-white/10 rounded-xl md:hidden border border-white/15 bg-black/60 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-900 bg-black/95 backdrop-blur-md py-5 px-4 flex flex-col gap-4 animate-fadeIn">
          {/* Mobile Search Bar */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => {
                setView('store');
                setSearchQuery(e.target.value);
              }}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-neutral-400 focus:outline-none focus:border-white/40 font-medium"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
          </div>

          <div className="flex flex-col gap-1 font-medium text-xs uppercase tracking-widest text-neutral-300">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  setView('store');
                  setActiveGenderFilter(item.value);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-3 px-4 transition-all rounded-xl ${
                  activeGenderFilter === item.value && currentView === 'store'
                    ? 'bg-white text-black font-bold'
                    : 'hover:bg-neutral-900 text-neutral-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}



