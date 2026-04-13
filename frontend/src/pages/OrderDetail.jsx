import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from 'lucide-react';
import { fetchOrderById } from '../store/slices/orderSlice';
import { PageLoader } from '../components/Loader';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  if (loading || !order) return <PageLoader />;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/orders" className="flex items-center gap-2 text-muted-c hover:text-base-c mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display font-bold text-2xl text-base-c">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <p className="text-muted-c text-sm mt-1">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
            </div>
            <span className={`badge text-sm px-4 py-2 ${order.isPaid ? 'badge-green' : 'badge-amber'}`}>
              {order.isPaid ? 'Paid' : 'Pending Payment'}
            </span>
          </div>

          {/* Status Timeline */}
          {order.orderStatus !== 'cancelled' && (
            <div className="glass rounded-2xl p-6 mb-6 border border-base">
              <h3 className="font-display font-bold text-base-c mb-5 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand" /> Order Status
              </h3>
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${i <= currentStep ? 'bg-brand text-[color:var(--brand-contrast)]' : 'glass text-faint-c'}`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <div className="ml-2 hidden md:block">
                      <p className={`text-xs font-medium ${i <= currentStep ? 'text-base-c' : 'text-faint-c'}`}>
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </p>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 mx-3 h-px ${i < currentStep ? 'bg-brand' : 'bg-card-soft'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Items */}
            <div className="glass rounded-2xl p-5 border border-base md:col-span-2">
              <h3 className="font-display font-bold text-base-c mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand" /> Order Items
              </h3>
              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 py-2 border-b border-base last:border-0">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-surface" />
                    <div className="flex-1">
                      <p className="text-base-c text-sm font-medium">{item.name}</p>
                      <p className="text-faint-c text-xs">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <p className="price-tag font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-base space-y-2">
                {[
                  ['Items', order.itemsPrice],
                  ['Shipping', order.shippingPrice],
                  ['Tax', order.taxPrice],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-muted-c">{l}</span>
                    <span className="text-base-c">{v === 0 ? 'FREE' : `₹${v.toLocaleString('en-IN')}`}</span>
                  </div>
                ))}
                <div className="flex justify-between font-display font-bold pt-2 border-t border-base">
                  <span className="text-base-c">Total</span>
                  <span className="text-brand text-xl">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="glass rounded-2xl p-5 border border-base">
              <h3 className="font-display font-bold text-base-c mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" /> Shipping Address
              </h3>
              <div className="space-y-1 text-sm text-muted-c">
                <p className="text-base-c font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-brand">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="glass rounded-2xl p-5 border border-base">
              <h3 className="font-display font-bold text-base-c mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand" /> Payment Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-c">Method</span>
                  <span className="text-base-c">{order.paymentMethod === 'cashfree' ? 'Online (Cashfree)' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-c">Status</span>
                  <span className={order.isPaid ? 'text-brand' : 'text-amber-400'}>{order.isPaid ? '✅ Paid' : '⏳ Pending'}</span>
                </div>
                {order.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-c">Paid At</span>
                    <span className="text-base-c">{new Date(order.paidAt).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                {order.paymentResult?.txId && (
                  <div className="flex justify-between">
                    <span className="text-muted-c">Txn ID</span>
                    <span className="text-base-c text-xs">{order.paymentResult.txId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default OrderDetail;
