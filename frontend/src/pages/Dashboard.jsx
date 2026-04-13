import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Heart, User, MapPin, ShoppingBag, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { fetchMyOrders } from '../store/slices/orderSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { orders = [] } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => !o.isDelivered).length,
    delivered: orders.filter(o => o.isDelivered).length,
    spent: orders.filter(o => o.isPaid).reduce((a, o) => a + (o.totalPrice || 0), 0),
  };

  const cards = [
    { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'var(--brand)' },
    { label: 'In Transit',   value: stats.pending, icon: Clock, color: '#f59e0b' },
    { label: 'Delivered',    value: stats.delivered, icon: CheckCircle, color: '#06b6d4' },
    { label: 'Total Spent',  value: `₹${stats.spent.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'var(--brand)' },
  ];

  const quickLinks = [
    { to: '/orders',   icon: Package, label: 'My Orders',  desc: 'Track and manage all your orders' },
    { to: '/wishlist', icon: Heart,   label: 'Wishlist',   desc: 'Items you saved for later' },
    { to: '/profile',  icon: User,    label: 'Profile',    desc: 'Update your personal info' },
    { to: '/products', icon: ShoppingBag, label: 'Continue Shopping', desc: 'Discover new arrivals' },
  ];

  return (
    <div className="pt-24 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-8 md:p-12 mb-10 relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: "var(--brand)" }} />
          <div className="relative flex items-center gap-5 flex-wrap">
            <img
              src={user?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'guest'}`}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover bg-surface border-2 border-brand"
            />
            <div className="flex-1">
              <p className="section-eyebrow">Welcome back</p>
              <h1 className="font-display text-4xl md:text-5xl text-base-c tracking-tight">
                Hi, <span className="text-gradient">{user?.name?.split(' ')[0] || 'Friend'}</span> 👋
              </h1>
              <p className="text-muted-c mt-2">Here's what's happening with your orders today.</p>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-5 hover:border-brand transition-all"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'color-mix(in srgb, ' + c.color + ' 15%, transparent)' }}>
                  <Icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <p className="text-faint-c text-xs uppercase tracking-wider mb-1">{c.label}</p>
                <p className="font-display text-3xl text-base-c tracking-tight">{c.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Quick links */}
        <h2 className="font-display text-2xl text-base-c mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {quickLinks.map((l, i) => {
            const Icon = l.icon;
            return (
              <motion.div
                key={l.to}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Link to={l.to} className="block glass rounded-2xl p-5 hover:border-brand transition-all h-full">
                  <Icon className="w-7 h-7 text-brand mb-3" />
                  <p className="font-display text-xl text-base-c tracking-wide">{l.label}</p>
                  <p className="text-muted-c text-xs mt-1">{l.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Recent orders */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-base-c tracking-tight">Recent Orders</h2>
          <Link to="/orders" className="link-arrow">View All →</Link>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 5).map((o, i) => (
            <motion.div
              key={o._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/orders/${o._id}`} className="glass rounded-2xl p-4 flex items-center gap-4 hover:border-brand transition-all">
                <div className="w-12 h-12 rounded-xl bg-brand-soft flex items-center justify-center">
                  <Package className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-base-c text-base tracking-wide truncate">Order #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-faint-c text-xs">{new Date(o.createdAt).toLocaleDateString()} · {o.orderItems?.length || 0} items</p>
                </div>
                <div className="text-right">
                  <p className="text-brand font-display text-lg">₹{o.totalPrice?.toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-bold uppercase ${o.isPaid ? 'text-brand' : 'text-amber-500'}`}>
                    {o.isPaid ? 'Paid' : o.paymentMethod === 'cod' ? 'COD Pending' : 'Unpaid'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          {orders.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <p className="text-muted-c">No orders yet. Start shopping!</p>
              <Link to="/products" className="btn-primary mt-4 inline-block">Browse Products</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
