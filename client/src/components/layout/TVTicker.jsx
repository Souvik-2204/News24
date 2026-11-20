import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Radio } from 'lucide-react';
import api from '../../services/api';

export default function TVTicker() {
  const [tickerItems, setTickerItems] = useState([]);

  useEffect(() => {
    async function loadTicker() {
      try {
        const res = await api.get('/news/ticker');
        if (res.ticker && res.ticker.length > 0) {
          setTickerItems(res.ticker);
        }
      } catch (err) {
        console.error('Ticker error:', err);
      }
    }
    loadTicker();
    const interval = setInterval(loadTicker, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (!tickerItems || tickerItems.length === 0) return null;

  // Duplicate items for seamless continuous marquee loop
  const displayItems = [...tickerItems, ...tickerItems];

  return (
    <div className="bg-navy-950 border-b border-navy-800 flex items-stretch h-10 overflow-hidden relative select-none">
      {/* High-impact TV Breaking News Strap */}
      <div className="flex items-center gap-2 bg-gradient-to-r from-red-700 via-vanguard-red to-red-600 text-white px-4 shrink-0 z-20 shadow-lg font-headline font-black tracking-wider uppercase text-xs">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span className="whitespace-nowrap">BREAKING NEWS</span>
      </div>

      {/* Marquee Track */}
      <div className="flex-1 overflow-hidden relative flex items-center bg-navy-900/60">
        <div className="animate-ticker-marquee flex items-center gap-8 pl-4">
          {displayItems.map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              to={`/article/${item.slug}`}
              className="flex items-center gap-2.5 text-xs text-slate-200 hover:text-white transition group whitespace-nowrap"
            >
              {item.category && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: item.category.color || '#e50914' }}
                >
                  {item.category.name}
                </span>
              )}
              {item.isLive && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-500 uppercase">
                  <Radio className="w-3 h-3" />
                  LIVE
                </span>
              )}
              <span className="font-semibold group-hover:underline">
                {item.title}
              </span>
              <span className="text-slate-600 font-bold">///</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
