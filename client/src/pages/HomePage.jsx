import React, { useState, useEffect } from 'react';
import api from '../services/api';
import HeroBroadcast from '../components/news/HeroBroadcast';
import NewsCard from '../components/news/NewsCard';
import TrendingLeaderboard from '../components/news/TrendingLeaderboard';
import OpinionDesk from '../components/news/OpinionDesk';
import { ArrowRight, Flame, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [featuredData, setFeaturedData] = useState(null);
  const [latestArticles, setLatestArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [opinionArticles, setOpinionArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      try {
        const [featRes, latestRes, trendRes, opRes] = await Promise.all([
          api.get('/news/featured'),
          api.get('/news/latest?limit=8'),
          api.get('/news/trending'),
          api.get('/news/category/opinion?limit=4'),
        ]);

        setFeaturedData(featRes);
        setLatestArticles(latestRes.articles || []);
        setTrendingArticles(trendRes.trending || []);
        setOpinionArticles(opRes.articles || []);
      } catch (err) {
        console.error('Home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHome();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500 font-bold">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
          <span className="font-headline tracking-wider uppercase text-sm">
            CONNECTING TO VANGUARD 24 GLOBAL SATELLITE FEED...
          </span>
        </div>
      </div>
    );
  }

  const leadStory = featuredData?.leadStory;
  const liveStories = featuredData?.liveStories || [];
  const topStories = featuredData?.topStories || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Broadcast Section (TV-Newsroom Studio Look) */}
      <HeroBroadcast
        leadStory={leadStory}
        liveStories={liveStories}
        topStories={topStories}
      />

      {/* Main Grid: Prime Stories & Trending Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-10">
        {/* Left Column: Top Editorial Coverage Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b-2 border-red-600">
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              PRIME TIME DISPATCHES
            </h2>
            <Link
              to="/category/politics"
              className="text-xs font-bold text-red-400 hover:text-white uppercase tracking-wider transition"
            >
              More In Politics →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {topStories.slice(0, 4).map((art) => (
              <NewsCard key={art.id} article={art} />
            ))}
          </div>
        </div>

        {/* Right Column: Trending Leaderboard */}
        <div className="lg:col-span-4">
          <TrendingLeaderboard articles={trendingArticles} />
        </div>
      </div>

      {/* Opinion Desk Section */}
      <OpinionDesk articles={opinionArticles} />

      {/* Latest Wire Feed Grid */}
      <div className="my-12">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-navy-800">
          <div>
            <h2 className="text-xl font-headline font-black uppercase text-white tracking-tight">
              CONTINUOUS NEWS WIRE
            </h2>
            <p className="text-xs text-slate-400">
              Latest unredacted dispatches across global and domestic desks
            </p>
          </div>
          <Link
            to="/search"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider transition"
          >
            <span>Explore All 27+ Stories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestArticles.slice(0, 8).map((art) => (
            <NewsCard key={art.id} article={art} compact />
          ))}
        </div>
      </div>
    </div>
  );
}
