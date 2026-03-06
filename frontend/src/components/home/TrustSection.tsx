import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, BookOpen, Eye, Sparkles } from 'lucide-react';

const pillars = [
  {
    icon: Users,
    title: 'Built for normal people',
    description:
      'No security certifications required. RiskRadar translates complex threats into plain language anyone can act on.',
  },
  {
    icon: BookOpen,
    title: 'Education over fear',
    description:
      'We don\'t sell panic. We help you understand how risks work so you can make informed decisions about your digital life.',
  },
  {
    icon: Eye,
    title: 'Visibility, not complexity',
    description:
      'Most people don\'t need more tools. They need clarity about what\'s already happened and what to do next.',
  },
  {
    icon: Sparkles,
    title: 'Proactive, not reactive',
    description:
      'Check your exposure before something goes wrong. A few minutes now can prevent hours of damage later.',
  },
];

export function TrustSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 md:py-32">
      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
              Our approach
            </span>
            <h2 className="text-3xl font-bold md:text-4xl">
              Security shouldn&apos;t feel{' '}
              <span className="text-[#8b949e]">impossible</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[#8b949e]">
              Most people don&apos;t need more fear. They need clarity. RiskRadar
              turns invisible risks into understandable signals — so you can take
              action with confidence.
            </p>
            <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#161b22]/40 p-5">
              <blockquote className="text-sm italic leading-relaxed text-[#e6edf3]">
                &ldquo;The biggest security risk isn&apos;t sophisticated
                hacking — it&apos;s the gap between what people know and what
                they actually do.&rdquo;
              </blockquote>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                className="rounded-xl border border-white/[0.06] bg-[#161b22]/40 p-5"
              >
                <pillar.icon className="mb-3 h-5 w-5 text-[#00ffcc]" />
                <h3 className="mb-1.5 text-sm font-semibold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs leading-relaxed text-[#8b949e]">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
