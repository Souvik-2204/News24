import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FolderTree, Tag as TagIcon, Plus, Trash2, Edit2 } from 'lucide-react';

export default function AdminCategories() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const [newCat, setNewCat] = useState({ name: '', description: '', color: '#e50914', icon: 'newspaper' });
  const [newTag, setNewTag] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resCats, resTags] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/admin/tags'),
      ]);
      setCategories(resCats.categories || []);
      setTags(resTags.tags || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', newCat);
      setMsg({ type: 'success', text: 'Category created successfully.' });
      setNewCat({ name: '', description: '', color: '#e50914', icon: 'newspaper' });
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTag) return;
    try {
      await api.post('/admin/tags', { name: newTag });
      setNewTag('');
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchData();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
          News Desks & Taxonomy Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure television news desks, color identities, and editorial tags.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${msg.type === 'success' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-700 text-rose-300'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories List & Creator */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-black font-headline uppercase text-white mb-4">
              Active Editorial Desks ({categories.length})
            </h2>

            <div className="space-y-3">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-navy-950 border border-navy-850 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">/{c.slug}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-navy-850 text-slate-300">
                      {c._count?.articles || 0} stories
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete Desk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black font-headline uppercase text-white mb-4">
              Create New News Desk
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase">Desk Name</label>
                  <input
                    type="text"
                    required
                    value={newCat.name}
                    onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                    placeholder="e.g. Science & Space"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1 uppercase">Brand Color Hex</label>
                  <input
                    type="color"
                    value={newCat.color}
                    onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                    className="w-full h-9 rounded-xl bg-navy-950 border border-navy-700 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1 uppercase">Desk Charter / Description</label>
                <textarea
                  rows={2}
                  required
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  placeholder="Editorial scope of this desk..."
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-700 text-white"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-bold uppercase tracking-wider"
              >
                + Register News Desk
              </button>
            </form>
          </div>
        </div>

        {/* Editorial Tags Manager */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-black font-headline uppercase text-white mb-4">
              Article Tags ({tags.length})
            </h3>

            <form onSubmit={handleCreateTag} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New topic tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-white font-bold text-xs"
              >
                + Tag
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy-950 border border-navy-800 text-slate-300"
                >
                  <TagIcon className="w-3 h-3 text-slate-500" />
                  <span>{t.name}</span>
                  <span className="text-[10px] text-slate-500">({t._count?.articles || 0})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
