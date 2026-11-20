import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Lock, Mail, Eye, EyeOff, KeyRound, Copy, CheckCheck } from 'lucide-react';

const CMS_ACCOUNTS = [
  { emoji: '👑', role: 'Super Admin',      email: 'admin@news24.com',   password: 'Admin@123',   color: 'text-red-400',    badge: 'Full Control' },
  { emoji: '📰', role: 'Chief Editor',     email: 'editor@news24.com',  password: 'Editor@123',  color: 'text-purple-400', badge: 'Approve & Publish' },
  { emoji: '🏛️', role: 'Section Editor',   email: 'section@news24.com', password: 'Section@123', color: 'text-blue-400',   badge: 'Category Desk' },
  { emoji: '✍️', role: 'Author / Maker',   email: 'author@news24.com',  password: 'Author@123',  color: 'text-emerald-400',badge: 'Draft & Submit' },
];

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  return (
    <button type="button" onClick={handle} className="ml-1 p-0.5 rounded text-slate-500 hover:text-slate-200 transition">
      {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

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
      const isStaff = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'AUTHOR'].includes(res?.user?.role);
      if (isStaff) {
        navigate('/admin');
      } else {
        setError('Access denied: This account does not have newsroom CMS permissions.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
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
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 gap-6">

      {/* Login Card */}
      <div className="max-w-md w-full bg-navy-900 border border-red-800/60 rounded-3xl p-8 shadow-2xl shadow-red-950/40 space-y-6 relative overflow-hidden">
        {/* Top glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-vanguard-red via-red-500 to-amber-500" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-700/80 text-red-500 flex items-center justify-center mx-auto shadow-lg shadow-red-950">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block">
            CLASSIFIED TERMINAL
          </span>
          <h1 className="text-2xl font-black font-headline text-white tracking-tight">
            NEWS<span className="text-vanguard-red">24</span> Newsroom CMS
          </h1>
          <p className="text-xs text-slate-400">
            Editorial maker-checker access, article publishing, and user permissions
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-300 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
              Newsroom Staff ID (Email)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@news24.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-300 font-bold uppercase tracking-wider">
                Access Security Key (Password)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Verifying Security Clearance...' : 'Authenticate & Open CMS'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-navy-800">
          <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
            ← Return to Public NEWS24 Broadcast
          </Link>
        </div>
      </div>

      {/* Credentials Reference Card */}
      <div className="max-w-md w-full bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black uppercase tracking-wider text-amber-400">CMS Login Credentials</span>
        </div>
        <p className="text-[11px] text-slate-400">Click any row to auto-fill the form above, or copy individual values.</p>

        <div className="space-y-2">
          {CMS_ACCOUNTS.map((acc) => (
            <div
              key={acc.email}
              onClick={() => fillCredentials(acc)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950 border border-navy-800 hover:border-navy-600 cursor-pointer transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm shrink-0">{acc.emoji}</span>
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${acc.color}`}>{acc.role}</p>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 flex-wrap">
                    <span>{acc.email}</span>
                    <CopyBtn text={acc.email} />
                    <span className="text-slate-600">|</span>
                    <span>{acc.password}</span>
                    <CopyBtn text={acc.password} />
                  </div>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 border border-navy-700 px-2 py-1 rounded-lg font-bold uppercase shrink-0 ml-2">
                Fill
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
