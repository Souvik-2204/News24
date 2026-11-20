import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, TierBadge, CategoryBadge } from '../../components/common/Badge';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Send,
  Eye,
} from 'lucide-react';

export default function AdminArticles() {
  const { user, isEditor, isChief } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (categoryFilter !== 'ALL') queryParams.append('categoryId', categoryFilter);
      if (tierFilter !== 'ALL') queryParams.append('tier', tierFilter);
      if (search) queryParams.append('search', search);

      const [resArticles, resCats] = await Promise.all([
        api.get(`/cms/articles?${queryParams.toString()}`),
        api.get('/news/categories'),
      ]);

      setArticles(resArticles.articles || []);
      setCategories(resCats.categories || []);
    } catch (err) {
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, categoryFilter, tierFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await api.delete(`/cms/articles/${id}`);
      setMsg({ type: 'success', text: 'Article deleted successfully.' });
      fetchArticles();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleSubmitForReview = async (id) => {
    try {
      const res = await api.post(`/workflow/${id}/submit`, {
        comment: 'Author submitted draft for review.',
      });
      setMsg({ type: 'success', text: res.message });
      fetchArticles();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            Article Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Author, edit, filter, and schedule news across all categories and subscription tiers.
          </p>
        </div>

        <Link
          to="/admin/articles/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-red-950"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
            msg.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
              : 'bg-rose-950/60 border-rose-700/60 text-rose-300'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by headline or excerpt..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-300 font-semibold focus:outline-none focus:border-vanguard-red"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-300 font-semibold focus:outline-none focus:border-vanguard-red"
          >
            <option value="ALL">All Desks</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-slate-300 font-semibold focus:outline-none focus:border-vanguard-red"
          >
            <option value="ALL">All Tiers</option>
            <option value="FREE">Free</option>
            <option value="BRONZE">Bronze</option>
            <option value="SILVER">Silver</option>
            <option value="GOLD">Gold</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">
          Loading articles from archive...
        </div>
      ) : articles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-navy-900 border border-navy-850 text-center text-slate-400">
          No articles match your selected filters.
        </div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-navy-800">
                <tr>
                  <th className="py-4 px-6">Story Title</th>
                  <th className="py-4 px-4">Desk</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Access Tier</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Views</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-navy-850/50 transition">
                    <td className="py-4 px-6 max-w-sm">
                      <p className="font-bold text-white text-sm line-clamp-1 mb-1">
                        {art.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        slug: /{art.slug}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <CategoryBadge category={art.category} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-200">{art.author?.name}</span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <TierBadge tier={art.accessTier} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={art.status} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap font-mono text-slate-300">
                      {art.viewsCount.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* Submit draft to review if DRAFT or REJECTED */}
                        {(art.status === 'DRAFT' || art.status === 'REJECTED') && (
                          <button
                            onClick={() => handleSubmitForReview(art.id)}
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-amber-600 text-amber-400 hover:text-white transition"
                            title="Submit to Maker-Checker Review Desk"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Live Article */}
                        {art.status === 'PUBLISHED' && (
                          <Link
                            to={`/article/${art.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white transition"
                            title="View Public Article"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}

                        {/* Edit Article */}
                        <Link
                          to={`/admin/articles/${art.id}/edit`}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition"
                          title="Edit Article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>

                        {/* Delete Article */}
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
