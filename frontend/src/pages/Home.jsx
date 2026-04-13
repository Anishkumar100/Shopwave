import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Truck, Shield, Headphones, ArrowRight, Star, Zap, TrendingUp, Sparkles, Clock, Tag, Gift } from 'lucide-react';
import { fetchFeatured } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';
import { promosStore } from '../utils/promosStore';

/* ---------- Reveal wrapper ---------- */
const Reveal = ({ children, delay = 0, y = 40 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
};

const categories = [
  { name: 'Electronics',   img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80' },
  { name: 'Fashion',       img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&q=80' },
  { name: 'Home & Living', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&q=80' },
  { name: 'Sports',        img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80' },
  { name: 'Books',         img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&q=80' },
];

const features = [
  { icon: Truck,       title: 'Free Delivery',    desc: 'On orders above ₹499' },
  { icon: Shield,      title: 'Secure Payment',   desc: 'Powered by Cashfree' },
  { icon: Headphones,  title: '24/7 Support',     desc: 'We\'re always here' },
  { icon: TrendingUp,  title: 'Best Deals',       desc: 'Up to 70% off' },
];

const marqueeItems = ['FREE SHIPPING ABOVE ₹499', 'NEW DROPS EVERY WEEK', '70% OFF — LIMITED TIME', 'AUTHENTIC BRANDS', 'FAST DELIVERY', 'EASY RETURNS'];

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featured, loading } = useSelector((state) => state.products);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  useEffect(() => { dispatch(fetchFeatured()); }, [dispatch]);

  // Live promotions from backend
  const [flashCfg, setFlashCfg] = useState(null);
  const [bundleList, setBundleList] = useState([]);
  const [couponList, setCouponList] = useState([]);
  useEffect(() => {
    promosStore.fetchFlashSale().then((r) => setFlashCfg(r.active)).catch(() => setFlashCfg(null));
    promosStore.fetchBundles({ page: 1, limit: 6 }).then((r) => setBundleList(r.bundles || [])).catch(() => setBundleList([]));
    promosStore.fetchCoupons().then((list) => setCouponList((list || []).filter(c => c.active))).catch(() => setCouponList([]));
  }, []);

  // Flash sale countdown — 24h rolling
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const flashEnd = flashCfg?.endsAt ? new Date(flashCfg.endsAt).getTime() : Date.now() + 24 * 3600000;
  const remaining = Math.max(0, flashEnd - now);
  const hh = String(Math.floor(remaining / 3600000)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');

  // Apple-style scroll-linked section
  const appleRef = useRef(null);
  const { scrollYProgress: appleP } = useScroll({ target: appleRef, offset: ['start end', 'end start'] });
  const appleScale = useTransform(appleP, [0, 0.5, 1], [0.85, 1, 0.9]);
  const appleRot = useTransform(appleP, [0, 1], [-6, 6]);
  const appleY = useTransform(appleP, [0, 1], [80, -80]);

  return (
    <div className="pt-16 md:pt-20">
      {/* =================== HERO =================== */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-[500px] h-[500px] opacity-30 blur-3xl animate-blob"
               style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 60%)' }} />
          <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] opacity-20 blur-3xl animate-blob"
               style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 60%)', animationDelay: '3s' }} />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
            }}
          />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand text-brand text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                New Arrivals Just Dropped
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-ring" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[88px] text-base-c leading-[0.95] tracking-tight mb-6"
              >
                Shop The<br />
                <span className="text-gradient">Future</span> Today.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-muted-c text-lg leading-relaxed mb-8 max-w-xl"
              >
                Discover thousands of premium products with lightning-fast delivery and unbeatable prices. Your next favorite thing is just a click away.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/products">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="btn-primary px-8 py-4 text-base flex items-center gap-3"
                  >
                    <ShoppingBag className="w-5 h-5" /> Shop Now
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </motion.button>
                </Link>
                <Link to="/products?sort=-ratings">
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    className="btn-outline px-8 py-4 text-base flex items-center gap-3"
                  >
                    <Star className="w-5 h-5" /> Top Rated
                  </motion.button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-6 mt-12 pt-8 divider"
              >
                {[['10K+', 'Products'], ['500K+', 'Customers'], ['4.9★', 'Avg Rating']].map(([val, label]) => (
                  <div key={label}>
                    <p className="font-display font-bold text-2xl md:text-3xl text-base-c">{val}</p>
                    <p className="text-faint-c text-sm">{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
              className="relative hidden lg:block lg:col-span-5"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-8 rounded-full opacity-30 blur-2xl"
                  style={{ background: 'conic-gradient(from 0deg, var(--brand), transparent, var(--brand))' }}
                />
                <div className="relative glass-strong rounded-3xl p-5 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=700&q=85"
                    alt="Shopping"
                    className="w-full rounded-2xl object-cover aspect-square"
                  />
                  {/* Floating card — top */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    className="absolute -top-5 -left-5 glass-strong rounded-2xl p-3 shadow-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-brand-soft rounded-xl flex items-center justify-center text-lg">🛒</div>
                      <div>
                        <p className="text-base-c text-xs font-bold">Just ordered</p>
                        <p className="text-muted-c text-[11px]">iPhone 15 Pro</p>
                      </div>
                    </div>
                  </motion.div>
                  {/* Floating card — bottom */}
                  <motion.div
                    animate={{ y: [0, 12, 0] }}
                    transition={{ repeat: Infinity, duration: 4, delay: 0.8, ease: 'easeInOut' }}
                    className="absolute -bottom-5 -right-5 glass-strong rounded-2xl p-3 shadow-2xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <p className="text-base-c text-xs font-bold">4.9 / 5.0</p>
                        <p className="text-muted-c text-[11px]">500K+ Reviews</p>
                      </div>
                    </div>
                  </motion.div>
                  {/* Side badge */}
                  <motion.div
                    animate={{ x: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, delay: 1.2, ease: 'easeInOut' }}
                    className="absolute top-1/2 -right-4 -translate-y-1/2 glass-strong rounded-xl px-3 py-2 shadow-xl"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-brand" fill="currentColor" />
                      <span className="text-xs font-bold text-base-c">Fast ship</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =================== MARQUEE =================== */}
      <div className="py-6 border-y border-base overflow-hidden bg-card-soft">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((text, i) => (
            <div key={i} className="flex items-center gap-8 px-8">
              <span className="font-display font-bold text-xl md:text-2xl text-base-c tracking-tight">
                {text}
              </span>
              <Sparkles className="w-5 h-5 text-brand" />
            </div>
          ))}
        </div>
      </div>

      {/* =================== FEATURES =================== */}
      <Reveal>
        <section className="py-14 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                whileHover={{ y: -4 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 glass-hover"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand" />
                </div>
                <p className="font-display font-bold text-base-c text-base">{title}</p>
                <p className="text-faint-c text-sm mt-1">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* =================== CATEGORIES =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-eyebrow">Browse</p>
              <h2 className="section-title">Shop by Category</h2>
            </div>
            <Link to="/products" className="hidden md:inline-flex link-arrow">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={`/products?category=${encodeURIComponent(cat.name)}`}>
                  <div className="relative glass rounded-2xl overflow-hidden glow-on-hover transition-all cursor-pointer group aspect-[4/5]">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="font-display text-2xl text-white tracking-wide leading-none">{cat.name}</p>
                      <p className="text-white/70 text-xs mt-1.5 flex items-center gap-1">
                        Shop Now <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* =================== FEATURED =================== */}
      <Reveal delay={0.1}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-eyebrow">Handpicked</p>
              <h2 className="section-title">Featured Products</h2>
            </div>
            <Link to="/products?featured=true" className="hidden md:inline-flex link-arrow">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => <ProductCard key={product._id} product={product} index={i} />)}
            </div>
          )}
          <div className="text-center mt-12">
            <Link to="/products">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="btn-outline px-10 py-3.5">
                View All Products <ArrowRight className="inline w-4 h-4 ml-2" />
              </motion.button>
            </Link>
          </div>
        </section>
      </Reveal>

      {/* =================== BRAND STRIP =================== */}
      <Reveal delay={0.05}>
        <section className="py-14 max-w-7xl mx-auto px-4">
          <p className="section-eyebrow text-center">Trusted by world-class brands</p>
          <h2 className="section-title text-center mb-10">Brands We Love</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&q=80',
              'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&q=80',
              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
              'https://images.unsplash.com/photo-1542219550-37153d387c27?w=300&q=80',
              'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&q=80',
              'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&q=80',
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.06, y: -4 }}
                className="glass rounded-2xl p-4 aspect-square overflow-hidden glow-on-hover"
              >
                <img src={img} alt={`Brand ${i + 1}`} loading="lazy"
                  className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* =================== LIFESTYLE GALLERY =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-eyebrow">Inspired Living</p>
            <h2 className="section-title">Style Your World</h2>
          </div>
          <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[600px]">
            {[
              { src: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', cls: 'col-span-12 md:col-span-6 row-span-2', tag: 'FASHION' },
              { src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', cls: 'col-span-6 md:col-span-3 row-span-1', tag: 'AUDIO' },
              { src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', cls: 'col-span-6 md:col-span-3 row-span-1', tag: 'SNEAKERS' },
              { src: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', cls: 'col-span-6 md:col-span-3 row-span-1', tag: 'INTERIORS' },
              { src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80', cls: 'col-span-6 md:col-span-3 row-span-1', tag: 'WATCHES' },
            ].map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
                className={`relative ${it.cls} rounded-2xl overflow-hidden group cursor-pointer`}
              >
                <img src={it.src} alt={it.tag} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 p-5">
                  <span className="badge-green mb-2">{it.tag}</span>
                  <p className="font-display text-2xl text-white tracking-wide">Discover →</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* =================== TESTIMONIALS =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-eyebrow">Customer Love</p>
            <h2 className="section-title">What Shoppers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Aarav Sharma', role: 'Verified Buyer', img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&q=80', stars: 5, text: 'Lightning-fast delivery and the product quality is unreal. ShopWave is now my default for everything.' },
              { name: 'Priya Mehta', role: 'Premium Member', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', stars: 5, text: 'The COD experience was seamless. Order arrived next day, paid the delivery person, done.' },
              { name: 'Rohan Iyer', role: 'Verified Buyer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', stars: 5, text: 'Honestly the cleanest checkout flow I have used in any Indian ecom site. Highly recommend.' },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className="glass rounded-2xl p-6 glow-on-hover"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base-c leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="font-display text-lg text-base-c tracking-wide">{t.name}</p>
                    <p className="text-faint-c text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* =================== STATS COUNTER =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="glass-strong rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--brand)' }} />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: '#06b6d4' }} />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { num: '500K+', label: 'Happy Customers' },
                { num: '10K+',  label: 'Products Listed' },
                { num: '98%',   label: 'Positive Reviews' },
                { num: '24/7',  label: 'Customer Support' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: 'spring' }}
                >
                  <p className="font-display text-5xl md:text-6xl text-gradient leading-none mb-2">{s.num}</p>
                  <p className="text-muted-c text-sm uppercase tracking-wider">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* =================== FAQ =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-eyebrow">Got Questions?</p>
            <h2 className="section-title">Frequently Asked</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'How fast is the delivery?', a: 'Most orders are delivered within 2-4 business days. Premium members get next-day delivery on eligible items.' },
              { q: 'Do you offer Cash on Delivery?', a: 'Yes! COD is available on all orders. Just select Cash on Delivery at checkout and pay when your order arrives.' },
              { q: 'What is your return policy?', a: 'We offer 7-day easy returns on all items. No questions asked. Original packaging required.' },
              { q: 'Are the products authentic?', a: 'Absolutely. Every product is sourced directly from authorized brands and verified for authenticity.' },
              { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking link via email and SMS. You can also track it from your Orders page.' },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl overflow-hidden group"
              >
                <summary className="p-5 cursor-pointer flex items-center justify-between font-display text-xl text-base-c tracking-wide list-none hover:text-brand transition-colors">
                  {faq.q}
                  <span className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-brand text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-muted-c leading-relaxed">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </section>
      </Reveal>

      {/* =================== FLASH SALE COUNTDOWN =================== */}
      {flashCfg?.active && <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="relative overflow-hidden rounded-3xl p-10 md:p-16"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)' }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl bg-yellow-300"
            />
            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur text-white text-xs font-bold mb-4">
                  <Clock className="w-3.5 h-3.5" /> ENDS IN
                </div>
                <h2 className="font-display text-5xl md:text-7xl text-white tracking-tight leading-none mb-3">
                  {flashCfg?.title || "FLASH SALE"}
                </h2>
                <p className="text-white/90 text-lg max-w-md">
                  {flashCfg?.subtitle || "Up to 80% off on selected items"}
                </p>
              </div>
              <div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[['HRS', hh], ['MIN', mm], ['SEC', ss]].map(([label, val]) => (
                    <motion.div
                      key={label}
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="glass-strong rounded-2xl p-4 text-center bg-white/15 backdrop-blur border border-white/30"
                    >
                      <AnimatePresence mode="popLayout">
                        <motion.p
                          key={val}
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          className="font-display text-5xl text-white tabular-nums"
                        >
                          {val}
                        </motion.p>
                      </AnimatePresence>
                      <p className="text-white/70 text-[10px] tracking-widest mt-1">{label}</p>
                    </motion.div>
                  ))}
                </div>
                <Link to="/products?sort=-discountPercent">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                    className="w-full bg-white text-red-600 font-display text-xl py-4 rounded-2xl tracking-wide shadow-2xl">
                    SHOP THE SALE →
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </Reveal>}

      {/* =================== BUNDLES =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-eyebrow">Better Together</p>
            <h2 className="section-title">Curated Bundles</h2>
            <p className="text-muted-c mt-3">Save more when you buy as a set</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {bundleList.map((bRaw, i) => { const b = { ...bRaw, img: bRaw.image || bRaw.img, items: (bRaw.products || []).map(p => p.name || p).slice(0, 4) }; return (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass rounded-3xl overflow-hidden glow-on-hover group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={b.img} alt={b.title} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 badge-green">{b.badge}</div>
                  <div className="absolute top-3 right-3 badge bg-red-500 text-white">
                    −{Math.round((1 - b.price / b.mrp) * 100)}%
                  </div>
                </div>
                <div className="p-5">
                  <Gift className="w-5 h-5 text-brand mb-2" />
                  <h3 className="font-display text-2xl text-base-c tracking-wide mb-3">{b.title}</h3>
                  <ul className="space-y-1 mb-4">
                    {b.items.map((it) => (
                      <li key={it} className="text-muted-c text-xs flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-brand" /> {it}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display text-2xl text-brand">₹{b.price.toLocaleString('en-IN')}</span>
                    <span className="text-faint-c line-through text-sm">₹{b.mrp.toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={() => { if (!b.products || b.products.length === 0) return toast.error("Bundle is empty"); const per = Math.round(b.price / b.products.length); b.products.forEach(p => dispatch(addToCart({ ...p, price: per, quantity: 1, bundleId: b._id, bundleTitle: b.title }))); toast.success(b.title + " added to cart"); navigate("/cart"); }} className="btn-primary w-full py-2.5 text-sm">Grab Bundle</button>
                </div>
              </motion.div>
            ); })}
          </div>
        </section>
      </Reveal>

      {/* =================== COUPONS SHOWCASE =================== */}
      <Reveal delay={0.05}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="section-eyebrow">Active Coupons</p>
            <h2 className="section-title">Save More With Codes</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {couponList.map((cRaw, i) => { const c = { ...cRaw, min: cRaw.minOrder || 0, color: ['#22c55e','#06b6d4','#f59e0b','#8b5cf6','#ec4899','#10b981'][i % 6] }; return (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.03, y: -2 }}
                className="relative glass rounded-2xl p-5 overflow-hidden cursor-pointer group"
                onClick={() => { navigator.clipboard?.writeText(c.code); }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: c.color }} />
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: c.color }} />
                <div className="flex items-center gap-3 mb-2">
                  <Tag className="w-5 h-5" style={{ color: c.color }} />
                  <p className="font-display text-2xl text-base-c tracking-wider">{c.code}</p>
                </div>
                <p className="text-muted-c text-sm">{c.label}</p>
                <p className="text-faint-c text-[10px] uppercase tracking-wider mt-2">
                  {c.min ? `Min order ₹${c.min}` : 'No minimum'} · Tap to copy
                </p>
              </motion.div>
            ); })}
          </div>
        </section>
      </Reveal>

      {/* =================== APPLE-STYLE SCROLL-LINKED =================== */}
      <section ref={appleRef} className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
          <motion.div style={{ y: appleY }}>
            <p className="section-eyebrow">Crafted to perfection</p>
            <h2 className="font-display text-5xl md:text-7xl text-base-c tracking-tight leading-[0.95] mb-6">
              Designed<br />for the <span className="text-gradient">moment.</span>
            </h2>
            <p className="text-muted-c text-lg leading-relaxed mb-8 max-w-md">
              Every product on ShopWave is hand-picked, quality-tested, and curated for people who refuse to settle. Premium, always.
            </p>
            <div className="flex gap-4">
              <Link to="/products"><button className="btn-primary px-7 py-3.5">Explore →</button></Link>
              <Link to="/dashboard"><button className="btn-outline px-7 py-3.5">Your Hub</button></Link>
            </div>
          </motion.div>
          <motion.div
            style={{ scale: appleScale, rotateZ: appleRot }}
            className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
          >
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85"
              alt="Premium product"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5))' }} />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <p className="font-display text-3xl tracking-wide">Premium. Period.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =================== PROMO BANNER =================== */}
      <Reveal delay={0.1}>
        <section className="py-16 max-w-7xl mx-auto px-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative overflow-hidden rounded-3xl glass-strong p-10 md:p-16"
          >
            <div className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, var(--brand) 0%, transparent 50%), radial-gradient(circle at 80% 50%, #06b6d4 0%, transparent 50%)' }}
            />
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 blur-3xl"
              style={{ background: 'conic-gradient(from 0deg, var(--brand), #06b6d4, var(--brand))' }}
            />
            <div className="relative text-center">
              <p className="section-eyebrow">Limited Time</p>
              <h2 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl text-base-c mb-4 tracking-tight">
                Up to <span className="text-gradient">70% OFF</span>
              </h2>
              <p className="text-muted-c text-lg mb-8 max-w-xl mx-auto">
                On electronics, fashion, and more. Grab your favorites before they're gone.
              </p>
              <Link to="/products?sort=-discountPercent">
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
                  className="btn-primary px-10 py-4 text-lg"
                >
                  Grab Deals Now 🔥
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      </Reveal>
    </div>
  );
};

export default Home;
