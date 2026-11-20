import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Crown, Shield, User, LogIn, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, isStaff } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-40 backdrop-blur-md bg-navy-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Custom NEWS24 Television News Emblem */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-vanguard-red via-red-600 to-amber-500 text-white font-black shadow-lg shadow-red-900/50 group-hover:scale-105 transition">
              <span className="text-xl font-headline tracking-tighter">N</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black font-headline tracking-tighter text-white group-hover:text-red-400 transition">
                  NEWS<span className="text-vanguard-red">24</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-vanguard-red text-white">
                  NEWS
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Global Television Network & Digital Newspaper
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search Trigger */}
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-semibold border border-navy-700 transition"
            title="Search articles"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Search News Wire...</span>
          </button>

          {/* Admin CMS Button (if Staff) */}
          {isStaff && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-900/60 to-navy-800 text-rose-200 hover:text-white border border-rose-700/50 text-xs font-bold uppercase tracking-wider transition"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Newsroom CMS</span>
            </Link>
          )}

          {/* Pricing / Subscribe CTA */}
          <Link
            to="/pricing"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-navy-950 text-xs font-black uppercase tracking-wider shadow-md shadow-yellow-950/40 transition"
          >
            <Crown className="w-3.5 h-3.5 fill-current" />
            <span>Subscribe</span>
          </Link>

          {/* User Profile or Login */}
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-800 text-slate-200 border border-transparent hover:border-navy-700 transition"
              title="View Account & Subscription"
            >
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-vanguard-red/60"
              />
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold transition border border-navy-700"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

