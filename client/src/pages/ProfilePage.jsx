import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TierBadge } from '../components/common/Badge';
import {
  User,
  CreditCard,
  Shield,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/subscriptions/my-status');
      setStatusData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStatus();
  }, [user]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you wish to cancel recurring renewal? You will retain access until the current period ends.')) {
      return;
    }

    try {
      setCancelling(true);
      const res = await api.post('/subscriptions/cancel');
      setMsg({ type: 'success', text: res.message });
      await refreshUser();
      fetchStatus();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setCancelling(false);
    }
  };

  if (!user) return null;

  const activeSub = statusData?.activeSubscription;
  const payments = statusData?.payments || [];
  const currentTier = user.subscriptionTier || 'FREE';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            Subscriber Account & Credentials
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your NEWS24 security clearances, active subscription tier, and Razorpay billing records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-navy-900 border border-navy-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 text-xs font-bold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${msg.type === 'success' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-700 text-rose-300'}`}>
          {msg.text}
        </div>
      )}

      {/* User Persona & Subscription Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-vanguard-red/60"
              />
              <div>
                <h2 className="text-lg font-bold text-white font-headline">{user.name}</h2>
                <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/50">
                    {user.role}
                  </span>
                  <TierBadge tier={currentTier} />
                </div>
              </div>
            </div>

            {user.bio && (
              <p className="text-xs text-slate-400 leading-relaxed font-serif p-3 rounded-xl bg-navy-950 border border-navy-850">
                "{user.bio}"
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-navy-800 text-xs text-slate-500 font-mono mt-6">
            Account Clearance: {user.role === 'SUPER_ADMIN' ? 'Level 5 (Unrestricted)' : 'Standard Broadcast Clearance'}
          </div>
        </div>

        {/* Current Active Plan Card */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black font-headline uppercase tracking-wider text-white">
                  Active Subscription Tier
                </h3>
              </div>
              <TierBadge tier={currentTier} />
            </div>

            {activeSub ? (
              <div className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <h4 className="text-xl font-black font-headline text-white">
                      {activeSub.plan?.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeSub.billingCycle} Billing â€¢ Status: <span className="text-emerald-400 font-bold">{activeSub.status}</span>
                    </p>
                  </div>
                  <span className="text-xl font-headline font-black text-amber-400">
                    â‚¹{activeSub.billingCycle === 'ANNUAL' ? activeSub.plan?.priceAnnual : activeSub.plan?.priceMonthly}
                    <span className="text-xs text-slate-500 font-normal">/{activeSub.billingCycle === 'ANNUAL' ? 'yr' : 'mo'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-xl bg-navy-950 border border-navy-850">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Start Date</span>
                    <span className="font-mono text-slate-300">{new Date(activeSub.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Period End</span>
                    <span className="font-mono text-slate-300">{new Date(activeSub.currentPeriodEnd).toLocaleDateString()}</span>
                  </div>
                </div>

                {activeSub.cancelAtPeriodEnd && (
                  <p className="text-xs text-amber-400 font-bold bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40">
                    âš ï¸ Recurring renewal cancelled. Your access remains active until {new Date(activeSub.currentPeriodEnd).toLocaleDateString()}.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-850 text-center space-y-2">
                <p className="text-sm font-bold text-white">Standard Free Reader Tier</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You currently have access to standard breaking news. Upgrade to Bronze, Silver, or Gold to unlock unredacted investigations.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-navy-800">
            <Link
              to="/pricing"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-navy-950 font-black text-xs uppercase tracking-wider shadow-md transition"
            >
              {activeSub ? 'Change Subscription Plan' : 'Upgrade to Premium Membership'}
            </Link>

            {activeSub && !activeSub.cancelAtPeriodEnd && (
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancel}
                className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 font-bold text-xs uppercase tracking-wider transition border border-navy-700"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Recurring Billing'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Razorpay Billing & Invoice History */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-navy-800">
          <h3 className="text-base font-black font-headline uppercase text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-vanguard-red" />
            <span>Razorpay Billing History & Tax Invoices</span>
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs">Loading ledger receipts...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No payment receipts on record. Paid subscription orders will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-navy-800">
                <tr>
                  <th className="py-4 px-6">Invoice Number</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Plan</th>
                  <th className="py-4 px-4">Amount Paid</th>
                  <th className="py-4 px-4">Method</th>
                  <th className="py-4 px-6 text-right">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850 font-mono">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-navy-850/50 transition">
                    <td className="py-4 px-6 font-bold text-amber-400">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-sans font-bold text-white">
                      {p.subscription?.plan?.name || 'Vanguard Subscription'}
                    </td>
                    <td className="py-4 px-4 font-bold text-white">
                      â‚¹{p.amount}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-sans text-xs">
                      {p.paymentMethod || 'UPI / Card'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-700">
                        {p.status}
                      </span>
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

