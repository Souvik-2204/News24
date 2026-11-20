import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import NewsCard from '../components/news/NewsCard';
import { Search as SearchIcon, Filter } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialTier = searchParams.get('tier') || '';

  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [tier, setTier] = useState(initialTier);
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/news/categories');
        setCategories(res.categories || []);
      } catch (err) {}
    }
    loadCategories();
  }, []);

  const executeSearch = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (q) queryParams.append('q', q);
      if (category) queryParams.append('category', category);
      if (tier) queryParams.append('tier', tier);

      setSearchParams(queryParams);
      const res = await api.get(`/news/search?${queryParams.toString()}`);
      setArticles(res.articles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [category, tier]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-navy-800">
        <h1 className="text-3xl font-black font-headline text-white tracking-tight">
          Newsroom Wire Search & Archive
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search across breaking dispatches, classified files, and historical investigations.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative max-w-3xl">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search keywords, countries, figures, or policies..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-navy-900 border border-navy-700 text-white placeholder-slate-500 font-bold text-sm focus:outline-none focus:border-vanguard-red shadow-xl"
          />
          <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-4" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-5 py-2 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 mb-8 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-slate-400">Desk:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-white font-semibold focus:outline-none focus:border-vanguard-red"
          >
            <option value="">All Desks</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold uppercase text-slate-400">Access Tier:</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-amber-400 font-bold focus:outline-none focus:border-vanguard-red"
          >
            <option value="">All Tiers</option>
            <option value="FREE">Free</option>
            <option value="BRONZE">Bronze Tier</option>
            <option value="SILVER">Silver Tier</option>
            <option value="GOLD">Gold Tier</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">Querying broadcast databases...</div>
      ) : articles.length === 0 ? (
        <div className="p-12 rounded-2xl bg-navy-900 border border-navy-850 text-center text-slate-400">
          No stories matching your criteria. Try adjusting your query or filters.
        </div>
      ) : (
        <div>
          <p className="text-xs text-slate-400 uppercase font-black tracking-wider mb-6">
            Found {articles.length} dispatches matching search criteria:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <NewsCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
