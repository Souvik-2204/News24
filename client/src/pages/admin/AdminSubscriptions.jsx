import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TierBadge } from '../../components/common/Badge';
import { CreditCard, CheckCircle, Clock, ShieldCheck, Edit3 } from 'lucide-react';

export default function AdminSubscriptions() {
  const { isAdmin } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, planRes] = await Promise.all([
        api.get('/admin/subscribers'),
        api.get('/subscriptions/plans'),
      ]);
      setSubscriptions(subRes.subscriptions || []);
      setPlans(planRes.plans || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePrice = async (planId, newMonthly, newAnnual) => {
    try {
      await api.put(`/admin/plans/${planId}`, {
        priceMonthly: parseInt(newMonthly),
        priceAnnual: parseInt(newAnnual),
      });
      setMsg({ type: 'success', text: 'Plan pricing updated.' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
          Subscriptions & Revenue Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor active subscriber cohorts, Razorpay test transactions, and plan pricing configurations.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${msg.type === 'success' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-700 text-rose-300'}`}>
          {msg.text}
        </div>
      )}

      {/* Plans Config Grid */}
      <div>
        <h2 className="text-sm font-black font-headline uppercase text-white mb-4">
          Configured Subscription Plans ({plans.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-headline font-black text-white text-base">{p.name}</span>
                  <TierBadge tier={p.tier} />
                </div>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{p.description}</p>

                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Monthly:</span>
                    <span className="font-black text-white">₹{p.priceMonthly}/mo</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Annual:</span>
                    <span className="font-black text-amber-400">₹{p.priceAnnual}/yr</span>
                  </div>
                </div>
              </div>

              {isAdmin && p.tier !== 'FREE' && (
                <button
                  onClick={() => {
                    const m = window.prompt(`New Monthly Price (INR) for ${p.name}:`, p.priceMonthly);
                    const a = window.prompt(`New Annual Price (INR) for ${p.name}:`, p.priceAnnual);
                    if (m && a) handleUpdatePrice(p.id, m, a);
                  }}
                  className="w-full py-2 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure Pricing</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Subscribers Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-navy-800">
          <h2 className="text-base font-black font-headline uppercase text-white">
            Subscriber Directory ({subscriptions.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Loading subscriber roster...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-navy-800">
                <tr>
                  <th className="py-4 px-6">Subscriber</th>
                  <th className="py-4 px-4">Plan & Tier</th>
                  <th className="py-4 px-4">Billing Cycle</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Period End Date</th>
                  <th className="py-4 px-6 text-right">Latest Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-navy-850/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={sub.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={sub.user?.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{sub.user?.name}</p>
                          <p className="text-slate-400 text-xs font-mono">{sub.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <TierBadge tier={sub.plan?.tier} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-bold uppercase text-[11px]">
                      {sub.billingCycle}
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        sub.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-rose-950 text-rose-300 border border-rose-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono text-xs text-amber-400">
                      {sub.payments?.[0]?.invoiceNumber || 'INV-2026-PENDING'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
