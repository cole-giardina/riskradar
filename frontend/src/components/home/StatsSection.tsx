import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { KeyRound, Fingerprint, ShieldOff, DatabaseZap } from 'lucide-react';

const stats = [
  {
    icon: KeyRound,
    number: '65%',
    label: 'of people reuse passwords',
    description:
      'Password reuse across multiple accounts is one of the most common security gaps. One breach can cascade into many.',
  },
  {
    icon: Fingerprint,
    number: '<30%',
    label: 'use multi-factor auth',
    description:
      'Despite being one of the simplest protections available, most people still haven\'t enabled MFA on critical accounts.',
  },
  {
    icon: ShieldOff,
    number: '80%',
    label: 'of breaches involve weak or stolen credentials',
    description:
      'Phishing and credential stuffing remain the most common attack paths — and the easiest to prevent.',
  },
  {
    icon: DatabaseZap,
    number: '10B+',
    label: 'records exposed in data breaches',
    description:
      'Old breaches don\'t expire. Compromised data circulates for years, affecting accounts people forgot they had.',
  },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="stats" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-purple-500/[0.03] blur-[120px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
            The reality
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">
            Cybersecurity risks are more common than you think
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#8b949e]">
            These patterns show up consistently across security research. Understanding
            them is the first step to protecting yourself.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-xl border border-white/[0.06] bg-[#161b22]/60 p-6 transition-colors hover:border-white/10 hover:bg-[#161b22]/80"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[#00ffcc]/5 p-2.5">
                <stat.icon className="h-5 w-5 text-[#00ffcc]" />
              </div>
              <div className="mb-1 text-3xl font-bold text-white">{stat.number}</div>
              <div className="mb-3 text-sm font-medium text-[#e6edf3]">{stat.label}</div>
              <p className="text-sm leading-relaxed text-[#8b949e]">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
