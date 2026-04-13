import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, LayoutDashboard, LogOut, Settings , Tag , Folder } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'badge-amber', processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400', delivered: 'badge-green',
  cancelled: 'bg-red-500/20 text-red-400',
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/users/admin/stats').then((r) => {
      setStats(r.data.stats);
      setRecentOrders(r.data.recentOrders || []);
    }).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const STAT_CARDS = stats ? [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-brand', bg: 'bg-brand-soft' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Customers', value: stats.totalUsers, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ] : [];

  return (
    <div className="pt-6 pb-16">
      {/* Sidebar */}
      

      {/* Main */}
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-base-c">Dashboard</h1>
            <p className="text-muted-c text-sm">Welcome back, {user?.name} 👋</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? [...Array(4)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 shimmer-bg h-32" />
          )) : STAT_CARDS.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass rounded-2xl p-6 border border-base hover:border-brand transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className={`font-display font-extrabold text-2xl ${card.color} mb-1`}>{card.value}</p>
              <p className="text-muted-c text-sm">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-base overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-base">
            <h2 className="font-display font-bold text-base-c text-xl">Recent Orders</h2>
            <Link to="/admin/orders" className="text-brand text-sm hover:text-brand transition-colors">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base">
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-muted-c text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                    className="border-b border-base last:border-0 hover:bg-card-soft transition-colors">
                    <td className="px-6 py-4 font-mono text-base-c text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-muted-c text-sm">{order.user?.name}</td>
                    <td className="px-6 py-4 price-tag text-sm font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-amber'}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-c text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default AdminDashboard;
