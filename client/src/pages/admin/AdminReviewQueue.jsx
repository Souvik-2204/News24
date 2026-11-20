import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, TierBadge, CategoryBadge } from '../../components/common/Badge';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  History,
  ShieldAlert,
} from 'lucide-react';

export default function AdminReviewQueue() {
  const { user, isChief, isAdmin } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [history, setHistory] = useState({ approvals: [], revisions: [] });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [immediatePublish, setImmediatePublish] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [msg, setMsg] = useState(null);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workflow/queue');
      setQueue(res.queue || []);
    } catch (err) {
      console.error('Queue load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openReviewModal = async (art) => {
    setSelectedArticle(art);
    setApprovalNotes('');
    setRejectReason('');
    setReviewModalOpen(true);

    try {
      const res = await api.get(`/workflow/${art.id}/history`);
      setHistory(res);
    } catch (err) {
      console.error('History load error:', err);
    }
  };

  const handleApprove = async () => {
    if (!selectedArticle) return;
    try {
      setProcessing(true);
      const res = await api.post(`/workflow/${selectedArticle.id}/approve`, {
        comment: approvalNotes || 'Approved by editorial desk.',
        immediatePublish: (isChief || isAdmin) ? immediatePublish : false,
      });

      setMsg({ type: 'success', text: res.message });
      setReviewModalOpen(false);
      fetchQueue();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selectedArticle) return;
    if (!rejectReason || rejectReason.trim().length < 5) {
      alert('Please enter a detailed rejection reason.');
      return;
    }

    try {
      setProcessing(true);
      const res = await api.post(`/workflow/${selectedArticle.id}/reject`, {
        comment: rejectReason.trim(),
      });

      setMsg({ type: 'success', text: res.message });
      setRejectModalOpen(false);
      setReviewModalOpen(false);
      fetchQueue();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const isAuthorOfSelected = selectedArticle && user && selectedArticle.authorId === user.id;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-500">
              MAKER-CHECKER EDITORIAL GATEWAY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
            Editorial Review & Approval Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rigorous factual verification and publishing gateway. Authors cannot approve own articles.
          </p>
        </div>

        <button
          onClick={fetchQueue}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-bold text-xs uppercase tracking-wider transition"
        >
          Refresh Queue ({queue.length})
        </button>
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

      {/* Queue Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">
          Checking editorial submission queue...
        </div>
      ) : queue.length === 0 ? (
        <div className="p-16 rounded-2xl bg-navy-900 border border-navy-850 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Review Queue is Clear</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            All submitted articles have been verified and processed by the editorial desk.
            New journalist submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-navy-800">
                <tr>
                  <th className="py-4 px-6">Headline & Story</th>
                  <th className="py-4 px-4">Desk</th>
                  <th className="py-4 px-4">Author</th>
                  <th className="py-4 px-4">Access Tier</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Maker-Checker Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {queue.map((art) => (
                  <tr key={art.id} className="hover:bg-navy-850/50 transition">
                    <td className="py-4 px-6 max-w-md">
                      <p className="font-bold text-white text-sm line-clamp-1 mb-1">
                        {art.title}
                      </p>
                      <p className="text-slate-400 text-xs line-clamp-1 font-serif">
                        {art.excerpt}
                      </p>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <CategoryBadge category={art.category} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <img
                          src={art.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={art.author?.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <span className="font-semibold text-slate-200">{art.author?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <TierBadge tier={art.accessTier} />
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={art.status} />
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => openReviewModal(art)}
                        className="px-4 py-2 rounded-xl bg-vanguard-red hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-950"
                      >
                        Review Submission
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Fact-Checking Modal */}
      {reviewModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 bg-navy-950 border-b border-navy-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1">
                  EDITORIAL SCRUTINY DESK
                </span>
                <h2 className="text-xl font-black font-headline text-white line-clamp-1">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Maker-Checker Rule Warning if Author is Reviewing */}
              {isAuthorOfSelected && (
                <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Maker-Checker Policy Violation Warning</p>
                    <p className="text-rose-300 mt-1">
                      You are the registered author of this article. Vanguard 24 editorial bylaws strictly forbid authors from approving their own submissions. Please have a Chief Editor or Section Editor verify and approve this piece.
                    </p>
                  </div>
                </div>
              )}

              {/* Story Overview Pills */}
              <div className="flex flex-wrap items-center gap-3 text-xs bg-navy-950 p-4 rounded-xl border border-navy-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Desk</span>
                  <CategoryBadge category={selectedArticle.category} />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Author</span>
                  <span className="font-bold text-white">{selectedArticle.author?.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Access Tier</span>
                  <TierBadge tier={selectedArticle.accessTier} />
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Read Time</span>
                  <span className="font-bold text-white">{selectedArticle.readTimeMinutes} mins</span>
                </div>
              </div>

              {/* Featured Image */}
              {selectedArticle.featuredImage && (
                <div className="aspect-[21/9] rounded-xl overflow-hidden bg-navy-950 border border-navy-800">
                  <img
                    src={selectedArticle.featuredImage}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Subhead & Excerpt */}
              {selectedArticle.subtitle && (
                <p className="text-base font-bold text-slate-300 font-headline">
                  {selectedArticle.subtitle}
                </p>
              )}
              <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 font-serif text-sm text-slate-300 italic">
                "{selectedArticle.excerpt}"
              </div>

              {/* Full Article Content */}
              <div className="border-t border-navy-800 pt-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                  Full Investigation Copy (Tiptap HTML)
                </h4>
                <div
                  className="article-prose bg-navy-950 p-6 rounded-xl border border-navy-800 max-h-96 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
              </div>

              {/* Approval History Trail */}
              {history.approvals && history.approvals.length > 0 && (
                <div className="border-t border-navy-800 pt-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Workflow Audit Trail</span>
                  </h4>
                  <div className="space-y-2">
                    {history.approvals.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 rounded-lg bg-navy-950 border border-navy-850 text-xs flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{app.reviewer?.name}</span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-navy-800 text-slate-300">
                              {app.action}
                            </span>
                          </div>
                          {app.comment && (
                            <p className="text-slate-400 mt-1 font-serif text-[11px]">
                              {app.comment}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {new Date(app.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviewer Comment & Settings */}
              <div className="border-t border-navy-800 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Editorial Desk Notes / Verification Remarks
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="e.g. Sources verified with Ministry of Foreign Affairs, primary documentation confirmed."
                    className="w-full px-3 py-2 rounded-lg bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-vanguard-red"
                  />
                </div>

                {(isChief || isAdmin) && (
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={immediatePublish}
                      onChange={(e) => setImmediatePublish(e.target.checked)}
                      className="rounded bg-navy-950 border-navy-700 text-vanguard-red focus:ring-0"
                    />
                    <span>Publish live to broadcast wire immediately upon approval</span>
                  </label>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-navy-950 border-t border-navy-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {/* Reject Button opens rejection modal */}
                <button
                  type="button"
                  disabled={processing || isAuthorOfSelected}
                  onClick={() => setRejectModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-bold text-xs uppercase tracking-wider transition disabled:opacity-40"
                >
                  Reject with Reason
                </button>

                {/* Approve Button */}
                <button
                  type="button"
                  disabled={processing || isAuthorOfSelected}
                  onClick={handleApprove}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950 transition disabled:opacity-40"
                >
                  {processing ? 'Processing...' : (isChief || isAdmin) && immediatePublish ? 'Approve & Publish Live' : 'Approve Submission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Rejection Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-rose-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-black font-headline text-white">
                Mandatory Rejection Feedback
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vanguard 24 editorial policy mandates that rejected articles must include substantive instructions so the journalist can amend factual discrepancies or obtain primary source documentation.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows={5}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Detail required corrections (e.g., Missing secondary source verification for trade figures in paragraph 3; quote from spokesperson must be attributed on-the-record)..."
                className="w-full p-3 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={processing || rejectReason.trim().length < 5}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-40"
                >
                  {processing ? 'Rejecting...' : 'Submit Rejection to Author'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
