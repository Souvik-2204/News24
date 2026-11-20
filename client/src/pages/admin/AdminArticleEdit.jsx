import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TiptapEditor from '../../components/editor/TiptapEditor';
import { StatusBadge, TierBadge } from '../../components/common/Badge';
import {
  Save,
  Send,
  Radio,
  Zap,
  ArrowLeft,
  Sparkles,
  History,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

export default function AdminArticleEdit() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user, isChief, isAdmin } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    excerpt: '',
    content: '<p>Start drafting your investigative news copy...</p>',
    featuredImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    imageCaption: '',
    categoryId: '',
    accessTier: 'FREE',
    isBreaking: false,
    isLeadStory: false,
    isLive: false,
    readTimeMinutes: 4,
    seoTitle: '',
    seoDescription: '',
    scheduledAt: '',
    changeSummary: '',
  });

  const [existingArticle, setExistingArticle] = useState(null);

  // Preset News Imagery Gallery for easy one-click selection
  const presetImages = [
    { label: 'Diplomacy & Summit', url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Wall Street & Finance', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80' },
    { label: 'AI & Quantum Tech', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Warship & Defense', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Formula 1 Racing', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Printing Press', url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80' },
  ];

  useEffect(() => {
    async function init() {
      try {
        const catRes = await api.get('/news/categories');
        setCategories(catRes.categories || []);

        if (!isEditing && catRes.categories?.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.categories[0].id }));
        }

        if (isEditing) {
          const artRes = await api.get(`/cms/articles/${id}`);
          const art = artRes.article;
          setExistingArticle(art);
          setFormData({
            title: art.title || '',
            subtitle: art.subtitle || '',
            excerpt: art.excerpt || '',
            content: art.content || '',
            featuredImage: art.featuredImage || '',
            imageCaption: art.imageCaption || '',
            categoryId: art.categoryId || '',
            accessTier: art.accessTier || 'FREE',
            isBreaking: !!art.isBreaking,
            isLeadStory: !!art.isLeadStory,
            isLive: !!art.isLive,
            readTimeMinutes: art.readTimeMinutes || 4,
            seoTitle: art.seoTitle || '',
            seoDescription: art.seoDescription || '',
            scheduledAt: art.scheduledAt ? art.scheduledAt.substring(0, 16) : '',
            changeSummary: '',
          });
        }
      } catch (err) {
        setMsg({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (submitImmediately = false, publishImmediately = false) => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.categoryId) {
      alert('Please complete required fields: Title, Excerpt, Category, and Content.');
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (isEditing) {
        res = await api.put(`/cms/articles/${id}`, {
          ...formData,
        });

        if (submitImmediately) {
          await api.post(`/workflow/${id}/submit`, { comment: 'Resubmitted updated article.' });
        } else if (publishImmediately && (isChief || isAdmin)) {
          await api.post(`/workflow/${id}/publish`);
        }
      } else {
        res = await api.post('/cms/articles', {
          ...formData,
          submitImmediately,
        });

        if (publishImmediately && (isChief || isAdmin) && res.article?.id) {
          await api.post(`/workflow/${res.article.id}/publish`);
        }
      }

      setMsg({ type: 'success', text: res.message || 'Article saved successfully.' });
      setTimeout(() => navigate('/admin/articles'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-bold">Loading news editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/articles"
            className="p-2 rounded-xl bg-navy-900 border border-navy-800 hover:bg-navy-850 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
                {isEditing ? 'REVISION DESK' : 'NEW INVESTIGATION'}
              </span>
              {existingArticle && <StatusBadge status={existingArticle.status} />}
            </div>
            <h1 className="text-2xl font-black font-headline text-white tracking-tight">
              {isEditing ? 'Edit Story Copy' : 'Author New News Article'}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false, false)}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 font-bold text-xs uppercase tracking-wider transition border border-navy-700"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true, false)}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-amber-950"
          >
            Submit for Review
          </button>

          {(isChief || isAdmin) && (
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit(false, true)}
              className="px-5 py-2 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-950"
            >
              Publish Immediately
            </button>
          )}
        </div>
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

      {/* Maker-Checker Alert for Editing Published Articles */}
      {existingArticle?.status === 'PUBLISHED' && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-600/60 text-amber-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Maker-Checker Compliance Policy</p>
            <p className="text-amber-300 mt-1">
              This article is currently LIVE. Saving material title or content modifications will archive an ArticleRevision snapshot and require mandatory re-approval before updates broadcast to subscribers.
            </p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Title */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Headline / Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="High-impact news headline..."
                className="w-full px-4 py-3 rounded-xl bg-navy-950 border border-navy-700 text-white font-bold text-base placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Sub-Headline / Secondary Strap
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Contextual subtitle..."
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Summary / Excerpt Teaser *
              </label>
              <textarea
                name="excerpt"
                required
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Lead paragraph visible on cards and teaser paywall..."
                className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:border-vanguard-red font-serif"
              />
            </div>
          </div>

          {/* Tiptap Rich Text Editor */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                Full Investigation Body Copy (Tiptap Rich-Text Editor) *
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Tiptap Engine</span>
            </div>

            <TiptapEditor
              content={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
            />
          </div>

          {/* Change Summary if Editing */}
          {isEditing && (
            <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Editorial Change Summary / Revision Note
              </label>
              <input
                type="text"
                name="changeSummary"
                value={formData.changeSummary}
                onChange={handleChange}
                placeholder="e.g. Updated GDP forecasts in section 2 following central bank press conference."
                className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
              />
            </div>
          )}
        </div>

        {/* Sidebar Controls & Settings */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Parameters */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black font-headline uppercase tracking-wider text-white pb-3 border-b border-navy-800">
              Desk & Access Configuration
            </h3>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Editorial Desk (Category) *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white font-bold focus:outline-none focus:border-vanguard-red"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Access Tier Hierarchy */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Access Tier Paywall Gate *
              </label>
              <select
                name="accessTier"
                value={formData.accessTier}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs font-black text-amber-400 focus:outline-none focus:border-vanguard-red"
              >
                <option value="FREE">FREE (Unrestricted Public)</option>
                <option value="BRONZE">BRONZE (₹99/mo Plan)</option>
                <option value="SILVER">SILVER (₹199/mo Plan)</option>
                <option value="GOLD">GOLD (₹399/mo VIP Pass)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Enforced on backend. Unsubscribed readers receive teaser excerpt only.
              </p>
            </div>

            {/* Read Time */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Estimated Reading Time (Minutes)
              </label>
              <input
                type="number"
                name="readTimeMinutes"
                min="1"
                max="60"
                value={formData.readTimeMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white focus:outline-none focus:border-vanguard-red"
              />
            </div>

            {/* Broadcast Flags */}
            <div className="space-y-3 pt-3 border-t border-navy-800">
              <label className="flex items-center gap-3 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBreaking"
                  checked={formData.isBreaking}
                  onChange={handleChange}
                  className="rounded bg-navy-950 border-navy-700 text-vanguard-red focus:ring-0"
                />
                <span className="flex items-center gap-1.5 text-red-400">
                  <Zap className="w-4 h-4 fill-current" />
                  Breaking News Ticker Alert
                </span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  name="isLeadStory"
                  checked={formData.isLeadStory}
                  onChange={handleChange}
                  className="rounded bg-navy-950 border-navy-700 text-vanguard-red focus:ring-0"
                />
                <span>Set as Homepage Broadcast Lead Story</span>
              </label>

              <label className="flex items-center gap-3 text-xs font-bold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  name="isLive"
                  checked={formData.isLive}
                  onChange={handleChange}
                  className="rounded bg-navy-950 border-navy-700 text-vanguard-red focus:ring-0"
                />
                <span className="flex items-center gap-1 text-red-500">
                  <Radio className="w-3.5 h-3.5" />
                  Active Live Developing Wire
                </span>
              </label>
            </div>
          </div>

          {/* Featured Image & Quick Gallery */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black font-headline uppercase tracking-wider text-white pb-3 border-b border-navy-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-vanguard-red" />
              <span>Cinematic Header Photo</span>
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
              />
            </div>

            {/* Quick Gallery Presets */}
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">
                Quick Gallery Presets:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {presetImages.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, featuredImage: p.url }))}
                    className="aspect-[16/10] rounded-lg overflow-hidden border border-navy-700 hover:border-vanguard-red relative group"
                    title={p.label}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] font-bold text-white p-1 text-center transition">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {formData.featuredImage && (
              <div className="aspect-[16/9] rounded-xl overflow-hidden bg-navy-950 border border-navy-800 mt-2">
                <img
                  src={formData.featuredImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
