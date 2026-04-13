import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { fetchMyOrders } from '../store/slices/orderSlice';
import Loader from '../components/Loader';

const STATUS_COLORS = {
  pending: 'badge-amber',
  processing: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  delivered: 'badge-green',
  cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400',
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <div className="pt-32 flex justify-center"><Loader size="lg" /></div>;

  if (orders.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center px-4">
          <ShoppingBag className="w-20 h-20 text-faint-c mx-auto mb-6" />
          <h2 className="font-display font-bold text-3xl text-base-c mb-3">No orders yet</h2>
          <p className="text-muted-c mb-8">Once you place an order, it'll show up here.</p>
          <Link to="/products" className="btn-primary px-8 py-4">Start Shopping</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-8">
          My Orders
        </motion.h1>
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div key={order._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link to={`/orders/${order._id}`}>
                <div className="glass rounded-2xl p-5 border border-base hover:border-brand transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-brand" />
                        <span className="font-display font-bold text-base-c text-sm">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-faint-c text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-amber'}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <ChevronRight className="w-5 h-5 text-faint-c group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <img key={item._id} src={item.image} alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-surface" />
                    ))}
                    {order.orderItems.length > 3 && (
                      <div className="w-12 h-12 rounded-lg glass flex items-center justify-center text-muted-c text-xs font-bold">
                        +{order.orderItems.length - 3}
                      </div>
                    )}
                    <div className="flex-1 text-right">
                      <p className="price-tag font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                      <p className="text-faint-c text-xs">{order.orderItems.length} item(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-faint-c">
                    <span>{order.isPaid ? '✅ Paid' : '⏳ Payment Pending'}</span>
                    <span>{order.paymentMethod === 'cashfree' ? '💳 Online' : '💵 COD'}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Orders;
