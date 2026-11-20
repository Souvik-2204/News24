import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import NewsCard from '../components/news/NewsCard';
import { Filter, Layers, Clock, Flame } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [tierFilter, setTierFilter] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryNews() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (tierFilter) queryParams.append('tier', tierFilter);
        if (sortBy) queryParams.append('sort', sortBy);

        const res = await api.get(`/news/category/${slug}?${queryParams.toString()}`);
        setCategory(res.category);
        setArticles(res.articles || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryNews();
  }, [slug, tierFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500 font-bold">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
          <span>RECEIVING DESK TELEMETRY...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        News desk not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Desk Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-navy-900 border border-navy-800 p-8 mb-8 shadow-2xl">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: category.color || '#e50914' }}
        />
        <div className="max-w-3xl">
          <span
            className="inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-widest text-white mb-3"
            style={{ backgroundColor: category.color || '#e50914' }}
          >
            {category.name} Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-headline text-white tracking-tight mb-2">
            {category.name} Dispatches
          </h1>
          <p className="text-sm text-slate-300 font-serif leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-800 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Access Tier:
          </span>
          <div className="flex items-center gap-1.5">
            {['', 'FREE', 'BRONZE', 'SILVER', 'GOLD'].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  tierFilter === t
                    ? 'bg-vanguard-red text-white'
                    : 'bg-navy-950 text-slate-400 hover:text-white'
                }`}
              >
                {t || 'All Stories'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Sort:</span>
          <button
            onClick={() => setSortBy('latest')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
              sortBy === 'latest' ? 'bg-navy-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latest</span>
          </button>
          <button
            onClick={() => setSortBy('popular')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
              sortBy === 'popular' ? 'bg-navy-800 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Most Read</span>
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-navy-900 border border-navy-800 text-slate-400">
          No articles currently available matching selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <NewsCard key={art.id} article={art} />
          ))}
        </div>
      )}
    </div>
  );
}
