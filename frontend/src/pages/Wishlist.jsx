import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/Loader';
import API from '../api/axios';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/auth/me').then((r) => setWishlist(r.data.user.wishlist || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="section-title mb-8 flex items-center gap-3">
          <Heart className="w-8 h-8 text-brand" fill="currentColor" /> Wishlist
        </motion.h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <Heart className="w-20 h-20 text-faint-c mx-auto mb-6" />
            <h3 className="font-display font-bold text-xl text-base-c mb-2">Your wishlist is empty</h3>
            <p className="text-muted-c mb-8">Save items you love to buy later.</p>
            <Link to="/products" className="btn-primary px-8 py-4">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
};
export default Wishlist;
