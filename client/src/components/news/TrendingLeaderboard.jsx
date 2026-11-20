import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye } from 'lucide-react';
import { TierBadge } from '../common/Badge';

export default function TrendingLeaderboard({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-navy-800">
        <Flame className="w-5 h-5 text-amber-500 fill-current" />
        <h2 className="text-base font-headline font-black uppercase tracking-wider text-white">
          MOST READ INTELLIGENCE
        </h2>
      </div>

      <div className="space-y-4">
        {articles.map((item, index) => (
          <Link
            key={item.id}
            to={`/article/${item.slug}`}
            className="group flex items-start gap-4 pb-4 border-b border-navy-850 last:border-0 hover:translate-x-1 transition duration-200"
          >
            {/* Big Numeric Leaderboard Badge */}
            <span className="text-3xl font-headline font-black text-slate-600 group-hover:text-vanguard-red transition select-none shrink-0 w-8">
              0{index + 1}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {item.category && (
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded text-white"
                    style={{ backgroundColor: item.category.color || '#e50914' }}
                  >
                    {item.category.name}
                  </span>
                )}
                <TierBadge tier={item.accessTier} />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-red-400 line-clamp-2 leading-snug">
                {item.title}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                {item.author && <span>{item.author.name}</span>}
                {item.viewsCount > 0 && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Eye className="w-3 h-3" />
                    {item.viewsCount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
