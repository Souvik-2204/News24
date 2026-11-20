import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CategoryBadge, TierBadge, BreakingBadge, LiveBadge } from '../components/common/Badge';
import PaywallBanner from '../components/common/PaywallBanner';
import NewsCard from '../components/news/NewsCard';
import {
  Clock,
  Eye,
  Share2,
  Bookmark,
  Volume2,
  Check,
  MessageSquare,
  Send,
  Radio,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Ambassador Kenneth Cole',
      time: '2 hours ago',
      text: 'Essential reporting on the diplomatic friction points. Vanguard 24 continues to provide the deepest investigative depth on multilateral pacts.',
      isVip: true,
    },
    {
      id: 'c2',
      author: 'Meera Nambiar',
      time: '4 hours ago',
      text: 'The financial ramifications outlined here will reverberate across bond markets by next quarter. Superb journalism.',
      isVip: false,
    },
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    async function loadArticle() {
      try {
        setLoading(true);
        const res = await api.get(`/news/article/${slug}`);
        setData(res);
      } catch (err) {
        console.error('Article fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
    window.scrollTo(0, 0);
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([
      {
        id: `c_${Date.now()}`,
        author: user ? user.name : 'Anonymous Reader',
        time: 'Just now',
        text: newComment.trim(),
        isVip: user && ['GOLD', 'SILVER', 'BRONZE'].includes(user.subscriptionTier),
      },
      ...comments,
    ]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-red-500 font-bold">
          <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
          <span>DECRYPTING REPORT WIRE...</span>
        </div>
      </div>
    );
  }

  const article = data?.article;
  const related = data?.related || [];

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black text-white font-headline mb-4">Article Not Found</h1>
        <p className="text-slate-400 text-sm mb-6">The dispatch you requested could not be located in our broadcast index.</p>
        <Link to="/" className="px-6 py-2.5 rounded-xl bg-vanguard-red text-white font-bold text-xs uppercase">
          Back to Headline Desk
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Category, Badges, and Headline */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CategoryBadge category={article.category} />
            {article.isBreaking && <BreakingBadge />}
            {article.isLive && <LiveBadge count={article.liveUpdatesCount} />}
          </div>
          <TierBadge tier={article.accessTier} />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-headline text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        {article.subtitle && (
          <p className="text-lg sm:text-xl text-slate-300 font-headline font-semibold leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Author Byline & Telemetry Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-navy-800 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img
              src={article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
              alt={article.author?.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-vanguard-red/60"
            />
            <div>
              <p className="font-bold text-white text-sm">{article.author?.name}</p>
              <p className="text-[11px] text-slate-400">
                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Just In'}
                {' • '}
                <span>{article.readTimeMinutes} min read</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 border border-navy-800 text-slate-300 transition flex items-center gap-1.5 text-xs font-bold"
              title="Copy share link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Audio Listen Simulation Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-navy-900 border border-navy-800 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-950 text-red-400 border border-red-800/60">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Broadcast Audio Dispatch</p>
              <p className="text-[11px] text-slate-400">Audio overview synthesized by Vanguard Studio • {article.readTimeMinutes} mins</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-navy-800 text-yellow-400">
            Vanguard Audio
          </span>
        </div>
      </div>

      {/* Featured Header Media */}
      {article.featuredImage && (
        <div className="mb-8 rounded-2xl overflow-hidden border border-navy-800 shadow-2xl bg-navy-950">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full aspect-[16/9] object-cover"
          />
          {article.imageCaption && (
            <p className="p-3 text-[11px] text-slate-400 bg-navy-950/90 font-mono italic">
              {article.imageCaption}
            </p>
          )}
        </div>
      )}

      {/* Article Body Content & Paywall Gatekeeper */}
      {article.isLocked ? (
        <div className="space-y-6">
          {/* Teaser excerpt is shown */}
          <div className="article-prose">
            <p className="text-lg leading-relaxed text-slate-200 font-serif font-semibold">
              {article.excerpt}
            </p>
            <p className="text-slate-400 italic">
              [Investigation continues under encrypted subscriber frequency...]
            </p>
          </div>

          {/* Blurred Dummy Content for High-End Cinematic Look */}
          <div className="relative select-none pointer-events-none filter blur-sm opacity-40 space-y-4">
            <p className="h-4 bg-slate-700 rounded w-full" />
            <p className="h-4 bg-slate-700 rounded w-5/6" />
            <p className="h-4 bg-slate-700 rounded w-4/6" />
            <p className="h-4 bg-slate-700 rounded w-full" />
            <p className="h-4 bg-slate-700 rounded w-3/4" />
          </div>

          {/* Luxury High-Impact Paywall Banner */}
          <PaywallBanner
            requiredTier={article.requiredTier || article.accessTier}
            userTier={article.userTier}
          />
        </div>
      ) : (
        /* Unlocked Full Rich-Text Tiptap HTML Content */
        <div
          className="article-prose my-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-6 pb-8 border-t border-navy-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-black uppercase text-slate-400 mr-2">Dispatches:</span>
          {article.tags.map((t) => (
            <Link
              key={t.tag.id}
              to={`/search?q=${t.tag.name}`}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-900 border border-navy-800 text-slate-300 hover:text-white hover:border-vanguard-red transition"
            >
              #{t.tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Author Bio Card */}
      {article.author && (
        <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl my-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={article.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
            alt={article.author.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-vanguard-red shrink-0"
          />
          <div className="text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 block">
              Vanguard Newsroom Byline
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{article.author.name}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {article.author.bio || 'Senior Investigative Correspondent at Vanguard 24 Global Newsroom.'}
            </p>
          </div>
        </div>
      )}

      {/* Reader Discussion Section */}
      <section className="my-12 pt-8 border-t border-navy-800">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-vanguard-red" />
          <h3 className="text-lg font-black font-headline text-white uppercase tracking-wider">
            Reader Discussion ({comments.length})
          </h3>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleAddComment} className="mb-8 space-y-3">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? `Add your analysis as ${user.name}...` : 'Sign in to participate in editorial reader debate...'}
            className="w-full p-4 rounded-xl bg-navy-900 border border-navy-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-950"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>

        {/* Comments Feed */}
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-navy-900 border border-navy-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{c.author}</span>
                  {c.isVip && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-yellow-950 text-yellow-400 border border-yellow-600/40">
                      <Sparkles className="w-2.5 h-2.5" />
                      VIP Subscriber
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500">{c.time}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Stories Grid */}
      {related && related.length > 0 && (
        <section className="my-12 pt-8 border-t border-navy-800">
          <h3 className="text-lg font-black font-headline text-white uppercase tracking-wider mb-6">
            Related Dispatches from {article.category?.name}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((art) => (
              <NewsCard key={art.id} article={art} compact />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
