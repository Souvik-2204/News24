import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  CheckSquare,
  Users,
  DollarSign,
  TrendingUp,
  Radio,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get('/admin/analytics');
        setData(res);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-red-500 font-bold">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
          <span>Syncing newsroom telemetry...</span>
        </div>
      </div>
    );
  }

  const counts = data?.counts || {};
  const dailyTrends = data?.dailyTrends || [];
  const subscriptionChartData = data?.subscriptionChartData || [];
  const categoryChartData = data?.categoryChartData || [];
  const recentLogs = data?.recentLogs || [];

  const statCards = [
    {
      title: 'Published Stories',
      val: counts.publishedArticles || 0,
      sub: `${counts.totalArticles || 0} total in archive`,
      icon: FileText,
      color: 'from-blue-600 to-indigo-800',
    },
    {
      title: 'Pending Review Queue',
      val: counts.pendingArticles || 0,
      sub: 'Awaiting Maker-Checker decision',
      icon: CheckSquare,
      color: 'from-amber-600 to-red-700',
      badge: counts.pendingArticles > 0 ? 'Action Needed' : null,
      link: '/admin/queue',
    },
    {
      title: 'Active Paid Subscribers',
      val: counts.totalSubscribers || 0,
      sub: `${counts.totalUsers || 0} registered accounts`,
      icon: Users,
      color: 'from-emerald-600 to-teal-800',
    },
    {
      title: 'Gross Subscriber ARR',
      val: `₹${((counts.totalRevenue || 0) * 12).toLocaleString()}`,
      sub: `₹${(counts.totalRevenue || 0).toLocaleString()} captured this month`,
      icon: DollarSign,
      color: 'from-yellow-600 to-amber-800',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome & Broadcast Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-red-500">
              EDITORIAL DESK TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            Newsroom Command Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/articles/new"
            className="px-4 py-2 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-950 transition"
          >
            + Draft Story
          </Link>
          <Link
            to="/admin/queue"
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-bold text-xs uppercase tracking-wider transition"
          >
            Review Queue ({counts.pendingArticles || 0})
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="relative p-5 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl overflow-hidden group hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-black font-headline text-white tracking-tight">
                    {card.val}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-tr ${card.color} text-white shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {card.link && card.badge && (
                <Link
                  to={card.link}
                  className="mt-3 pt-3 border-t border-navy-800 flex items-center justify-between text-xs font-bold text-amber-400 hover:text-white transition"
                >
                  <span>{card.badge}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Views & Revenue Trend (Recharts AreaChart) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-black font-headline text-white uppercase tracking-wider">
                Audience Traffic & Monetization
              </h3>
              <p className="text-xs text-slate-400">Weekly page views vs subscription revenue</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2.5 h-2.5 rounded-full bg-vanguard-red" />
                Views
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Revenue (₹)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e50914" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e50914" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1021',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#e50914" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Tier Breakdown (Recharts PieChart) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black font-headline text-white uppercase tracking-wider mb-1">
              Active Tier Mix
            </h3>
            <p className="text-xs text-slate-400 mb-4">Gold vs Silver vs Bronze members</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {subscriptionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0a1021',
                      borderColor: '#1e293b',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-navy-800 text-center">
            {subscriptionChartData.map((item) => (
              <div key={item.name} className="p-2 rounded-lg bg-navy-950 border border-navy-800">
                <p className="text-[10px] font-black uppercase text-slate-400">{item.name}</p>
                <p className="text-base font-bold text-white mt-0.5">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution & Editorial Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Articles Distribution */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl">
          <h3 className="text-base font-black font-headline text-white uppercase tracking-wider mb-1">
            Articles by News Desk
          </h3>
          <p className="text-xs text-slate-400 mb-4">Total published coverage by category</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1021',
                    borderColor: '#1e293b',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#e50914" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Editorial Activity Logs */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black font-headline text-white uppercase tracking-wider">
                Editorial Audit Feed
              </h3>
              <Link to="/admin/logs" className="text-xs font-bold text-red-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-navy-950 border border-navy-850 flex items-start gap-3 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-vanguard-red mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 truncate">
                        {log.user?.name || 'System'} ({log.user?.role?.name || 'Automated'})
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 truncate font-mono">
                      {log.action} • {log.metadata ? JSON.parse(log.metadata).title || log.metadata : log.entityType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
