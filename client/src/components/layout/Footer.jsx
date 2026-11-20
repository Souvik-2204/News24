import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Mail, Shield, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await api.post('/news/newsletter', { email });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-navy-950 border-t border-navy-800 text-slate-400 text-sm mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bureau Grid & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12 border-b border-navy-850">
          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-vanguard-red text-white font-black text-lg">
                V
              </div>
              <span className="text-xl font-headline font-black tracking-tight text-white">
                NEWS<span className="text-vanguard-red">24</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Global Television News Network & Digital Newspaper. Uncompromising investigations,
              real-time geopolitical intelligence, and multi-tier subscriber dossiers broadcasting 24/7/365.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 block mb-1">
                Global News Bureaux:
              </span>
              <p className="text-xs text-slate-500 font-mono">
                Washington â€¢ London â€¢ New Delhi â€¢ Geneva â€¢ Singapore â€¢ Tokyo
              </p>
            </div>
          </div>

          {/* Categories Quick Nav */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <p className="font-headline font-black text-slate-200 uppercase tracking-widest text-[11px] mb-3 text-red-500">
                Desks
              </p>
              <ul className="space-y-2">
                <li><Link to="/category/politics" className="hover:text-white transition">Politics Desk</Link></li>
                <li><Link to="/category/business" className="hover:text-white transition">Global Business</Link></li>
                <li><Link to="/category/technology" className="hover:text-white transition">Technology & AI</Link></li>
                <li><Link to="/category/world" className="hover:text-white transition">World Affairs</Link></li>
                <li><Link to="/category/sports" className="hover:text-white transition">Championship Sports</Link></li>
                <li><Link to="/category/opinion" className="hover:text-white transition">Opinion & Columns</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-headline font-black text-slate-200 uppercase tracking-widest text-[11px] mb-3 text-amber-500">
                Membership
              </p>
              <ul className="space-y-2">
                <li><Link to="/pricing" className="hover:text-white transition">Subscription Plans</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Bronze Access (â‚¹99)</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Silver Access (â‚¹199)</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Gold VIP Pass (â‚¹399)</Link></li>
                <li><Link to="/profile" className="hover:text-white transition">Subscriber Portal</Link></li>
              </ul>
            </div>
          </div>

          {/* Morning Intelligence Newsletter Form */}
          <div className="lg:col-span-4 bg-navy-900/80 p-5 rounded-xl border border-navy-800">
            <div className="flex items-center gap-2 text-white font-headline font-bold text-sm mb-2">
              <Mail className="w-4 h-4 text-vanguard-red" />
              <span>Morning Intelligence Briefing</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Delivered daily at 06:00 AM UTC. Crucial diplomatic wire updates, market briefings, and editorial leaks.
            </p>

            {status === 'success' ? (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-emerald-300 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>You are on the wire. Expect your first briefing tomorrow morning.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter executive email..."
                  required
                  className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-vanguard-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Join Intelligence Wire
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Credits & Razorpay Notice */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>Â© {new Date().getFullYear()} News24 Network Inc. All rights reserved. Registered Digital Publisher.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-navy-900 border border-navy-800 text-[11px] text-slate-300">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>Razorpay Subscriptions (Test Mode)</span>
            </span>
            <Link to="/pricing" className="hover:text-white transition">Editorial Code</Link>
            <Link to="/pricing" className="hover:text-white transition">Privacy Charter</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

