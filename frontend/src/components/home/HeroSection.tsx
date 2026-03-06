import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, AlertTriangle, Lock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ffcc]/[0.04] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="mb-4 inline-block rounded-full border border-[#00ffcc]/20 bg-[#00ffcc]/5 px-3 py-1 text-xs font-medium text-[#00ffcc]">
                Free security assessment
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
            >
              See how exposed your{' '}
              <span className="bg-gradient-to-r from-[#00ffcc] to-[#00aaff] bg-clip-text text-transparent">
                digital life
              </span>{' '}
              really is.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-[#8b949e]"
            >
              RiskRadar checks your breach exposure, password habits, and security
              practices — then gives you a clear score and practical steps to
              improve.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-[#00ffcc] px-6 py-3 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20"
              >
                Check My Risk
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() =>
                  document.querySelector('#learn')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-[#e6edf3] transition-colors hover:border-white/20 hover:bg-white/5"
              >
                Learn How It Works
              </button>
            </motion.div>
          </div>

          {/* Right: Mini score card */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateY: -5 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#00ffcc]/10 via-transparent to-purple-500/10 blur-2xl" />
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#161b22]/80 p-6 shadow-2xl backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-[#8b949e]">Your Security Score</span>
                <span className="rounded-full bg-[#00ffcc]/10 px-2 py-0.5 text-xs text-[#00ffcc]">
                  Live
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[#00ffcc]">73</span>
                <span className="text-xl text-[#8b949e]">/ 100</span>
              </div>
              <p className="mt-1 text-xs text-[#00ffcc]/70">Top 38% of users</p>

              <div className="mt-6 space-y-3">
                {[
                  { icon: ShieldCheck, label: 'Breach Exposure', value: '2 found', color: 'text-[#ff6b35]' },
                  { icon: Lock, label: 'Password Health', value: 'Moderate', color: 'text-[#00ffcc]' },
                  { icon: AlertTriangle, label: '2FA Status', value: 'Not enabled', color: 'text-[#ff3366]' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-lg bg-[#0d1117]/60 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-[#8b949e]" />
                      <span className="text-sm text-[#8b949e]">{item.label}</span>
                    </div>
                    <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-[#0d1117]/60 px-3 py-2.5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Score trend</span>
                  <span className="text-[#00ff88]">+12 pts this month</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {[35, 42, 48, 45, 55, 60, 58, 65, 68, 73].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                      className="flex-1 rounded-sm bg-gradient-to-t from-[#00ffcc]/40 to-[#00ffcc]/80"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
