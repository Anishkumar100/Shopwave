import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import API from '../api/axios';

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef(null);

  // 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 18 });

  const handleMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => { mx.set(0); my.set(0); };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name.substring(0, 24)}… added to cart`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to wishlist');
    try {
      await API.post(`/auth/wishlist/${product._id}`);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch { toast.error('Failed to update wishlist'); }
  };

  const discountPct = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      className="group relative"
    >
      <Link to={`/products/${product._id}`} className="block">
        <div
          className="relative glass rounded-2xl overflow-hidden glow-on-hover"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Image */}
          <div className="relative overflow-hidden bg-elev aspect-[4/3]">
            {!imageLoaded && <div className="absolute inset-0 shimmer-bg" />}
            <motion.img
              src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300'}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
              className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            />

            {/* Gradient overlay on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to top, var(--bg-base) 0%, transparent 60%)' }}
            />

            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {discountPct > 0 && (
                <motion.span
                  initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + index * 0.05, type: 'spring' }}
                  className="badge bg-brand text-[color:var(--brand-contrast)] shadow-glow-brand"
                >
                  −{discountPct}%
                </motion.span>
              )}
              {product.isFeatured && (
                <span className="badge bg-amber-500 text-white">⭐ Featured</span>
              )}
              {product.stock === 0 && <span className="badge-red">Out of Stock</span>}
            </div>

            {/* Wishlist */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleWishlist}
              className="absolute top-3 right-3 p-2 rounded-xl glass-strong opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
              aria-label="Add to wishlist"
            >
              <motion.span
                animate={isWishlisted ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className="inline-flex"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-base-c'}`} />
              </motion.span>
            </motion.button>

            {/* Bottom action bar — reveals on hover */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 z-10">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-[color:var(--brand-contrast)] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </motion.button>
              <Link
                to={`/products/${product._id}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 rounded-xl glass-strong text-base-c hover:text-brand transition-colors"
                aria-label="Quick view"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-[11px] text-faint-c font-semibold uppercase tracking-[0.14em] mb-1">
              {product.brand}
            </p>
            <h3 className="font-display font-semibold text-base-c text-sm leading-snug line-clamp-2 mb-2 group-hover:text-brand transition-colors min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= Math.round(product.ratings) ? 'text-amber-400 fill-amber-400' : 'text-faint-c'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-faint-c">({product.numReviews})</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="price-tag text-lg">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice > product.price && (
                <span className="text-faint-c line-through text-sm">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock hint */}
            <div className="mt-2 h-4">
              {product.stock > 0 && product.stock <= 5 ? (
                <p className="text-amber-500 text-xs font-medium">Only {product.stock} left!</p>
              ) : product.stock > 5 ? (
                <p className="text-brand text-xs font-medium inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-ring" /> In Stock
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
