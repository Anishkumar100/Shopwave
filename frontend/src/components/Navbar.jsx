import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, Heart, User, Menu, X, Search, Zap, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';
import { selectCartCount } from '../store/slices/cartSlice';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const cartCount = useSelector(selectCartCount);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setProfileOpen(false); }, [location]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setSearchOpen(false); setIsOpen(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('See you soon! 👋');
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Bundles', href: '/bundles' },
    ...(user ? [{ label: 'Dashboard', href: '/dashboard' }] : []),
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-strong shadow-2xl' : 'bg-transparent'
        }`}
        style={scrolled ? { borderBottom: '1px solid var(--border-base)' } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 12, scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: 'var(--brand)' }}
              >
                <Zap className="w-5 h-5 relative z-10" fill="currentColor" style={{ color: 'var(--brand-contrast)' }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{ background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)' }} />
              </motion.div>
              <span className="font-display font-bold text-xl text-base-c">
                Shop<span className="text-gradient">Wave</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={() => setSearchOpen(true)}
                className="relative p-2.5 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" />
                <kbd className="hidden lg:flex absolute -bottom-1 -right-1 text-[9px] px-1 rounded bg-brand-soft text-brand font-mono">⌘K</kbd>
              </motion.button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Wishlist */}
              {user && (
                <Link to="/wishlist">
                  <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                    className="p-2.5 rounded-xl text-muted-c hover:text-brand hover:bg-brand-soft transition-all"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-[18px] h-[18px]" />
                  </motion.div>
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative">
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  className="p-2.5 rounded-xl text-muted-c hover:text-brand hover:bg-brand-soft transition-all"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-[18px] h-[18px]" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0, y: -4 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand text-[color:var(--brand-contrast)] text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Profile / Auth */}
              {user ? (
                <div className="relative ml-1" ref={profileRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl glass glass-hover"
                  >
                    <img
                      src={user.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover bg-surface"
                    />
                    <span className="text-sm text-base-c font-medium max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </motion.button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-12 w-56 glass-strong rounded-2xl p-2 shadow-2xl"
                      >
                        <div className="px-3 py-2 mb-1">
                          <p className="text-xs text-faint-c">Signed in as</p>
                          <p className="text-sm font-semibold text-base-c truncate">{user.email}</p>
                        </div>
                        <div className="divider my-1" />
                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-soft text-brand transition-all">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card-soft text-muted-c hover:text-base-c transition-all">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card-soft text-muted-c hover:text-base-c transition-all">
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-card-soft text-muted-c hover:text-base-c transition-all">
                          <Heart className="w-4 h-4" /> Wishlist
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-brand-soft text-brand transition-all">
                            <LayoutDashboard className="w-4 h-4" /> Admin Panel
                          </Link>
                        )}
                        <div className="divider my-1" />
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-muted-c hover:text-red-500 transition-all">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login" className="btn-ghost text-sm">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
                </div>
              )}
            </div>

            {/* Mobile actions */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle className="!w-9 !h-9" />
              <Link to="/cart" className="relative p-2 text-muted-c">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand text-[color:var(--brand-contrast)] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-muted-c hover:text-base-c">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isOpen ? 'x' : 'm'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="inline-flex"
                  >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden glass-strong overflow-hidden"
              style={{ borderTop: '1px solid var(--border-base)' }}
            >
              <div className="px-4 py-4 space-y-1">
                <button
                  onClick={() => { setIsOpen(false); setSearchOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all"
                >
                  <Search className="w-4 h-4" /> Search products…
                </button>
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={link.href}
                      className="block px-4 py-3 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all font-medium"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="divider my-2" />
                {user ? (
                  <>
                    <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-brand bg-brand-soft font-bold transition-all">📊 Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-3 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all">Profile</Link>
                    <Link to="/orders" className="block px-4 py-3 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all">My Orders</Link>
                    <Link to="/wishlist" className="block px-4 py-3 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all">Wishlist</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-3 rounded-xl text-brand hover:bg-brand-soft transition-all">Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">Logout</button>
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link to="/login" className="flex-1 text-center btn-outline py-3 text-sm">Login</Link>
                    <Link to="/register" className="flex-1 text-center btn-primary py-3 text-sm">Register</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <motion.form
              initial={{ y: -40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSearch}
              className="w-full max-w-2xl"
            >
              <div className="glass-strong rounded-2xl p-2 flex items-center gap-3 shadow-2xl">
                <Search className="w-5 h-5 text-muted-c ml-3" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands…"
                  className="flex-1 bg-transparent py-3 text-base-c placeholder:text-faint-c outline-none text-lg"
                />
                <button type="submit" className="btn-primary py-2.5 px-5 text-sm">Search</button>
              </div>
              <p className="text-faint-c text-xs text-center mt-4">
                Press <kbd className="px-1.5 py-0.5 rounded bg-card-soft text-brand font-mono">ESC</kbd> to close
              </p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
