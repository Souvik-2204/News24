import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create reader account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-vanguard-red via-red-600 to-amber-500 text-white font-black text-2xl shadow-lg shadow-red-950 mb-2">
            V
          </div>
          <h1 className="text-2xl font-black font-headline text-white tracking-tight">
            Create Reader Account
          </h1>
          <p className="text-xs text-slate-400">
            Join the NEWS24 network. Read breaking dispatches and upgrade to investigative dossiers anytime.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-300 text-xs font-bold flex items-center gap-2">
            <span>âš ï¸</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-medium"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-medium"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-300 font-bold uppercase tracking-wider">
                  Password *
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-medium"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-medium"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${password.length >= 6 ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Minimum 6 characters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-3.5 h-3.5 ${password && password === confirmPassword ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-950 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Complete Free Registration'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-navy-800 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1">
            <span>Sign In to NEWS24</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

