import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Users, Shield, Award, Edit3, UserCheck, Check } from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.users || []);
      setRoles(res.roles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { roleId });
      setMsg({ type: 'success', text: 'User role updated successfully.' });
      fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleCategoryAssignment = async (userId, assignedCategory) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { assignedCategory });
      setMsg({ type: 'success', text: 'Section assignment updated.' });
      fetchUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="pb-6 border-b border-navy-800">
        <h1 className="text-2xl sm:text-3xl font-black font-headline text-white tracking-tight">
          User & Role Access Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Super Admin directory. Enforce role-based access for journalists, desk editors, and subscribers.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${msg.type === 'success' ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-rose-950/60 border-rose-700 text-rose-300'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-bold">Loading user directory...</div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-950/80 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-navy-800">
                <tr>
                  <th className="py-4 px-6">User Persona</th>
                  <th className="py-4 px-4">Role Permission Tier</th>
                  <th className="py-4 px-4">Assigned Section / Desk</th>
                  <th className="py-4 px-4">Active Subscription</th>
                  <th className="py-4 px-6 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-navy-850/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{u.name}</p>
                          <p className="text-slate-400 text-xs font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        value={u.roleId}
                        disabled={u.id === currentUser?.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-700 text-white font-bold text-xs focus:outline-none focus:border-vanguard-red disabled:opacity-50"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {u.role?.name === 'SECTION_EDITOR' ? (
                        <input
                          type="text"
                          defaultValue={u.assignedCategory || ''}
                          onBlur={(e) => handleCategoryAssignment(u.id, e.target.value)}
                          placeholder="Assign Desk (e.g. Politics)"
                          className="px-2.5 py-1 rounded bg-navy-950 border border-navy-700 text-xs text-white"
                        />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      {u.subscriptions?.[0] ? (
                        <span className="font-bold text-amber-400">
                          {u.subscriptions[0].plan?.name}
                        </span>
                      ) : (
                        <span className="text-slate-500">Free Tier</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                      ID: {u.id.slice(-6)}
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
