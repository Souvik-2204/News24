import React from 'react';
import { Link } from 'react-router-dom';
import { BreakingBadge, LiveBadge, TierBadge, CategoryBadge } from '../common/Badge';
import { Clock, Radio, Eye, ArrowRight, Play } from 'lucide-react';

export default function HeroBroadcast({ leadStory, liveStories, topStories }) {
  if (!leadStory) return null;

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Lead Story (Broadcast Television Studio Look) */}
        <div className="lg:col-span-8">
          <Link
            to={`/article/${leadStory.slug}`}
            className="group relative block rounded-2xl overflow-hidden border border-navy-850 bg-navy-900 shadow-2xl hover:border-vanguard-red/50 transition-all duration-300"
          >
            {/* Aspect Ratio Container for Cinematic Visual */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy-950">
              <img
                src={leadStory.featuredImage}
                alt={leadStory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Studio TV Vignette & Lower Third Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-transparent to-transparent" />

              {/* Top Badges & Live Status */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
                <div className="flex items-center gap-2">
                  {leadStory.isBreaking && <BreakingBadge />}
                  {leadStory.isLive && <LiveBadge count={leadStory.liveUpdatesCount} />}
                  <CategoryBadge category={leadStory.category} />
                </div>
                <TierBadge tier={leadStory.accessTier} />
              </div>

              {/* Lower Third TV Newsroom Strap */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-red-400 text-xs font-black uppercase tracking-wider mb-3 border border-red-500/30">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-vanguard-red" />
                  <span>SPECIAL BROADCAST REPORT</span>
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black font-headline text-white tracking-tight leading-tight md:leading-none mb-3 group-hover:text-red-400 transition">
                  {leadStory.title}
                </h1>

                <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-3xl mb-4 font-serif leading-relaxed">
                  {leadStory.subtitle || leadStory.excerpt}
                </p>

                {/* Author Byline & Telemetry */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 border-t border-slate-700/50 pt-3">
                  {leadStory.author && (
                    <div className="flex items-center gap-2">
                      <img
                        src={leadStory.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={leadStory.author.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30"
                      />
                      <span className="font-bold text-white">{leadStory.author.name}</span>
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{leadStory.readTimeMinutes} min read</span>
                  </span>
                  {leadStory.viewsCount > 0 && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{leadStory.viewsCount.toLocaleString()} views</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Live Desk / Wire Updates Column */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-navy-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <h2 className="text-sm font-headline font-black uppercase tracking-wider text-white">
                  LIVE DESK FEED
                </h2>
              </div>
              <span className="text-[11px] font-mono text-red-500 font-bold uppercase">
                REAL-TIME WIRE
              </span>
            </div>

            {/* List of Live Desk Stories */}
            <div className="space-y-4 flex-1">
              {(liveStories && liveStories.length > 0 ? liveStories : topStories.slice(0, 3)).map((item, idx) => (
                <Link
                  key={item.id}
                  to={`/article/${item.slug}`}
                  className="group block pb-3 border-b border-navy-850 last:border-0 hover:bg-navy-850/40 p-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {item.category && (
                      <span
                        className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: item.category.color || '#e50914' }}
                      >
                        {item.category.name}
                      </span>
                    )}
                    {item.isLive && <LiveBadge />}
                    <TierBadge tier={item.accessTier} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-vanguard-red line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                    <span>{item.author?.name}</span>
                    <span>•</span>
                    <span>{item.readTimeMinutes}m read</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Link to all live coverage */}
            <Link
              to="/search?tier=FREE"
              className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs font-bold text-red-400 hover:text-white uppercase tracking-wider transition"
            >
              <span>View Full News Wire</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
