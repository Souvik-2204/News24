import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, Edit3, Award, Users, ChevronDown, Check, LogOut } from 'lucide-react';

export default function QuickDemoSwitcher() {
  const { user, demoSwitch, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roles = [
    {
      key: 'admin',
      role: 'SUPER_ADMIN',
      name: 'Elena Rostova',
      label: 'Super Admin',
      icon: Shield,
      color: 'text-red-400 bg-red-950/60 border-red-800/50',
      desc: 'Master system control, users & finance',
    },
    {
      key: 'editor',
      role: 'CHIEF_EDITOR',
      name: 'Marcus Vance',
      label: 'Chief Editor',
      icon: Award,
      color: 'text-purple-400 bg-purple-950/60 border-purple-800/50',
      desc: 'Approve, reject & publish all articles',
    },
    {
      key: 'section',
      role: 'SECTION_EDITOR',
      name: 'Amara Chen',
      label: 'Section Editor',
      icon: Edit3,
      color: 'text-blue-400 bg-blue-950/60 border-blue-800/50',
      desc: 'Reviews Politics desk submissions',
    },
    {
      key: 'author',
      role: 'AUTHOR',
      name: 'David Sterling',
      label: 'Author/Journalist',
      icon: Edit3,
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50',
      desc: 'Creates & submits articles (Maker)',
    },
    {
      key: 'gold',
      role: 'SUBSCRIBER',
      name: 'Rajesh Malhotra',
      label: 'Gold Subscriber',
      icon: UserCheck,
      color: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/50',
      desc: 'All-Access VIP (Gold/Silver/Bronze/Free)',
    },
    {
      key: 'silver',
      role: 'SUBSCRIBER',
      name: 'Samantha Grey',
      label: 'Silver Subscriber',
      icon: UserCheck,
      color: 'text-slate-300 bg-slate-900 border-slate-700',
      desc: 'Silver + Bronze + Free articles',
    },
    {
      key: 'bronze',
      role: 'SUBSCRIBER',
      name: 'Vikram Joshi',
      label: 'Bronze Subscriber',
      icon: UserCheck,
      color: 'text-amber-400 bg-amber-950/60 border-amber-800/50',
      desc: 'Bronze + Free articles',
    },
  ];

  const handleSwitch = async (roleKey) => {
    try {
      setSwitching(true);
      await demoSwitch(roleKey);
      setIsOpen(false);
    } catch (err) {
      alert('Demo switch error: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 hover:border-vanguard-red/60 transition shadow-sm"
        title="Quick Role Switcher for instant demo evaluation"
      >
        <Users className="w-3.5 h-3.5 text-vanguard-red" />
        <span className="hidden sm:inline">Role Switch:</span>
        <span className="font-extrabold text-white">
          {user ? `${user.role}` : 'Guest'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-navy-900 border border-navy-700 rounded-xl shadow-2xl z-50 p-2 overflow-hidden backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-navy-800 mb-2">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Demo Switcher (1-Click Login)
            </p>
            <p className="text-[11px] text-slate-400">
              Instantly toggle roles to test Maker-Checker and Paywall tiers.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-1">
            {roles.map((r) => {
              const Icon = r.icon;
              const isCurrent = user && user.role === r.role && (
                (r.key === 'gold' && user.subscriptionTier === 'GOLD') ||
                (r.key === 'silver' && user.subscriptionTier === 'SILVER') ||
                (r.key === 'bronze' && user.subscriptionTier === 'BRONZE') ||
                (!['gold', 'silver', 'bronze'].includes(r.key))
              );

              return (
                <button
                  key={r.key}
                  disabled={switching}
                  onClick={() => handleSwitch(r.key)}
                  className={`w-full text-left p-2.5 rounded-lg border transition flex items-start gap-3 ${
                    isCurrent
                      ? 'bg-navy-800 border-vanguard-red/50'
                      : 'hover:bg-navy-850 border-transparent hover:border-navy-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-md border ${r.color} shrink-0 mt-0.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{r.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-navy-800 text-slate-300">
                        {r.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{r.desc}</p>
                  </div>
                  {isCurrent && <Check className="w-4 h-4 text-emerald-400 shrink-0 self-center" />}
                </button>
              );
            })}
          </div>

          {user && (
            <div className="pt-2 mt-2 border-t border-navy-800">
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-950/40 rounded-lg transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out to Guest</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
