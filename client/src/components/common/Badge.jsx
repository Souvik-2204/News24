import React from 'react';
import { Lock, Zap, Radio } from 'lucide-react';

export function TierBadge({ tier, className = '' }) {
  if (!tier || tier === 'FREE') return null;

  const styles = {
    BRONZE: 'bg-amber-950/80 text-amber-300 border-amber-600/50 shadow-amber-950/50',
    SILVER: 'bg-slate-800 text-slate-200 border-slate-400/50 shadow-slate-900/50',
    GOLD: 'bg-yellow-950/90 text-yellow-300 border-yellow-500/60 shadow-yellow-900/50',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${styles[tier] || styles.BRONZE} ${className}`}
    >
      <Lock className="w-3 h-3" />
      <span>{tier}</span>
    </span>
  );
}

export function LiveBadge({ count = 0, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white animate-pulse ${className}`}>
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
      <Radio className="w-3 h-3" />
      <span>LIVE</span>
      {count > 0 && <span className="opacity-90">({count})</span>}
    </span>
  );
}

export function BreakingBadge({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-vanguard-red text-white text-xs font-black uppercase tracking-widest shadow-md shadow-red-900/50 ${className}`}>
      <Zap className="w-3 h-3 fill-current" />
      <span>BREAKING</span>
    </span>
  );
}

export function CategoryBadge({ category, className = '' }) {
  if (!category) return null;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-black uppercase tracking-widest rounded text-white shadow-sm ${className}`}
      style={{ backgroundColor: category.color || '#e50914' }}
    >
      {category.name}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const styles = {
    DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
    PENDING_REVIEW: 'bg-amber-950/80 text-amber-300 border-amber-600/50 animate-pulse',
    IN_REVIEW: 'bg-blue-950/80 text-blue-300 border-blue-600/50',
    REVISIONS_REQUESTED: 'bg-orange-950/80 text-orange-300 border-orange-600/50',
    APPROVED: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
    PUBLISHED: 'bg-red-950/80 text-red-300 border-red-600/50',
    REJECTED: 'bg-rose-950/80 text-rose-300 border-rose-600/50',
    ARCHIVED: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  const labels = {
    DRAFT: 'Draft',
    PENDING_REVIEW: 'Pending Approval',
    IN_REVIEW: 'In Review',
    REVISIONS_REQUESTED: 'Revisions Requested',
    APPROVED: 'Approved',
    PUBLISHED: 'Published',
    REJECTED: 'Rejected',
    ARCHIVED: 'Archived',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.DRAFT} ${className}`}>
      {labels[status] || status}
    </span>
  );
}
