import React from 'react';
import { Link } from 'react-router-dom';
import { TierBadge, CategoryBadge, BreakingBadge, LiveBadge } from '../common/Badge';
import { Clock } from 'lucide-react';

export default function NewsCard({ article, horizontal = false, compact = false }) {
  if (!article) return null;

  if (horizontal) {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-navy-900 border border-navy-800 hover:border-vanguard-red/40 hover:bg-navy-850 transition duration-300"
      >
        <div className="sm:w-1/3 aspect-[16/10] overflow-hidden rounded-lg bg-navy-950 shrink-0 relative">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <CategoryBadge category={article.category} />
          </div>
          <div className="absolute top-2 right-2">
            <TierBadge tier={article.accessTier} />
          </div>
        </div>

        <div className="sm:w-2/3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {article.isBreaking && <BreakingBadge />}
              {article.isLive && <LiveBadge />}
            </div>
            <h3 className="text-base font-bold font-headline text-white group-hover:text-red-400 line-clamp-2 leading-tight mb-1.5">
              {article.title}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 font-serif leading-relaxed mb-3">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-navy-800">
            {article.author && <span className="font-semibold text-slate-300">{article.author.name}</span>}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTimeMinutes} min
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden bg-navy-900 border border-navy-800 hover:border-vanguard-red/40 hover:bg-navy-850 transition duration-300 shadow-lg"
    >
      <div className="aspect-[16/10] overflow-hidden bg-navy-950 relative">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1 z-10">
          <CategoryBadge category={article.category} />
        </div>
        <div className="absolute top-2 right-2 z-10">
          <TierBadge tier={article.accessTier} />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {article.isBreaking && <BreakingBadge />}
            {article.isLive && <LiveBadge />}
          </div>
          <h3 className="text-base font-bold font-headline text-white group-hover:text-red-400 line-clamp-2 leading-tight mb-2">
            {article.title}
          </h3>
          {!compact && (
            <p className="text-xs text-slate-400 line-clamp-2 font-serif leading-relaxed mb-3">
              {article.excerpt}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-navy-800 mt-2">
          {article.author && <span className="font-semibold text-slate-300">{article.author.name}</span>}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTimeMinutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
