import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, Flame, Sparkles } from 'lucide-react';

export default function CategoryNav() {
  const categories = [
    { name: 'Politics', slug: 'politics', color: '#e50914' },
    { name: 'Business', slug: 'business', color: '#2563eb' },
    { name: 'Technology', slug: 'technology', color: '#0891b2' },
    { name: 'World', slug: 'world', color: '#059669' },
    { name: 'Sports', slug: 'sports', color: '#ea580c' },
    { name: 'Opinion', slug: 'opinion', color: '#7c3aed' },
  ];

  return (
    <nav className="bg-navy-950/90 border-b border-navy-800 text-xs font-headline font-black tracking-wider uppercase select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between overflow-x-auto no-scrollbar py-2 gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                isActive
                  ? 'bg-vanguard-red text-white'
                  : 'text-slate-300 hover:text-white hover:bg-navy-850'
              }`
            }
          >
            All Stories
          </NavLink>

          {categories.map((cat) => (
            <NavLink
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                  isActive
                    ? 'bg-navy-800 text-white border-b-2 border-vanguard-red'
                    : 'text-slate-400 hover:text-white hover:bg-navy-850'
                }`
              }
            >
              {cat.name}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0 pl-4 border-l border-navy-800">
          <NavLink
            to="/search?tier=GOLD"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-extrabold text-yellow-400 bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/30 transition whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3" />
            <span>Investigative Vault</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
