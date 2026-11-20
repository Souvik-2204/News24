import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, Mail, Shield, Eye, EyeOff, ArrowRight, Copy, CheckCheck } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    emoji: '👑',
    role: 'Super Admin',
    email: 'admin@news24.com',
    password: 'Admin@123',
    note: 'Full system control',
    color: 'border-red-800/60 bg-red-950/30',
    badge: 'bg-red-900/70 text-red-200',
  },
  {
    emoji: '📰',
    role: 'Chief Editor',
    email: 'editor@news24.com',
    password: 'Editor@123',
    note: 'Approve & publish articles',
    color: 'border-purple-800/50 bg-purple-950/20',
    badge: 'bg-purple-900/60 text-purple-200',
  },
  {
    emoji: '🏛️',
    role: 'Section Editor',
    email: 'section@news24.com',
    password: 'Section@123',
    note: 'Manage assigned categories',
    color: 'border-blue-800/50 bg-blue-950/20',
    badge: 'bg-blue-900/60 text-blue-200',
  },
  {
    emoji: '✍️',
    role: 'Author / Journalist',
    email: 'author@news24.com',
    password: 'Author@123',
    note: 'Create & submit articles',
    color: 'border-emerald-800/50 bg-emerald-950/20',
    badge: 'bg-emerald-900/60 text-emerald-200',
  },
  {
    emoji: '💎',
    role: 'Gold Subscriber',
    email: 'subscriber@news24.com',
    password: 'Subscriber@123',
    note: 'All premium content access',
    color: 'border-yellow-700/50 bg-yellow-950/20',
    badge: 'bg-yellow-900/60 text-yellow-200',
  },
  {
    emoji: '🥈',
    role: 'Silver Subscriber',
    email: 'silver.user@news24.com',
    password: 'Subscriber@123',
    note: 'Free + Bronze + Silver access',
    color: 'border-slate-600/50 bg-slate-900/30',
    badge: 'bg-slate-800/70 text-slate-200',
  },
  {
    emoji: '🥉',
    role: 'Bronze Subscriber',
    email: 'bronze.user@news24.com',
    password: 'Subscriber@123',
    note: 'Free + Bronze access',
    color: 'border-orange-800/40 bg-orange-950/15',
    badge: 'bg-orange-900/60 text-orange-200',
  },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${text}`}
      className="ml-1 p-0.5 rounded text-slate-500 hover:text-slate-200 transition"
    >
      {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      const userRole = res?.user?.role;
      const isStaff = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'AUTHOR'].includes(userRole);
      if (isStaff && redirect === '/') {
        navigate('/admin');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError(null);
  };

  return (
    <div className="min-h-[90vh] flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Sign-In Form */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-vanguard-red via-red-600 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-red-950">
              N
            </div>
            <div>
              <h1 className="text-2xl font-black font-headline text-white tracking-tight">
                Sign In to <span className="text-vanguard-red">NEWS24</span>
              </h1>
              <p className="text-xs text-slate-400">Access subscriber investigations or newsroom CMS</p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-300 text-xs font-bold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                Email / Login ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@news24.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-medium"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-medium"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
            <span>New to NEWS24?</span>
            <Link to="/register" className="font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold block mb-0.5">🔒 Maker-Checker Security:</span>
            Authors create & submit articles. Chief Editors approve and publish them. Roles enforce backend permissions.
          </div>
        </div>

        {/* Right: Demo Credentials Reference */}
        <div className="lg:col-span-7 bg-gradient-to-b from-navy-900 to-navy-950 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">Demo Credentials</span>
          </div>
          <h2 className="text-lg font-black font-headline text-white">All Login IDs & Passwords</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Use these credentials to log in. Click an account row to auto-fill the form, or copy individual values using the copy icon.
          </p>

          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.email}
                className={`p-3 rounded-xl border ${acc.color} transition cursor-pointer hover:brightness-110`}
                onClick={() => fillCredentials(acc)}
                title={`Click to auto-fill ${acc.role}`}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{acc.emoji}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-white">{acc.role}</p>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${acc.badge}`}>
                          {acc.note}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 flex-wrap gap-x-4 gap-y-0.5">
                        <span className="flex items-center text-[11px] text-slate-300 font-mono">
                          {acc.email}
                          <CopyBtn text={acc.email} />
                        </span>
                        <span className="flex items-center text-[11px] text-slate-300 font-mono">
                          {acc.password}
                          <CopyBtn text={acc.password} />
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[9px] text-slate-500 font-bold uppercase tracking-wider border border-navy-700 px-2 py-1 rounded-lg">
                    Click to Fill
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 p-3 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-500">
            <span className="text-slate-300 font-bold">Admin CMS:</span> Staff roles (Super Admin, Chief Editor, Section Editor, Author) are redirected to <code className="text-red-400">/admin</code> after login.
            <span className="ml-1 text-slate-300 font-bold">Subscribers</span> access the public site with premium content unlocked.
          </div>
        </div>

      </div>
    </div>
  );
}
