import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';

export const NewsletterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Simulate premium backend subscription
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <h5 className="font-bold text-neutral-900 uppercase tracking-[0.2em] text-[10px] flex items-center gap-1.5">
        <span>Sartorial Updates</span>
        <Sparkles className="w-3.5 h-3.5 text-neutral-900" />
      </h5>
      <p className="leading-relaxed text-neutral-400 text-xs font-light">
        Subscribe to receive curated releases of seasonal couture launches, private boutique collections, and custom sizing edits.
      </p>

      {status === 'success' ? (
        <div className="flex items-center gap-2 text-neutral-950 bg-neutral-50 border border-neutral-950 px-3 py-2.5 text-xs font-medium rounded-xl">
          <Check className="w-4 h-4 shrink-0" />
          <span>Subscription confirmed. Welcome.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-1 pt-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter client email address"
            required
            disabled={status === 'loading'}
            className="bg-white text-neutral-900 placeholder-neutral-400 text-xs px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-950 flex-1 min-w-0 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-neutral-950 text-white text-[10px] uppercase tracking-[0.15em] font-bold px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {status === 'loading' ? 'Verifying...' : 'Join'}
          </button>
        </form>
      )}
    </div>
  );
};
