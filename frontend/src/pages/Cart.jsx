import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { removeFromCart, updateQuantity, clearCart, selectCartTotal } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const subtotal = useSelector(selectCartTotal);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) { toast.error('Please login to continue'); navigate('/login'); return; }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center px-4 max-w-md">
          <div className="relative w-56 h-56 mx-auto mb-8">
            {/* Soft gradient halo */}
            <div className="absolute inset-0 rounded-full blur-3xl opacity-30"
                 style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 70%)' }} />
            {/* Floating SVG illustration */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="relative w-full h-full flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <ellipse cx="100" cy="175" rx="60" ry="6" fill="var(--brand)" opacity="0.15" />
                <path d="M55 70 L145 70 L155 165 Q155 175 145 175 L55 175 Q45 175 45 165 Z"
                      fill="url(#bagGrad)" stroke="var(--brand)" strokeWidth="2" />
                <path d="M75 70 Q75 45 100 45 Q125 45 125 70"
                      fill="none" stroke="var(--brand)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="80" cy="95" r="3" fill="var(--brand-contrast)" opacity="0.6" />
                <circle cx="120" cy="95" r="3" fill="var(--brand-contrast)" opacity="0.6" />
              </svg>
            </motion.div>
            {/* Orbiting dots */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-brand"
                animate={{
                  rotate: [i * 120, i * 120 + 360],
                }}
                transition={{ repeat: Infinity, duration: 6 + i, ease: 'linear' }}
                style={{ transformOrigin: '0 100px' }}
              />
            ))}
          </div>
          <h2 className="font-display font-bold text-4xl text-base-c mb-3">Your cart is waiting</h2>
          <p className="text-muted-c mb-8">Looks like you haven't added anything yet. Let's find something you'll love.</p>
          <Link to="/products" className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2">
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <h1 className="section-title">Shopping Cart <span className="text-faint-c text-2xl">({cartItems.length})</span></h1>
          <button onClick={() => { dispatch(clearCart()); toast.success('Cart cleared'); }}
            className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item, i) => (
                <motion.div key={item._id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-2xl p-4 md:p-5 flex gap-4 items-center border border-base hover:border-brand transition-all">
                  <Link to={`/products/${item._id}`}>
                    <img src={item.images?.[0]?.url || 'https://via.placeholder.com/80'}
                      alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-surface flex-shrink-0 hover:scale-105 transition-transform" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-faint-c text-xs font-medium uppercase tracking-wider">{item.brand}</p>
                    <Link to={`/products/${item._id}`}>
                      <h3 className="font-display font-bold text-base-c text-sm md:text-base line-clamp-2 hover:text-brand transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="price-tag text-base mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button onClick={() => { dispatch(removeFromCart(item._id)); toast.success('Removed'); }}
                      className="p-1.5 text-faint-c hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 glass rounded-xl p-1">
                      <button onClick={() => {
                        if (item.quantity === 1) { dispatch(removeFromCart(item._id)); return; }
                        dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }));
                      }} className="p-1.5 hover:bg-card-soft rounded-lg transition-colors">
                        <Minus className="w-3.5 h-3.5 text-base-c" />
                      </button>
                      <span className="w-8 text-center text-base-c text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => {
                        if (item.quantity >= item.stock) { toast.error('Max stock reached'); return; }
                        dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }));
                      }} className="p-1.5 hover:bg-card-soft rounded-lg transition-colors">
                        <Plus className="w-3.5 h-3.5 text-base-c" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-base sticky top-24">
              <h3 className="font-display font-bold text-base-c text-xl mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {[
                  ['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
                  ['Shipping', shipping === 0 ? '🎉 FREE' : `₹${shipping}`],
                  ['Tax (18%)', `₹${tax.toLocaleString('en-IN')}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-c">{label}</span>
                    <span className={`font-medium ${value.includes('FREE') ? 'text-brand' : 'text-base-c'}`}>{value}</span>
                  </div>
                ))}
                {shipping > 0 && (
                  <p className="text-xs text-faint-c bg-surface rounded-lg p-2">
                    💡 Add ₹{(499 - subtotal).toLocaleString('en-IN')} more for FREE shipping
                  </p>
                )}
                <div className="border-t border-base pt-4 flex justify-between">
                  <span className="font-display font-bold text-base-c">Total</span>
                  <span className="font-display font-bold text-xl text-brand">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <motion.button onClick={handleCheckout}
                whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(34,197,94,0.25)' }}
                whileTap={{ scale: 0.97 }}
                className="w-full btn-primary py-4 text-base">
                Proceed to Checkout <ArrowRight className="inline w-4 h-4 ml-2" />
              </motion.button>
              <Link to="/products" className="block text-center text-muted-c hover:text-base-c text-sm mt-4 transition-colors">
                ← Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Cart;
