import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';
import API from '../api/axios';

const SORT_OPTIONS = [
  { label: 'Newest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings' },
  { label: 'Most Popular', value: '-numReviews' },
  { label: 'Best Discount', value: '-discountPercent' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, totalCount, totalPages, currentPage } = useSelector((s) => s.products);
  const [categories, setCategories] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
    'price[gte]': searchParams.get('price[gte]') || '',
    'price[lte]': searchParams.get('price[lte]') || '',
    limit: 12,
  });

  useEffect(() => {
    API.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  // Sync URL -> state on external nav (e.g., from Home category click)
  useEffect(() => {
    const urlCat = searchParams.get('category') || '';
    const urlKw = searchParams.get('keyword') || '';
    if (urlCat !== filters.category || urlKw !== filters.keyword) {
      setFilters((p) => ({ ...p, category: urlCat, keyword: urlKw, page: 1 }));
    }
    // eslint-disable-next-line
  }, [searchParams]);

  const loadProducts = useCallback(() => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    // Resolve category name -> ObjectId for backend
    if (params.category && categories.length) {
      const match = categories.find(c => c.name?.toLowerCase() === params.category.toLowerCase() || c._id === params.category);
      if (match) params.category = match._id;
      else delete params.category;
    } else if (params.category && !categories.length) {
      // categories not loaded yet — wait
      return;
    }
    dispatch(fetchProducts(params));
    const sp = {};
    ['keyword', 'category', 'sort', 'page', 'price[gte]', 'price[lte]'].forEach((k) => {
      if (filters[k]) sp[k] = filters[k];
    });
    setSearchParams(sp, { replace: true });
  }, [filters, categories, dispatch, setSearchParams]);

  useEffect(() => { loadProducts(); }, [filters, categories]);

  const handleFilter = (key, value) => setFilters((prev) => ({
    ...prev,
    [key]: value,
    // Only reset to page 1 when changing filters OTHER than page
    ...(key !== 'page' ? { page: 1 } : {}),
  }));
  const clearFilters = () => setFilters({ keyword: '', category: '', sort: '-createdAt', page: 1, 'price[gte]': '', 'price[lte]': '', limit: 12 });

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="section-title mb-2">All Products</h1>
          <p className="text-muted-c text-sm">{totalCount} products found</p>
        </motion.div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.keyword}
              onChange={(e) => handleFilter('keyword', e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <select
            value={filters.sort}
            onChange={(e) => handleFilter('sort', e.target.value)}
            className="input-field md:w-52"
          >
            {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <button onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all ${filterOpen ? 'border-brand text-brand bg-brand-soft' : 'border-base text-muted-c hover:border-strong'}`}>
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Filter Panel */}
        <motion.div
          initial={false}
          animate={{ height: filterOpen ? 'auto' : 0, opacity: filterOpen ? 1 : 0 }}
          className="overflow-hidden"
        >
          <div className="glass rounded-2xl p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="text-muted-c text-xs font-medium mb-2 block uppercase tracking-wider">Category</label>
              <select value={filters.category} onChange={(e) => handleFilter('category', e.target.value)} className="input-field text-sm">
                <option value="">All Categories</option>
                {categories.map((cat) => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
              </select>
            </div>
            {/* Min Price */}
            <div>
              <label className="text-muted-c text-xs font-medium mb-2 block uppercase tracking-wider">Min Price (₹)</label>
              <input type="number" placeholder="0" value={filters['price[gte]']}
                onChange={(e) => handleFilter('price[gte]', e.target.value)} className="input-field text-sm" />
            </div>
            {/* Max Price */}
            <div>
              <label className="text-muted-c text-xs font-medium mb-2 block uppercase tracking-wider">Max Price (₹)</label>
              <input type="number" placeholder="999999" value={filters['price[lte]']}
                onChange={(e) => handleFilter('price[lte]', e.target.value)} className="input-field text-sm" />
            </div>
            {/* Clear */}
            <div className="flex items-end">
              <button onClick={clearFilters} className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm">
                <X className="w-4 h-4" /> Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">😕</p>
            <h3 className="font-display font-bold text-xl text-base-c mb-2">No products found</h3>
            <p className="text-muted-c">Try different search terms or filters</p>
            <button onClick={clearFilters} className="btn-primary mt-6">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => { handleFilter('page', currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-2.5 rounded-xl glass-hover disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i}
                onClick={() => { handleFilter('page', i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-xl font-display font-bold text-sm transition-all ${currentPage === i + 1 ? 'bg-brand text-[color:var(--brand-contrast)]' : 'glass-hover text-muted-c'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => { handleFilter('page', currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="p-2.5 rounded-xl glass-hover disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
