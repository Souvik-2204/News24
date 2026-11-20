import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TierBadge } from '../components/common/Badge';
import {
  Check,
  Crown,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
} from 'lucide-react';

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'ANNUAL'
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/subscriptions/plans');
        setPlans(res.plans || []);
        setRazorpayKeyId(res.razorpayKeyId || 'rzp_test_vanguard_key');
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleCheckout = async (plan) => {
    if (!user) {
      navigate('/login?redirect=/pricing');
      return;
    }

    if (plan.tier === 'FREE') {
      alert('You are already registered for free access.');
      return;
    }

    try {
      setProcessingPlanId(plan.id);

      // 1. Create order on backend
      const orderRes = await api.post('/subscriptions/create-order', {
        planId: plan.id,
        billingCycle,
      });

      const { orderId, amount, currency, keyId } = orderRes;

      // 2. Razorpay Options
      const options = {
        key: keyId || razorpayKeyId,
        amount,
        currency,
        name: 'NEWS24 News Network',
        description: `${plan.name} (${billingCycle} Subscription)`,
        order_id: orderId.startsWith('order_sim_') ? undefined : orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#e50914',
        },
        handler: async function (response) {
          await verifyAndActivate({
            planId: plan.id,
            billingCycle,
            razorpayOrderId: response.razorpay_order_id || orderId,
            razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
            razorpaySignature: response.razorpay_signature,
          }, plan);
        },
        modal: {
          ondismiss: function () {
            setProcessingPlanId(null);
          },
        },
      };

      // If official Razorpay checkout script loaded on window, open it
      if (window.Razorpay && !orderId.startsWith('order_sim_')) {
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          alert('Payment Failed: ' + response.error.description);
          setProcessingPlanId(null);
        });
        rzp.open();
      } else {
        // Fallback / Sandbox Instant Verification Simulation (for seamless testing!)
        console.log('[Razorpay Test Simulator] Executing test mode confirmation...');
        await verifyAndActivate({
          planId: plan.id,
          billingCycle,
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpaySignature: `simulated_signature_${Date.now()}`,
        }, plan);
      }
    } catch (err) {
      alert('Checkout error: ' + err.message);
      setProcessingPlanId(null);
    }
  };

  const verifyAndActivate = async (payload, plan) => {
    try {
      const verifyRes = await api.post('/subscriptions/verify-payment', payload);
      await refreshUser();
      setCheckoutSuccess({
        plan,
        invoiceNumber: verifyRes.invoiceNumber,
        message: verifyRes.message,
      });
    } catch (err) {
      alert('Payment Verification Failed: ' + err.message);
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-amber-500 font-bold">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
          <span>INITIALIZING SUBSCRIPTION GATEWAY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Modal */}
      {checkoutSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-yellow-500/60 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-navy-950 flex items-center justify-center mx-auto font-black shadow-lg shadow-yellow-900/50">
              <Crown className="w-9 h-9 fill-current" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-yellow-950 text-yellow-400 border border-yellow-500/30">
              MEMBERSHIP ACTIVATED
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-headline text-white">
              Welcome to {checkoutSuccess.plan.name}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Your test payment via Razorpay was successfully verified. You now have unrestricted access to all articles up to the{' '}
              <strong className="text-yellow-400">{checkoutSuccess.plan.tier}</strong> tier.
            </p>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-xs text-left space-y-1 font-mono text-slate-300">
              <p><span className="text-slate-500">Invoice:</span> {checkoutSuccess.invoiceNumber}</p>
              <p><span className="text-slate-500">Status:</span> <span className="text-emerald-400">ACTIVE & VERIFIED</span></p>
              <p><span className="text-slate-500">Gateway:</span> Razorpay Subscriptions (Test Mode)</p>
            </div>

            <button
              onClick={() => {
                setCheckoutSuccess(null);
                navigate('/profile');
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-vanguard-red to-amber-600 hover:from-red-600 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950 transition"
            >
              Go to Subscriber Portal â†’
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-950/80 text-red-400 border border-red-800/40">
          <Crown className="w-3.5 h-3.5 fill-current" />
          <span>NEWS24 INDEPENDENT INVESTIGATIONS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black font-headline text-white tracking-tight">
          Choose Your Intelligence Tier
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-serif">
          Fearless, subscriber-funded journalism with zero corporate allegiance.
          Select the membership that suits your intelligence requirements.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-navy-900 border border-navy-800 mt-4">
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              billingCycle === 'MONTHLY'
                ? 'bg-vanguard-red text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('ANNUAL')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
              billingCycle === 'ANNUAL'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500 text-navy-950 font-black">
              Save ~16%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isGold = p.tier === 'GOLD';
          const isSilver = p.tier === 'SILVER';
          const isBronze = p.tier === 'BRONZE';
          const isCurrentPlan = user?.subscriptionTier === p.tier;

          const price = billingCycle === 'ANNUAL' ? p.priceAnnual : p.priceMonthly;
          const periodLabel = billingCycle === 'ANNUAL' ? '/year' : '/month';

          const cardTheme = isGold
            ? 'border-yellow-500/70 bg-gradient-to-b from-navy-900 via-navy-850 to-navy-900 shadow-2xl shadow-yellow-950/20'
            : isSilver
            ? 'border-slate-500/50 bg-navy-900'
            : isBronze
            ? 'border-amber-700/50 bg-navy-900'
            : 'border-navy-800 bg-navy-900/60';

          return (
            <div
              key={p.id}
              className={`relative rounded-3xl p-6 sm:p-7 border flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 ${cardTheme}`}
            >
              {isGold && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-navy-950 font-black text-[10px] uppercase tracking-widest shadow-md">
                  â˜… MOST POPULAR ALL-ACCESS
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-black font-headline text-white">{p.name}</h3>
                  <TierBadge tier={p.tier} />
                </div>

                <p className="text-xs text-slate-400 mb-6 leading-relaxed min-h-[36px]">
                  {p.description}
                </p>

                {/* Price Display */}
                <div className="pb-6 mb-6 border-b border-navy-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black font-headline text-white">
                      â‚¹{price}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{periodLabel}</span>
                  </div>
                  {billingCycle === 'ANNUAL' && price > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold block mt-1">
                      Includes 2 months free discount
                    </span>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs text-slate-300">
                  {p.features &&
                    p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Action Button */}
              <div>
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-navy-800 text-emerald-400 font-black text-xs uppercase tracking-wider border border-emerald-600/40 cursor-default"
                  >
                    Current Active Tier
                  </button>
                ) : p.tier === 'FREE' ? (
                  <Link
                    to={user ? '/' : '/register'}
                    className="block text-center w-full py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 font-black text-xs uppercase tracking-wider transition"
                  >
                    {user ? 'Current Standard' : 'Free Registration'}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled={processingPlanId === p.id}
                    onClick={() => handleCheckout(p)}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center justify-center gap-2 ${
                      isGold
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-navy-950 shadow-yellow-950/40'
                        : 'bg-vanguard-red hover:bg-red-600 text-white shadow-red-950/50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {processingPlanId === p.id ? 'Connecting...' : `Subscribe via Razorpay`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Access Hierarchy Guarantee Table */}
      <div className="mt-16 p-8 rounded-3xl bg-navy-900 border border-navy-800 shadow-xl max-w-4xl mx-auto">
        <h3 className="text-lg font-black font-headline text-white uppercase tracking-wider mb-2 text-center">
          Access Level Hierarchy Structure
        </h3>
        <p className="text-xs text-slate-400 text-center mb-6">
          Backend verified permissions ensure strict separation between free and paid investigations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-850">
            <p className="font-black text-white text-sm mb-1">FREE</p>
            <p className="text-slate-400">Public dispatches & breaking news wire</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/40">
            <p className="font-black text-amber-300 text-sm mb-1">BRONZE</p>
            <p className="text-slate-300">Free + Bronze economic dossiers (â‚¹99)</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-600/40">
            <p className="font-black text-slate-200 text-sm mb-1">SILVER</p>
            <p className="text-slate-300">Free + Bronze + Silver tech analyses (â‚¹199)</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-950/50 border border-yellow-500/50">
            <p className="font-black text-yellow-300 text-sm mb-1">GOLD</p>
            <p className="text-yellow-100">ALL stories + unredacted vaults (â‚¹399)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

