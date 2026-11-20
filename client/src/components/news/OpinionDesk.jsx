import React from 'react';
import { Link } from 'react-router-dom';
import { Feather, Quote } from 'lucide-react';
import { TierBadge } from '../common/Badge';

export default function OpinionDesk({ articles }) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="my-12 p-8 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-purple-900/40 shadow-2xl">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-950 border border-purple-800/60 text-purple-400">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-headline font-black text-white tracking-tight uppercase">
              OPINION & EDITORIAL BOARD
            </h2>
            <p className="text-xs text-slate-400">
              Perspectives, intellectual essays, and dissents from Chief Columnists.
            </p>
          </div>
        </div>

        <Link
          to="/category/opinion"
          className="text-xs font-bold text-purple-400 hover:text-white uppercase tracking-wider transition"
        >
          All Opinions →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((item) => (
          <Link
            key={item.id}
            to={`/article/${item.slug}`}
            className="group flex flex-col justify-between p-5 rounded-xl bg-navy-950/80 border border-navy-800 hover:border-purple-600/50 hover:bg-navy-900 transition duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <Quote className="w-6 h-6 text-purple-500/60" />
                <TierBadge tier={item.accessTier} />
              </div>

              <h3 className="text-base font-bold font-headline text-white group-hover:text-purple-300 line-clamp-3 mb-4 leading-snug">
                "{item.title}"
              </h3>

              <p className="text-xs text-slate-400 line-clamp-3 font-serif leading-relaxed mb-4">
                {item.excerpt}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-navy-800">
              <img
                src={item.author?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                alt={item.author?.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-600/40"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{item.author?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">Vanguard Editorialist</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
