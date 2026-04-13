import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <motion.div
          className={`${sizes[size]} rounded-full border-2`}
          style={{ borderColor: 'var(--border-base)', borderTopColor: 'var(--brand)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 30px color-mix(in srgb, var(--brand) 40%, transparent)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>
      {text && <p className="text-muted-c text-sm font-body tracking-wide">{text}</p>}
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-base">
    <Loader size="lg" text="Loading ShopWave..." />
  </div>
);

export const SkeletonCard = () => (
  <div className="glass rounded-2xl overflow-hidden">
    <div className="shimmer-bg aspect-[4/3] w-full" />
    <div className="p-4 space-y-3">
      <div className="shimmer-bg h-3 w-1/4 rounded" />
      <div className="shimmer-bg h-4 w-4/5 rounded" />
      <div className="shimmer-bg h-3 w-1/2 rounded" />
      <div className="shimmer-bg h-6 w-1/3 rounded" />
    </div>
  </div>
);

export const InlineSpinner = () => (
  <motion.div
    className="inline-block w-4 h-4 rounded-full border-2"
    style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
  />
);

export default Loader;
