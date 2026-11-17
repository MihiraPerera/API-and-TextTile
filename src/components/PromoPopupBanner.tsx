import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, X, Clock, Calendar, Check, Copy } from 'lucide-react';
import { Coupon } from '../types';

interface PromoPopupBannerProps {
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon | null) => void;
}

const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const PromoPopupBanner: React.FC<PromoPopupBannerProps> = ({
  coupons,
  appliedCoupon,
  onApplyCoupon
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Find active popup coupon
  const activePopupCoupon = coupons.find(c => {
    if (!c.isActive || !c.showAsPopup) return false;

    // Check expiration
    if (c.expiresAt) {
      const expTime = new Date(c.expiresAt).getTime();
      if (isNaN(expTime) || expTime < Date.now()) return false;
    }

    // Check active days of week
    if (c.activeDays && c.activeDays.length > 0) {
      const currentDay = DAYS_MAP[new Date().getDay()];
      if (!c.activeDays.includes(currentDay)) return false;
    }

    return true;
  });

  // Auto-open on initial load if not dismissed in session
  useEffect(() => {
    if (activePopupCoupon) {
      try {
        const dismissed = sessionStorage.getItem(`wearora_promo_dismissed_${activePopupCoupon.code}`);
        if (!dismissed) {
          const timer = setTimeout(() => setIsOpen(true), 600);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        setIsOpen(true);
      }
    }
  }, [activePopupCoupon]);

  const handleClose = () => {
    setIsOpen(false);
    if (activePopupCoupon) {
      try {
        sessionStorage.setItem(`wearora_promo_dismissed_${activePopupCoupon.code}`, 'true');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!activePopupCoupon) return null;

  const isCurrentApplied = appliedCoupon?.code === activePopupCoupon.code;

  const handleApplyToBill = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onApplyCoupon(activePopupCoupon);
    setAppliedNotification(`🎉 Code ${activePopupCoupon.code} applied to your bill!`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => {
      setAppliedNotification(null);
      handleClose();
    }, 1500);
  };

  const handleCopyCode = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(activePopupCoupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Format expiration date string
  const formattedExpire = activePopupCoupon.expiresAt 
    ? new Date(activePopupCoupon.expiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <>
      {/* Floating Offer Re-Open Widget (Bottom Left) */}
      {!isOpen && (
        <div className="fixed bottom-5 left-5 z-40 animate-fade-in">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-amber-950 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <div className="text-left">
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400/80">Active Discount Offer</p>
              <p className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                <span>{activePopupCoupon.code}</span>
                <span className="bg-amber-400 text-neutral-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded">
                  {activePopupCoupon.type === 'PERCENTAGE' ? `-${activePopupCoupon.value}%` : `-Rs.${activePopupCoupon.value}`}
                </span>
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Main Promo Popup Modal */}
      {isOpen && (
        <div 
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fade-in cursor-pointer select-none"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-neutral-950 text-white rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden animate-slide-up cursor-default"
          >
            {/* Top Glowing Ambient Decorative Header */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Prominent Close X Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClose();
              }}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/80 transition-all cursor-pointer shadow-lg active:scale-95"
              title="Close Offer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Popup Main Content */}
            <div className="p-6 sm:p-8 space-y-6 text-center relative z-10 select-text">
              
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full select-none">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activePopupCoupon.popupBadge || 'LIMITED TIME DISCOUNT BANNER'}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif italic text-white tracking-wide">
                  {activePopupCoupon.popupTitle || '⚡ Island Special Flash Discount!'}
                </h2>
                <p className="text-xs font-sans text-neutral-300 font-light max-w-sm mx-auto leading-relaxed">
                  {activePopupCoupon.popupSubtitle || activePopupCoupon.description}
                </p>
              </div>

              {/* Coupon Code Card */}
              <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/30 p-5 rounded-2xl space-y-3 relative text-left">
                <div className="flex items-center justify-between text-neutral-400 text-[10px] font-bold uppercase tracking-wider border-b border-neutral-800/80 pb-2.5">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Tag className="w-3.5 h-3.5" /> Promo Discount Code
                  </span>
                  <span className="text-white font-extrabold text-xs">
                    {activePopupCoupon.type === 'PERCENTAGE' ? `${activePopupCoupon.value}% OFF` : `Rs. ${activePopupCoupon.value} OFF`}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="space-y-0.5">
                    <p className="font-mono font-black text-amber-300 tracking-[0.2em] text-lg sm:text-xl">
                      {activePopupCoupon.code}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-light">
                      Min order spend: Rs. {activePopupCoupon.minSpend.toLocaleString()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-amber-500/30 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Schedule & Expiry Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] font-sans">
                {activePopupCoupon.activeDays && activePopupCoupon.activeDays.length > 0 && (
                  <div className="bg-neutral-900/90 border border-neutral-800 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 text-neutral-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Days: <strong className="text-white font-semibold">{activePopupCoupon.activeDays.join(', ')}</strong></span>
                  </div>
                )}

                {formattedExpire && (
                  <div className="bg-neutral-900/90 border border-neutral-800 px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>Expires: <strong className="text-amber-300 font-semibold">{formattedExpire}</strong></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleApplyToBill}
                  disabled={isCurrentApplied}
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-neutral-950 font-extrabold text-xs uppercase tracking-[0.15em] py-3.5 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCurrentApplied ? '✓ Applied to Your Bill' : 'Apply Discount Directly to My Bill'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClose();
                  }}
                  className="text-[11px] font-sans text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer py-1 block w-full"
                >
                  No thanks, I will browse catalog first
                </button>
              </div>

              {/* Confirmation Toast Notification */}
              {appliedNotification && (
                <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold py-2.5 px-4 rounded-xl animate-fade-in flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{appliedNotification}</span>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
};
