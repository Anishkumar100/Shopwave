import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, LayoutDashboard, Package, ShoppingBag, Users, Eye , Tag , Folder } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../store/slices/orderSlice';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const STATUS_COLORS = { pending: 'badge-amber', processing: 'bg-blue-500/20 text-blue-400', shipped: 'bg-purple-500/20 text-purple-400', delivered: 'badge-green', cancelled: 'bg-red-500/20 text-red-400', refunded: 'bg-gray-500/20 text-gray-400' };

const ManageOrders = () => {
  const dispatch = useDispatch();
  const { allOrders } = useSelector((s) => s.orders);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => { dispatch(fetchAllOrders()); }, [dispatch]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order ${status}`);
      dispatch(fetchAllOrders());
    } catch { toast.error('Update failed'); }
  };

  const filtered = allOrders.filter((o) => {
    const matchSearch = o._id.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter ? o.orderStatus === filter : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="pt-6 pb-16">
      
      <div className="p-4 md:p-8">
        <h1 className="font-display font-bold text-3xl text-base-c mb-8">Manage Orders</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID or customer..." className="input-field pl-11" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field md:w-44">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="glass rounded-2xl border border-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base">
                  {['Order ID', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-muted-c text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => (
                  <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-base last:border-0 hover:bg-card-soft transition-colors">
                    <td className="px-5 py-4 font-mono text-base-c text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-4 text-muted-c text-sm">{order.user?.name || 'Unknown'}</td>
                    <td className="px-5 py-4 price-tag font-bold text-sm">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${order.isPaid ? 'badge-green' : 'badge-amber'}`}>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <select value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="bg-surface border border-base rounded-lg px-2 py-1 text-base-c text-xs focus:outline-none focus:border-brand">
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-muted-c text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <Link to={`/orders/${order._id}`} className="p-2 text-muted-c hover:text-brand hover:bg-brand-soft rounded-lg transition-all inline-block">
                        <Eye className="w-4 h-4" />
                      </Link>
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
export default ManageOrders;
