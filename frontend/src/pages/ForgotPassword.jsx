import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Zap } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center pt-24 pb-12 justify-center px-4 bg-base">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass rounded-3xl p-10 border border-base text-center">
          <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-brand" />
          </div>
          {sent ? (
            <>
              <h2 className="font-display font-bold text-2xl text-base-c mb-3">Check Your Email</h2>
              <p className="text-muted-c mb-8">We've sent a password reset link to <span className="text-base-c">{email}</span></p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          ) : (
            <>
              <h2 className="font-display font-bold text-2xl text-base-c mb-2">Forgot Password?</h2>
              <p className="text-muted-c mb-8">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
                  <input type="email" placeholder="Your email address" value={email}
                    onChange={(e) => setEmail(e.target.value)} required className="input-field pl-12" />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-4 disabled:opacity-60">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <Link to="/login" className="inline-flex items-center gap-2 mt-6 text-muted-c hover:text-base-c text-sm transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
export default ForgotPassword;
