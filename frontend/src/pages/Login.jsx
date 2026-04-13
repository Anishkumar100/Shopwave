import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { loginUser, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    console.log(user)
    if (!res.error) { 
      toast.success('Welcome back! 👋'); 
      navigate('/'); }
  };

  return (
    <div className="min-h-screen flex items-center pt-24 pb-12 justify-center px-4 bg-base relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-soft rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 md:p-10 border border-base">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[color:var(--brand-contrast)]" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-xl text-base-c">Shop<span className="text-brand">Wave</span></span>
            </Link>
            <h1 className="font-display font-bold text-3xl text-base-c mb-2">Welcome Back</h1>
            <p className="text-muted-c">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
              <input type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required className="input-field pl-12" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required className="input-field pl-12 pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-faint-c hover:text-base-c">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-brand hover:text-brand transition-colors">
                Forgot password?
              </Link>
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-4 text-base disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-c text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand hover:text-brand font-medium transition-colors">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-xl bg-brand-soft border border-brand">
            <p className="text-brand text-xs font-bold uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="text-muted-c text-xs">Admin: <span className="text-base-c">admin@shopwave.com / Admin@123</span></p>
            <p className="text-muted-c text-xs">User: <span className="text-base-c">john@example.com / User@123</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default Login;
