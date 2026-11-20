import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  PlusCircle,
  FolderTree,
  CreditCard,
  Users,
  ScrollText,
  ArrowLeft,
  Radio,
  Bell,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isStaff, isEditor, isChief, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function checkPending() {
      if (isEditor) {
        try {
          const res = await api.get('/workflow/queue');
          if (res.queue) {
            setPendingCount(res.queue.length);
          }
        } catch (err) {
          // silent fail
        }
      }
    }
    checkPending();
    const interval = setInterval(checkPending, 30000);
    return () => clearInterval(interval);
  }, [isEditor]);

  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-500 mb-4">
          <Radio className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-white font-headline mb-2">Restricted Newsroom Terminal</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          This portal requires active newsroom editorial staff credentials (Super Admin, Chief Editor, Section Editor, or Author).
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-lg bg-navy-800 text-slate-300 hover:text-white font-bold text-xs uppercase"
          >
            Return to Public Site
          </button>
          <div className="inline-block">
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    ...(isEditor
      ? [
          {
            name: 'Editorial Review Queue',
            path: '/admin/queue',
            icon: CheckSquare,
            badge: pendingCount,
          },
        ]
      : []),
    { name: 'All Articles', path: '/admin/articles', icon: FileText },
    { name: 'Create Story', path: '/admin/articles/new', icon: PlusCircle },
    ...(isChief
      ? [
          { name: 'Categories & Desks', path: '/admin/categories', icon: FolderTree },
          { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
        ]
      : []),
    ...(isAdmin
      ? [{ name: 'User & Role Access', path: '/admin/users', icon: Users }]
      : []),
    ...(isChief
      ? [{ name: 'Audit & Activity Logs', path: '/admin/logs', icon: ScrollText }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-navy-900 border-b border-navy-800 p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-vanguard-red text-white flex items-center justify-center font-black">
            V
          </div>
          <span className="font-headline font-black text-white">NEWSROOM CMS</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded bg-navy-800 text-slate-300"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Newsroom Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-navy-900 border-r border-navy-800 flex flex-col justify-between z-50 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-navy-800">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-vanguard-red to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-red-950">
                V
              </div>
              <div>
                <span className="text-lg font-black font-headline text-white tracking-tight">
                  NEWS<span className="text-vanguard-red">24</span>
                </span>
                <span className="block text-[10px] font-black uppercase tracking-widest text-red-500">
                  EDITORIAL COMMAND
                </span>
              </div>
            </Link>
          </div>

          {/* User Persona Card */}
          <div className="p-4 mx-4 my-4 rounded-xl bg-navy-950 border border-navy-800 flex items-center gap-3">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-vanguard-red/60"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-vanguard-red to-red-700 text-white shadow-md shadow-red-950/40'
                        : 'text-slate-300 hover:text-white hover:bg-navy-800'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-navy-950 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-navy-800 space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>
          <div className="pt-2 border-t border-navy-850">
          </div>
        </div>
      </aside>

      {/* Main CMS View Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

