import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ScrollText, Clock, User, Shield } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.get('/admin/logs');
        setLogs(res.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="pb-6 border-b border-navy-800">
        <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
          Editorial Activity & Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Immutable logging of every article creation, review decision, role modification, and subscription event.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">Retrieving ledger events...</div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="divide-y divide-navy-850">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-navy-850/50 transition flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-vanguard-red mt-1.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {log.user?.name || 'System'}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-800 text-slate-300">
                        {log.user?.role?.name || 'Automated'}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-red-400 mt-1 font-bold">
                      {log.action}
                    </p>

                    {log.metadata && (
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {log.metadata}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-slate-400 block">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 block">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
