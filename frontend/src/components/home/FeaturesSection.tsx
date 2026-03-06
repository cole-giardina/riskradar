import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  SearchCheck,
  KeyRound,
  TrendingUp,
  Lightbulb,
  Globe,
  Bell,
} from 'lucide-react';

const features = [
  {
    icon: SearchCheck,
    title: 'Breach Monitoring',
    description:
      'Check if your email or domain has appeared in known data breaches. Powered by real breach databases.',
  },
  {
    icon: KeyRound,
    title: 'Password Analysis',
    description:
      'Test password strength with entropy analysis, crack time estimation, and breach exposure checks.',
  },
  {
    icon: TrendingUp,
    title: 'Score Tracking',
    description:
      'Get a personal security score that improves as you fix risks. Track your progress over time.',
  },
  {
    icon: Lightbulb,
    title: 'Smart Recommendations',
    description:
      'Receive personalized, plain-language guidance based on your specific risk profile.',
  },
  {
    icon: Globe,
    title: 'Public Profile',
    description:
      'Share your security score with a public link. Demonstrate your security awareness to others.',
  },
  {
    icon: Bell,
    title: 'Security Reminders',
    description:
      'Set reminders to check for new breaches and rotate passwords on a regular schedule.',
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#00ffcc]/[0.02] blur-[120px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
            Features
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">
            Everything you need to understand your risk
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#8b949e]">
            Real tools, practical insights, zero jargon. RiskRadar gives you
            the visibility to make better security decisions.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="group rounded-xl border border-white/[0.06] bg-[#161b22]/40 p-6 transition-all hover:border-white/10 hover:bg-[#161b22]/70"
            >
              <div className="mb-4 inline-flex rounded-lg bg-[#00ffcc]/5 p-2.5 transition-colors group-hover:bg-[#00ffcc]/10">
                <feature.icon className="h-5 w-5 text-[#00ffcc]" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#8b949e]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
