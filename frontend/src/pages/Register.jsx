import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, User, Zap } from 'lucide-react';
import { registerUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const res = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (!res.error) { toast.success('Account created! 🎉'); navigate('/'); }
  };

  return (
    <div className="min-h-screen flex items-center pt-24 pb-12 justify-center px-4 bg-base relative overflow-hidden py-10">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-soft rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 border border-base">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[color:var(--brand-contrast)]" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-xl text-base-c">Shop<span className="text-brand">Wave</span></span>
            </Link>
            <h1 className="font-display font-bold text-3xl text-base-c mb-2">Create Account</h1>
            <p className="text-muted-c">Join ShopWave today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
              <input type="text" placeholder="Full name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field pl-12" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field pl-12" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} required className="input-field pl-12 pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-faint-c hover:text-base-c">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
              <input type="password" placeholder="Confirm password" value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required className="input-field pl-12" />
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-4 text-base mt-2 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-muted-c text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand hover:text-brand font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Register;
