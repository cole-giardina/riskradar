import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ffcc]/[0.04] blur-[140px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
            Know your risk.{' '}
            <span className="bg-gradient-to-r from-[#00ffcc] to-[#00aaff] bg-clip-text text-transparent">
              Fix what matters.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#8b949e]">
            Create a free account to save your score, track improvements, and
            get personalized security recommendations. Start with a scan —
            no commitment required.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-[#00ffcc] px-8 py-3.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20"
          >
            Create Free Account
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-8 py-3.5 text-sm font-medium text-[#e6edf3] transition-colors hover:border-white/20 hover:bg-white/5"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
