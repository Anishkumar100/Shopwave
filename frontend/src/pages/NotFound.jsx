import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-base px-4">
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
      <motion.h1 animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}
        className="font-display font-extrabold text-[10rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-brand-500 to-dark-800">
        404
      </motion.h1>
      <h2 className="font-display font-bold text-3xl text-base-c mb-3">Page Not Found</h2>
      <p className="text-muted-c mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
        <Home className="w-5 h-5" /> Back to Home
      </Link>
    </motion.div>
  </div>
);
export default NotFound;
