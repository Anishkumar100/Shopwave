import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, CreditCard, Truck, CheckCircle, Tag, Navigation, X } from 'lucide-react';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart, selectCartTotal } from '../store/slices/cartSlice';
import { captureGeolocation } from '../utils/commerce';
import { applyCouponFromStore as applyCoupon, promosStore } from '../utils/promosStore';
import API from '../api/axios';
import toast from 'react-hot-toast';

const STEPS = ['Shipping', 'Payment', 'Confirm'];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const subtotal = useSelector(selectCartTotal);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { coupon, discount, freeShipping }
  const [couponChips, setCouponChips] = useState([]);
  useEffect(() => {
    promosStore.fetchCoupons().then((list) => setCouponChips((list || []).filter(c => c.active).slice(0, 3))).catch(() => {});
  }, []);
  const [geo, setGeo] = useState(null);  // { lat, lng } | null
  const [capturingGeo, setCapturingGeo] = useState(false);
  const baseShipping = subtotal > 499 ? 0 : 40;
  const shipping = appliedCoupon?.freeShipping ? 0 : baseShipping;
  const discount = appliedCoupon?.discount || 0;
  const tax = Math.round((subtotal - discount) * 0.18);
  const total = Math.max(0, subtotal - discount) + shipping + tax;
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cashfree');
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India',
  });

  // ============ COD Risk Rules (admin-configurable via env) ============
  const COD_MAX_VALUE = Number(import.meta.env.VITE_COD_MAX || 50000); // ₹50,000 default cap
  const COD_MIN_VALUE = Number(import.meta.env.VITE_COD_MIN || 100);   // ₹100 floor
  // Whitelist of allowed pincode prefixes (first 3 digits) — empty = allow all
  const COD_PINCODES = (import.meta.env.VITE_COD_PINCODES || '110,400,560,600,700,500,380,411,302,800').split(',').map(s => s.trim());
  const codCheck = (() => {
    if (total > COD_MAX_VALUE) return { ok: false, reason: `COD unavailable for orders above ₹${COD_MAX_VALUE.toLocaleString('en-IN')}` };
    if (total < COD_MIN_VALUE) return { ok: false, reason: `COD requires a minimum order of ₹${COD_MIN_VALUE}` };
    if (address.zipCode && COD_PINCODES.length && !COD_PINCODES.some(p => address.zipCode.startsWith(p))) {
      return { ok: false, reason: `COD not available for pincode ${address.zipCode}. Try online payment.` };
    }
    return { ok: true };
  })();

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!address[field]) return toast.error(`${field} is required`);
    }
    if (!geo) return toast.error('Please share your location to continue');
    setStep(1);
  };

  const handleApplyCoupon = async () => {
    const res = await applyCoupon(couponInput, subtotal);
    if (!res.ok) return toast.error(res.reason);
    setAppliedCoupon(res);
    toast.success(`Coupon ${res.coupon.code} applied — saved ₹${res.discount}!`);
  };

  const handleCaptureGeo = async () => {
    setCapturingGeo(true);
    const res = await captureGeolocation();
    setCapturingGeo(false);
    if (!res.ok) return toast.error(res.reason);
    setGeo({ lat: res.lat, lng: res.lng, accuracy: res.accuracy });
    // Auto-fill address fields from reverse geocoding
    if (res.address) {
      setAddress((prev) => ({
        ...prev,
        street:  prev.street  || res.address.street  || '',
        city:    prev.city    || res.address.city    || '',
        state:   prev.state   || res.address.state   || '',
        zipCode: prev.zipCode || res.address.zipCode || '',
        country: res.address.country || prev.country,
      }));
      toast.success('📍 Location captured & address auto-filled');
    } else {
      toast.success('📍 Location captured');
    }
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id, name: item.name,
          image: item.images?.[0]?.url || '', price: item.price, quantity: item.quantity,
        })),
        shippingAddress: { ...address, geoLocation: geo },
        paymentMethod,
        itemsPrice: subtotal, taxPrice: tax, shippingPrice: shipping, totalPrice: total,
        couponCode: appliedCoupon?.coupon?.code || null,
        discount,
      };

      const result = await dispatch(createOrder(orderData));
      if (result.meta.requestStatus === 'rejected') {
        throw new Error(result.payload || 'Failed to create order');
      }
      const order = result.payload;
      if (!order || !order._id) throw new Error('Invalid order response from server');

      if (paymentMethod === 'cod') {
        if (!codCheck.ok) { toast.error(codCheck.reason); setProcessing(false); return; }
        if (!geo)         { toast.error('Please share your location to confirm COD delivery'); setProcessing(false); return; }
        dispatch(clearCart());
        toast.success('Order placed successfully! 🎉 Pay on delivery.', { duration: 4000 });
        setTimeout(() => navigate(`/orders/${order._id}`), 600);
        return;
      }

      // ==================== Cashfree Payment Flow ====================
      console.group('%c💳 Cashfree Payment Debug', 'color:#22c55e;font-weight:bold;font-size:14px');
      console.log('[1/5] Order created in DB:', { orderId: order._id, amount: total, itemCount: cartItems.length });
      console.log('[2/5] Calling backend /payment/create-order...');
      const { data } = await API.post('/payment/create-order', {
        orderId: `sw_${order._id}`,
        amount: total,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: address.phone,
      });
      console.log('[3/5] Backend response:', data);

      if (!data || !data.paymentSessionId) {
        console.error('[ERROR] No paymentSessionId returned from backend. Check your Cashfree API keys in backend .env');
        console.groupEnd();
        throw new Error('Payment gateway not configured. Check server logs.');
      }

      // Store orderId for verification
      sessionStorage.setItem('pendingOrderId', order._id);
      sessionStorage.setItem('cfOrderId', data.cfOrderId);
      console.log('[4/5] Session storage set:', { pendingOrderId: order._id, cfOrderId: data.cfOrderId });

      if (typeof window.Cashfree !== 'function') {
        console.error('[ERROR] window.Cashfree SDK not loaded. Add the script tag to index.html or configure the SDK.');
        console.log('Expected SDK: https://sdk.cashfree.com/js/v3/cashfree.js');
        console.groupEnd();
        throw new Error('Cashfree SDK not loaded');
      }

      const mode = import.meta.env.VITE_CASHFREE_ENV === 'PRODUCTION' ? 'production' : 'sandbox';
      console.log('[5/5] Launching Cashfree checkout in', mode, 'mode');
      const cashfree = window.Cashfree({ mode });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: '_self' });
      console.groupEnd();

    } catch (err) {
      console.error('%c[Payment Error]', 'color:#ef4444;font-weight:bold', err);
      console.log('Tip: if you are testing without real Cashfree keys, the COD flow works end-to-end. Select Cash on Delivery to test the full flow.');
      toast.error(err.message || 'Order failed');
      setProcessing(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-title mb-8">Checkout</motion.h1>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-sm transition-all ${i <= step ? 'bg-brand text-[color:var(--brand-contrast)]' : 'glass text-faint-c'}`}>
                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              <span className={`ml-2 text-sm font-medium hidden md:block ${i <= step ? 'text-base-c' : 'text-faint-c'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 mx-3 h-px ${i < step ? 'bg-brand' : 'bg-card-soft'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass rounded-2xl p-6 border border-base">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-brand" />
                    </div>
                    <h2 className="font-display font-bold text-xl text-base-c">Shipping Address</h2>
                  </div>
                  <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'fullName', label: 'Full Name', col: 1 },
                      { key: 'phone', label: 'Phone Number', col: 1 },
                      { key: 'street', label: 'Street Address', col: 2 },
                      { key: 'city', label: 'City', col: 1 },
                      { key: 'state', label: 'State', col: 1 },
                      { key: 'zipCode', label: 'ZIP Code', col: 1 },
                      { key: 'country', label: 'Country', col: 1 },
                    ].map(({ key, label, col }) => (
                      <div key={key} className={col === 2 ? 'md:col-span-2' : ''}>
                        <label className="text-muted-c text-xs font-medium mb-1.5 block uppercase tracking-wider">{label}</label>
                        <input value={address[key]} onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                          className="input-field" placeholder={label} />
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className="text-muted-c text-xs font-medium mb-1.5 block uppercase tracking-wider">Delivery Location <span className="text-brand">*</span></label>
                      {geo ? (
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-brand-soft border-2 border-brand">
                          <Navigation className="w-5 h-5 text-brand" />
                          <div className="flex-1 text-sm">
                            <p className="text-brand font-bold">Location verified ✓</p>
                            <p className="text-faint-c text-xs">{geo.lat.toFixed(5)}, {geo.lng.toFixed(5)} · accuracy ~{Math.round(geo.accuracy || 0)}m</p>
                          </div>
                          <button type="button" onClick={() => setGeo(null)} className="text-xs text-muted-c hover:text-red-500">Recapture</button>
                        </motion.div>
                      ) : (
                        <motion.button type="button" onClick={handleCaptureGeo} disabled={capturingGeo}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-dashed border-base hover:border-brand transition-all text-muted-c hover:text-brand font-bold">
                          <Navigation className="w-5 h-5" />
                          {capturingGeo ? 'Capturing your location…' : 'Share Location (required)'}
                        </motion.button>
                      )}
                      <p className="text-faint-c text-[11px] mt-2">We use this to verify delivery address & ensure accurate drop-off</p>
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="btn-primary py-4 px-8">
                        Continue to Payment →
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass rounded-2xl p-6 border border-base">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-brand-soft rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-brand" />
                    </div>
                    <h2 className="font-display font-bold text-xl text-base-c">Payment Method</h2>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[
                      { id: 'cashfree', label: 'Pay Online', sub: 'UPI · Cards · Net Banking · Wallets', icon: '💳', tag: 'INSTANT', disabled: false, reason: '' },
                      { id: 'cod', label: 'Cash on Delivery', sub: 'Pay in cash when your order arrives at your door', icon: '💵', tag: 'NO PREPAY', disabled: !codCheck.ok, reason: codCheck.reason || '' },
                    ].map(({ id, label, sub, icon, tag, disabled, reason }) => (
                      <label key={id} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${disabled ? 'opacity-50 cursor-not-allowed border-base' : 'cursor-pointer'} ${paymentMethod === id && !disabled ? 'border-brand bg-brand-soft shadow-lg' : !disabled ? 'border-base hover:border-strong' : ''}`}>
                        <input type="radio" name="payment" value={id} checked={paymentMethod === id} disabled={disabled}
                          onChange={() => !disabled && setPaymentMethod(id)} className="accent-brand-500 w-4 h-4" />
                        <span className="text-3xl">{icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-display text-lg text-base-c tracking-wide">{label}</p>
                            <span className="badge-green text-[10px]">{tag}</span>
                            {disabled && <span className="badge-red text-[10px]">UNAVAILABLE</span>}
                          </div>
                          <p className="text-muted-c text-xs mt-0.5">{disabled && reason ? reason : sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="btn-outline py-3 px-6">← Back</button>
                    <motion.button onClick={() => setStep(2)} whileHover={{ scale: 1.02 }} className="btn-primary py-3 px-8">
                      Review Order →
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="glass rounded-2xl p-6 border border-base">
                  <h2 className="font-display font-bold text-xl text-base-c mb-6">Order Review</h2>
                  <div className="space-y-3 mb-6">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center gap-3 py-2 border-b border-base last:border-0">
                        <img src={item.images?.[0]?.url} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-surface" />
                        <div className="flex-1">
                          <p className="text-base-c text-sm font-medium line-clamp-1">{item.name}</p>
                          <p className="text-faint-c text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="price-tag text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="glass rounded-xl p-4 mb-6 text-sm space-y-1">
                    <p className="text-muted-c">📍 {address.street}, {address.city}, {address.state} - {address.zipCode}</p>
                    <p className="text-muted-c">📞 {address.phone}</p>
                    <p className="text-muted-c">💳 {paymentMethod === 'cashfree' ? 'Online Payment (Cashfree)' : 'Cash on Delivery'}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="btn-outline py-3 px-6">← Back</button>
                    <motion.button onClick={handlePlaceOrder} disabled={processing}
                      whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(34,197,94,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 btn-primary py-4 disabled:opacity-60">
                      {processing ? 'Processing...' : paymentMethod === 'cashfree' ? '💳 Pay ₹' + total.toLocaleString('en-IN') : '📦 Place Order'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="glass rounded-2xl p-5 border border-base h-fit sticky top-24">
            <h3 className="font-display font-bold text-base-c mb-4">Summary</h3>

            {/* Coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-soft border border-brand">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-brand" />
                    <div>
                      <p className="text-brand text-xs font-bold">{appliedCoupon.coupon.code}</p>
                      <p className="text-faint-c text-[10px]">−₹{appliedCoupon.discount}</p>
                    </div>
                  </div>
                  <button onClick={() => setAppliedCoupon(null)} className="text-muted-c hover:text-red-500">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="COUPON CODE" className="input-field text-xs uppercase tracking-wider py-2.5" />
                  <button type="button" onClick={handleApplyCoupon} className="btn-primary py-2.5 px-4 text-xs">Apply</button>
                </div>
              )}
              {!appliedCoupon && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {couponChips.map((c) => (
                    <button key={c.code} type="button" onClick={() => setCouponInput(c.code)}
                      className="text-[10px] px-2 py-1 rounded-full bg-brand-soft text-brand font-bold hover:scale-105 transition-transform">
                      {c.code}
                    </button>
                  ))}
                </div>
              )}
            </div>


            {[
              ['Items', `₹${subtotal.toLocaleString('en-IN')}`],
              ...(discount > 0 ? [['Discount', `−₹${discount.toLocaleString('en-IN')}`]] : []),
              ['Shipping', shipping === 0 ? 'FREE' : `₹${shipping}`],
              ['Tax (18%)', `₹${tax.toLocaleString('en-IN')}`],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-sm mb-3">
                <span className="text-muted-c">{l}</span>
                <span className={`font-medium ${v === 'FREE' || (typeof v === 'string' && v.startsWith('−')) ? 'text-brand' : 'text-base-c'}`}>{v}</span>
              </div>
            ))}
            <div className="border-t border-base pt-3 flex justify-between">
              <span className="font-display font-bold text-base-c">Total</span>
              <span className="font-display font-bold text-xl text-brand">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Checkout;
