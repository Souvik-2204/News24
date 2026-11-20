import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function PaywallBanner({ requiredTier, userTier }) {
  const tierColors = {
    BRONZE: 'from-amber-600/20 via-navy-900 to-amber-950/40 border-amber-500/40 text-amber-400',
    SILVER: 'from-slate-500/20 via-navy-900 to-slate-900/60 border-slate-400/40 text-slate-300',
    GOLD: 'from-yellow-500/20 via-navy-900 to-yellow-950/40 border-yellow-500/50 text-yellow-400',
  };

  const planNames = {
    BRONZE: 'Bronze Access',
    SILVER: 'Silver Access',
    GOLD: 'Gold All-Access',
  };

  const prices = {
    BRONZE: 'â‚¹99/mo',
    SILVER: 'â‚¹199/mo',
    GOLD: 'â‚¹399/mo',
  };

  return (
    <div className="relative my-8 overflow-hidden rounded-2xl border border-navy-700 bg-gradient-to-b from-navy-900 to-navy-950 p-8 text-center shadow-2xl">
      {/* Background glow effect */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-vanguard-red to-amber-500 text-white shadow-lg mb-6">
          <Lock className="w-8 h-8" />
        </div>

        <div className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-black tracking-widest uppercase bg-navy-800 text-yellow-400 border border-yellow-500/30">
          {requiredTier} EXCLUSIVE INVESTIGATION
        </div>

        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
          This Story is Reserved for {planNames[requiredTier] || 'Premium'} Subscribers
        </h3>

        <p className="text-slate-300 text-base md:text-lg mb-6 leading-relaxed">
          Unlock unredacted investigative files, global macroeconomic dossiers, and live broadcast intelligence.
          Support fearless independent newsroom journalism starting at just {prices[requiredTier] || 'â‚¹99/mo'}.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left text-sm text-slate-300">
          <div className="flex items-center gap-2 bg-navy-850/80 p-3 rounded-lg border border-navy-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full unedited dossier</span>
          </div>
          <div className="flex items-center gap-2 bg-navy-850/80 p-3 rounded-lg border border-navy-700">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
            <span>Zero advertising</span>
          </div>
          <div className="flex items-center gap-2 bg-navy-850/80 p-3 rounded-lg border border-navy-700">
            <Lock className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Cancel anytime</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black text-white bg-gradient-to-r from-vanguard-red via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 shadow-lg shadow-red-900/50 hover:shadow-red-800/80 transition-all text-base uppercase tracking-wider"
          >
            <span>Upgrade to {requiredTier} Plan</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 transition border border-navy-700"
          >
            Already a member? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

