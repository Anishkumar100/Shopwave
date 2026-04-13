import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Trash2, LayoutDashboard, Package, ShoppingBag, Users, Shield , Tag , Folder } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    API.get('/users').then((r) => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    try { await API.delete(`/users/${id}`); setUsers((u) => u.filter((x) => x._id !== id)); toast.success('User deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const handleRoleChange = async (id, role) => {
    try { await API.put(`/users/${id}`, { role }); setUsers((u) => u.map((x) => x._id === id ? { ...x, role } : x)); toast.success('Role updated'); }
    catch { toast.error('Update failed'); }
  };

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-6 pb-16">
      
      <div className="p-4 md:p-8">
        <h1 className="font-display font-bold text-3xl text-base-c mb-8">Manage Users</h1>
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-11" />
        </div>
        <div className="glass rounded-2xl border border-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base">
                  {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-muted-c text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => (
                  <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-base last:border-0 hover:bg-card-soft transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name} className="w-9 h-9 rounded-xl bg-surface" />
                        <p className="text-base-c text-sm font-medium">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-c text-sm">{user.email}</td>
                    <td className="px-5 py-4">
                      <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="bg-surface border border-base rounded-lg px-2 py-1 text-base-c text-xs focus:outline-none focus:border-brand">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-muted-c text-sm">{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(user._id, user.name)}
                        className="p-2 text-muted-c hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManageUsers;
