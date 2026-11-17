import React, { useState, useEffect } from 'react';
import { ArrowRight, Shield, RefreshCcw, Truck } from 'lucide-react';

interface CustomerHeroProps {
  onShopNow: () => void;
  activeGenderFilter: string;
  setActiveGenderFilter: (gender: string) => void;
}

export default function CustomerHero({ onShopNow, activeGenderFilter, setActiveGenderFilter }: CustomerHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1600&auto=format&fit=crop&q=80",
      curation: "Mulberry Silk Evening Silhouette"
    },
    {
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1600&auto=format&fit=crop&q=80",
      curation: "Organza Balloon Blouse Edit"
    },
    {
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1600&auto=format&fit=crop&q=80",
      curation: "Handloom Batik Resort Slip"
    }
  ];

  // Automatic slideshow sequence effect (slides every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section className="relative bg-black text-white overflow-hidden border-b border-neutral-900 select-none">
      {/* Background Hero Image with Soft Vignette for Full Image Visibility */}
      <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] w-full flex items-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {heroSlides.map((slide, idx) => (
            <img
              key={idx}
              src={slide.image}
              alt="Girls Couture Collection Hero"
              referrerPolicy="no-referrer"
              className={`absolute inset-0 w-full h-full object-cover object-top filter brightness-[0.85] contrast-[1.05] transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          ))}
          {/* Balanced soft overlays to preserve text readability while keeping full image clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
        </div>

        {/* Hero Foreground Content Layer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10 w-full">
          <div className="max-w-xl text-left">
            
            {/* Top Announcement Tag */}
            <div className="inline-flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-300 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/20 w-fit">
              <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse" />
              <span>AUTUMN-WINTER '26 LINE RELEASED</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight font-serif text-white leading-[1.05] mb-6 drop-shadow-sm">
              Sartorial <br />
              <span className="italic font-normal">Girls' Couture</span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-neutral-200 text-xs sm:text-sm lg:text-base leading-relaxed max-w-lg font-sans font-light tracking-wide mb-8 drop-shadow-xs">
              Elevating girls' fashion with meticulously crafted minimalist silhouettes. Engineered with premium double-weight organic silk, French flax linen, and pure cashmere knits.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button
                onClick={onShopNow}
                className="bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-lg"
              >
                <span>EXPLORE THE COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onShopNow}
                className="bg-black/40 hover:bg-white/20 text-white border border-white/40 hover:border-white backdrop-blur-xs font-bold text-xs uppercase tracking-[0.2em] px-8 py-4 transition-all duration-300 cursor-pointer"
              >
                VIEW LOOKBOOK
              </button>
            </div>

            {/* Three Pillar Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20 max-w-lg bg-black/20 backdrop-blur-2xs p-4 rounded-xl border border-white/10">
              <div>
                <div className="text-2xl sm:text-3xl font-light font-serif text-white">100%</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300 mt-1">MULBERRY SILK</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-light font-serif text-white">Organic</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300 mt-1">FRENCH FLAX</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-light font-serif text-white">Bespoke</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300 mt-1">LIMITED RUNS</div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Right Editorial Curation Badge */}
        <div className="absolute right-6 lg:right-12 bottom-12 z-10 text-right hidden md:block bg-black/40 backdrop-blur-xs p-4 rounded-xl border border-white/10">
          <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-neutral-300">EDITORIAL CURATION</p>
          <p className="text-lg font-serif italic text-white mt-1">{heroSlides[currentSlide].curation}</p>
        </div>
      </div>

      {/* Modern High-Contrast Benefit Banner */}
      <div className="bg-black text-white border-t border-neutral-900 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center gap-3.5">
            <Truck className="w-4.5 h-4.5 text-neutral-300 stroke-[1.5]" />
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] font-sans">FAST COURIER DISPATCH</p>
              <p className="text-[11px] text-neutral-400 font-light mt-0.5">Dispatched within 24 hours island-wide</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3.5 border-y sm:border-y-0 sm:border-x border-neutral-800 py-3 sm:py-0">
            <RefreshCcw className="w-4.5 h-4.5 text-neutral-300 stroke-[1.5]" />
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] font-sans">PREMIUM EXCHANGES</p>
              <p className="text-[11px] text-neutral-400 font-light mt-0.5">Complementary size swap within 14 days</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3.5">
            <Shield className="w-4.5 h-4.5 text-neutral-300 stroke-[1.5]" />
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] font-sans">SARTORIAL AUTHENTICITY</p>
              <p className="text-[11px] text-neutral-400 font-light mt-0.5">Hand-selected, high-density organic fibers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


