import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-base mt-24 overflow-hidden" style={{ borderTop: '1px solid var(--border-base)' }}>
      {/* Decorative gradient */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--brand), transparent)' }}
      />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[200px] opacity-10 blur-3xl rounded-full"
           style={{ background: 'var(--brand)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden"
        >
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'var(--brand)' }} />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="section-eyebrow">Stay in the loop</p>
              <h3 className="font-display font-bold text-3xl md:text-4xl text-base-c leading-tight">
                Get <span className="text-gradient">exclusive deals</span> in your inbox
              </h3>
              <p className="text-muted-c mt-3">Join 500K+ shoppers getting early access to drops & offers.</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field flex-1"
                required
              />
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Subscribe <ArrowRight className="inline w-4 h-4 ml-1" />
              </motion.button>
            </form>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
                <Zap className="w-5 h-5" fill="currentColor" style={{ color: 'var(--brand-contrast)' }} />
              </div>
              <span className="font-display font-bold text-xl text-base-c">
                Shop<span className="text-gradient">Wave</span>
              </span>
            </Link>
            <p className="text-muted-c text-sm leading-relaxed mb-6 max-w-xs">
              Your premium destination for the best products at unbeatable prices. Shop smart, live better.
            </p>
            <div className="flex gap-2">
              {[
                { Icon: Instagram, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Facebook, href: '#' },
                { Icon: Youtube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i} href={href}
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center text-muted-c hover:text-brand transition-colors glow-on-hover"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-base-c mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {[['Home', '/'], ['Products', '/products'], ['Cart', '/cart'], ['My Orders', '/orders'], ['Profile', '/profile']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="link-arrow group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    <span className="group-hover:-translate-x-1 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display font-bold text-base-c mb-5 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-3">
              {['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Books'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat)}`} className="link-arrow group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    <span className="group-hover:-translate-x-1 transition-transform">{cat}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-base-c mb-5 text-sm uppercase tracking-wider">Contact</h4>
            <div className="space-y-3">
              {[
                { Icon: Mail, text: 'support@shopwave.com' },
                { Icon: Phone, text: '+91 98765 43210' },
                { Icon: MapPin, text: 'Mumbai, Maharashtra' },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-muted-c text-sm">
                  <Icon className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="divider mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-faint-c text-sm flex items-center gap-1.5">
            © {new Date().getFullYear()} ShopWave. Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in India.
          </p>
          <div className="flex items-center gap-4 text-faint-c text-xs">
            <Link to="#" className="hover:text-brand transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-brand transition-colors">Terms</Link>
            <Link to="#" className="hover:text-brand transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
