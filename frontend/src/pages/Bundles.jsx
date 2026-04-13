import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Gift, ArrowRight, ShoppingCart, Package } from 'lucide-react';
import { promosStore } from '../utils/promosStore';
import { addToCart } from '../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Bundles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    promosStore.fetchBundles({ page, limit: 9 })
      .then((r) => { setBundles(r.bundles || []); setTotalPages(r.totalPages || 1); })
      .catch(() => setBundles([]))
      .finally(() => setLoading(false));
  }, [page]);

  const handleBuyBundle = (b) => {
    if (!b.products || b.products.length === 0) return toast.error('Bundle has no products');
    // Add every product in the bundle to cart at the discounted bundle rate split
    const perItem = Math.round(b.price / b.products.length);
    b.products.forEach((p) => {
      dispatch(addToCart({ ...p, price: perItem, quantity: 1, bundleId: b._id, bundleTitle: b.title }));
    });
    toast.success(`${b.title} added to cart — ${b.products.length} items`);
    navigate('/cart');
  };

  return (
    <div className="pt-24 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="section-eyebrow">Better Together</p>
          <h1 className="section-title">Curated Bundles</h1>
          <p className="text-muted-c mt-3">Save more when you buy as a set — hand-picked combos from our catalog</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-3xl overflow-hidden">
                <div className="shimmer-bg aspect-[4/3]" />
                <div className="p-5 space-y-3">
                  <div className="shimmer-bg h-4 w-3/4 rounded" />
                  <div className="shimmer-bg h-4 w-1/2 rounded" />
                  <div className="shimmer-bg h-10 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-faint-c mx-auto mb-4" />
            <p className="font-display text-2xl text-base-c mb-2">No bundles yet</p>
            <p className="text-muted-c">Check back soon — admin is curating combos for you.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((b, i) => {
              const discountPct = b.mrp > 0 ? Math.round((1 - b.price / b.mrp) * 100) : 0;
              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8 }}
                  className="glass rounded-3xl overflow-hidden glow-on-hover group"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={b.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'}
                      alt={b.title} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {b.badge && <div className="absolute top-3 left-3 badge-green">{b.badge}</div>}
                    {discountPct > 0 && (
                      <div className="absolute top-3 right-3 badge bg-red-500 text-white">−{discountPct}%</div>
                    )}
                  </div>
                  <div className="p-5">
                    <Gift className="w-5 h-5 text-brand mb-2" />
                    <h3 className="font-display text-2xl text-base-c tracking-wide mb-1">{b.title}</h3>
                    {b.description && <p className="text-muted-c text-xs mb-3">{b.description}</p>}
                    <ul className="space-y-1 mb-4">
                      {(b.products || []).slice(0, 4).map((p, j) => (
                        <li key={j} className="text-muted-c text-xs flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-brand" />
                          {p.name || 'Item'}
                        </li>
                      ))}
                      {(b.products || []).length > 4 && (
                        <li className="text-faint-c text-xs">+ {b.products.length - 4} more</li>
                      )}
                    </ul>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-display text-2xl text-brand">₹{b.price?.toLocaleString('en-IN')}</span>
                      {b.mrp > b.price && (
                        <span className="text-faint-c line-through text-sm">₹{b.mrp?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    <button onClick={() => handleBuyBundle(b)} className="btn-primary w-full py-2.5 text-sm inline-flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" /> Buy Bundle
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-xl font-display ${page === i + 1 ? 'bg-brand text-[color:var(--brand-contrast)]' : 'glass-hover text-muted-c'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bundles;
