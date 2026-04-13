import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.08, rotate: isDark ? -15 : 15 }}
      whileTap={{ scale: 0.9, rotate: 180 }}
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative w-10 h-10 rounded-xl glass border-base flex items-center justify-center overflow-hidden glow-on-hover ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -24, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 24, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {isDark
            ? <Moon className="w-[18px] h-[18px] text-brand" strokeWidth={2.2} />
            : <Sun className="w-[18px] h-[18px] text-brand" strokeWidth={2.2} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
