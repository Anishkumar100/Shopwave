import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star, Plus, Minus, Truck, Shield, ArrowLeft, Share2 } from 'lucide-react';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { PageLoader } from '../components/Loader';
import toast from 'react-hot-toast';
import API from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((s) => s.products);
  const { user } = useSelector((s) => s.auth);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [tab, setTab] = useState('desc');

  useEffect(() => { dispatch(fetchProductById(id)); }, [id, dispatch]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ ...product, quantity: qty }));
    toast.success(`${qty}x ${product.name.substring(0, 20)}... added!`);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ ...product, quantity: qty }));
    navigate('/checkout');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    try {
      await API.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      dispatch(fetchProductById(id));
      setReview({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Review failed'); }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-c hover:text-base-c mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative rounded-2xl overflow-hidden bg-surface aspect-square mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={product.images?.[activeImg]?.url || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {discount > 0 && (
                <div className="absolute top-4 left-4 badge bg-brand text-[color:var(--brand-contrast)] font-bold text-sm px-3 py-1">
                  -{discount}%
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-brand' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <div>
              <p className="text-brand text-sm font-medium uppercase tracking-widest mb-1">{product.brand}</p>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-base-c leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-faint-c'}`} />
                ))}
              </div>
              <span className="text-muted-c text-sm">{product.ratings.toFixed(1)} ({product.numReviews} reviews)</span>
            </div>

            <div className="flex items-end gap-3">
              <span className="font-display font-extrabold text-4xl text-brand">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-faint-c line-through text-xl">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="badge-green text-sm">Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}</span>
                </>
              )}
            </div>

            <p className="text-muted-c leading-relaxed">{product.shortDescription || product.description?.substring(0, 200)}</p>

            {/* Qty */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 glass rounded-xl p-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-card-soft rounded-lg transition-colors">
                  <Minus className="w-4 h-4 text-base-c" />
                </button>
                <span className="w-10 text-center font-bold text-base-c">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="p-2 hover:bg-card-soft rounded-lg transition-colors">
                  <Plus className="w-4 h-4 text-base-c" />
                </button>
              </div>
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-brand' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 btn-outline py-4 min-w-[150px] disabled:opacity-40"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 15px 30px rgba(34,197,94,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center btn-primary py-4 min-w-[150px] disabled:opacity-40"
              >
                Buy Now ⚡
              </motion.button>
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="p-4 glass-hover rounded-xl text-muted-c hover:text-base-c">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-base">
              {[
                { icon: Truck, text: 'Free delivery above ₹499' },
                { icon: Shield, text: '100% Secure Payment' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-muted-c text-sm">
                  <Icon className="w-4 h-4 text-brand" /> {text}
                </div>
              ))}
            </div>

            {/* SKU */}
            <p className="text-faint-c text-xs">SKU: {product.sku}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 glass rounded-xl p-1 max-w-md">
          {[['desc', 'Description'], ['specs', 'Specifications'], ['reviews', `Reviews (${product.numReviews})`]].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === val ? 'bg-brand text-[color:var(--brand-contrast)]' : 'text-muted-c hover:text-base-c'}`}>
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {tab === 'desc' && (
              <div className="glass rounded-2xl p-8 text-muted-c leading-relaxed whitespace-pre-line">{product.description}</div>
            )}
            {tab === 'specs' && (
              <div className="glass rounded-2xl p-8">
                {product.specifications?.length > 0 ? (
                  <table className="w-full">
                    <tbody>
                      {product.specifications.map((spec, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-card-soft' : ''}>
                          <td className="px-4 py-3 text-muted-c font-medium text-sm w-1/3">{spec.key}</td>
                          <td className="px-4 py-3 text-base-c text-sm">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-faint-c">No specifications available.</p>}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="space-y-4">
                {user && (
                  <div className="glass rounded-2xl p-6">
                    <h4 className="font-display font-bold text-base-c mb-4">Write a Review</h4>
                    <form onSubmit={handleReview} className="space-y-4">
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map((s) => (
                          <button type="button" key={s} onClick={() => setReview(r => ({ ...r, rating: s }))}>
                            <Star className={`w-7 h-7 transition-colors ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-faint-c hover:text-amber-300'}`} />
                          </button>
                        ))}
                      </div>
                      <textarea value={review.comment} onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))}
                        placeholder="Share your experience..."
                        rows={3} className="input-field resize-none" required />
                      <button type="submit" className="btn-primary py-2.5 px-6 text-sm">Submit Review</button>
                    </form>
                  </div>
                )}
                {product.reviews?.length === 0 ? (
                  <div className="glass rounded-2xl p-8 text-center text-faint-c">No reviews yet. Be the first!</div>
                ) : (
                  product.reviews.map((rev) => (
                    <motion.div key={rev._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="glass rounded-2xl p-5 flex gap-4">
                      <img src={rev.user?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.name}`}
                        className="w-10 h-10 rounded-xl bg-surface flex-shrink-0" alt="" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-bold text-base-c text-sm">{rev.name}</p>
                          <span className="text-faint-c text-xs">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex mb-2">
                          {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-faint-c'}`} />)}
                        </div>
                        <p className="text-muted-c text-sm">{rev.comment}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDetail;
