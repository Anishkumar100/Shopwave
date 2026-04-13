import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Lock, Save } from 'lucide-react';
import { updateProfile, getProfile } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import API from '../api/axios';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: { street: '', city: '', state: '', zipCode: '', country: 'India' } });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || { street: '', city: '', state: '', zipCode: '', country: 'India' } });
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const res = await dispatch(updateProfile(form));
    if (!res.error) toast.success('Profile updated!');
    else toast.error(res.payload);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    try {
      await API.put('/auth/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-8">My Profile</motion.h1>

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-base mb-6 flex items-center gap-5">
          <img src={user?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name} className="w-20 h-20 rounded-2xl bg-surface object-cover" />
          <div>
            <h2 className="font-display font-bold text-2xl text-base-c">{user?.name}</h2>
            <p className="text-muted-c text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'badge-green'}`}>
              {user?.role === 'admin' ? '👑 Admin' : '👤 Customer'}
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-xl p-1 max-w-xs mb-6">
          {[['profile', 'Profile'], ['security', 'Security']].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === val ? 'bg-brand text-[color:var(--brand-contrast)]' : 'text-muted-c hover:text-base-c'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleProfileUpdate} className="glass rounded-2xl p-6 border border-base space-y-5">
              <h3 className="font-display font-bold text-base-c text-xl mb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-brand" /> Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Full name" />
                </div>
                <div>
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="input-field" />
                </div>
                <div>
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="Phone number" />
                </div>
              </div>
              <h3 className="font-display font-bold text-base-c text-xl pt-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" /> Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['street', 'Street', 2], ['city', 'City', 1], ['state', 'State', 1], ['zipCode', 'ZIP Code', 1], ['country', 'Country', 1]].map(([key, label, col]) => (
                  <div key={key} className={col === 2 ? 'md:col-span-2' : ''}>
                    <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input value={form.address[key] || ''} onChange={(e) => setForm({ ...form, address: { ...form.address, [key]: e.target.value } })} className="input-field" placeholder={label} />
                  </div>
                ))}
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} className="btn-primary px-8 py-3 flex items-center gap-2">
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </form>
          </motion.div>
        )}

        {tab === 'security' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handlePasswordChange} className="glass rounded-2xl p-6 border border-base space-y-4">
              <h3 className="font-display font-bold text-base-c text-xl mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand" /> Change Password
              </h3>
              {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                  <input type="password" value={passwords[key]} onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} className="input-field" placeholder="••••••••" required />
                </div>
              ))}
              <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-primary px-8 py-3">Update Password</motion.button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default Profile;
