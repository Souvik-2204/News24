import React, { useState, useEffect } from 'react';
import { Radio, TrendingUp, TrendingDown, Clock, Globe } from 'lucide-react';

export default function TopBroadcastBar() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }) + ' | ' + now.toLocaleTimeString('en-US', { hour12: false }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const marketIndices = [
    { name: 'SENSEX', val: '81,420.30', change: '+0.84%', up: true },
    { name: 'NIFTY 50', val: '24,860.15', change: '+0.72%', up: true },
    { name: 'NASDAQ', val: '18,940.60', change: '+1.15%', up: true },
    { name: 'BRENT CRUDE', val: '$82.40/bbl', change: '-0.38%', up: false },
    { name: 'GOLD', val: '$2,710/oz', change: '+0.45%', up: true },
    { name: 'USD/INR', val: '84.42', change: '-0.05%', up: false },
  ];

  return (
    <div className="bg-navy-950 border-b border-navy-800 text-[11px] text-slate-300 px-4 py-1.5 flex flex-wrap items-center justify-between gap-3 font-mono">
      {/* Broadcast State & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-red-500 font-black tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <Radio className="w-3.5 h-3.5 text-red-500" />
          <span className="font-sans font-extrabold tracking-widest">NETWORK ON AIR</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{timeStr}</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <Globe className="w-3 h-3 text-slate-500" />
          <span>EDITION: GLOBAL 24/7</span>
        </div>
      </div>

      {/* Financial Market Feed */}
      <div className="hidden lg:flex items-center gap-5 overflow-hidden">
        {marketIndices.map((m) => (
          <div key={m.name} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-slate-400 font-bold">{m.name}</span>
            <span className="text-slate-200">{m.val}</span>
            <span
              className={`flex items-center text-[10px] font-bold ${
                m.up ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {m.up ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
              {m.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
