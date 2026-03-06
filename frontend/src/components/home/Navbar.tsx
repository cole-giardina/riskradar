import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Shield } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Learn', href: '#learn' },
  { label: 'Stats', href: '#stats' },
  { label: 'FAQ', href: '#faq' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0d1117]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-[#00ffcc]">
          <Shield className="h-5 w-5" />
          <span className="text-lg">RiskRadar</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm text-[#8b949e] transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/register"
            className="rounded-lg bg-[#00ffcc] px-4 py-2 text-sm font-medium text-[#0d1117] transition-colors hover:bg-[#00e6b8]"
          >
            Check My Risk
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-[#8b949e] transition-colors hover:border-white/20 hover:text-white"
          >
            Sign In
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-[#8b949e] md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#0d1117]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="rounded-lg px-3 py-2 text-left text-sm text-[#8b949e] transition-colors hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-white/[0.06] pt-3">
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg bg-[#00ffcc] px-4 py-2 text-center text-sm font-medium text-[#0d1117]"
                >
                  Check My Risk
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm font-medium text-[#8b949e]"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
