import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Folder, Tag,
  Settings, LogOut, Menu, X, TrendingUp,
} from 'lucide-react';
import { logoutUser } from '../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/admin' },
  { icon: Package,         label: 'Products',   href: '/admin/products' },
  { icon: ShoppingBag,     label: 'Orders',     href: '/admin/orders' },
  { icon: Users,           label: 'Users',      href: '/admin/users' },
  { icon: Folder,          label: 'Categories', href: '/admin/categories' },
  { icon: Tag,             label: 'Promotions', href: '/admin/promotions' },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/');
  };

  const Sidebar = () => (
    <>
      <div className="p-6 border-b border-base flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[color:var(--brand-contrast)]" />
          </div>
          <span className="font-display font-bold text-base-c">
            ShopWave <span className="text-brand text-xs">Admin</span>
          </span>
        </Link>
        <ThemeToggle />
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            to={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === href
                ? 'bg-brand-soft text-brand'
                : 'text-muted-c hover:text-base-c hover:bg-card-soft'
            }`}
          >
            <Icon className="w-5 h-5" /> {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-base space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-c hover:text-base-c hover:bg-card-soft transition-all text-sm">
          <Settings className="w-4 h-4" /> View Store
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-muted-c hover:text-red-400 hover:bg-red-500/10 transition-all text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-base flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-elev border-r border-base flex-col fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-elev border-b border-base px-4 py-3 flex items-center justify-between">
        <button onClick={() => setMobileOpen(true)} className="p-2 text-base-c">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display text-base-c">ShopWave <span className="text-brand text-xs">Admin</span></span>
        <ThemeToggle />
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-72 bg-elev border-r border-base z-50 lg:hidden flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 text-base-c">
                <X className="w-5 h-5" />
              </button>
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
