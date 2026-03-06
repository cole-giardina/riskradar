import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { KeyRound, Database, Repeat, UserX } from 'lucide-react';

const steps = [
  {
    icon: KeyRound,
    title: 'You reuse a password',
    description:
      'You create a strong password — but use it on your email, a shopping site, and a forum. Feels convenient. Seems fine.',
  },
  {
    icon: Database,
    title: 'One site gets breached',
    description:
      'The forum has a data breach. Your email and password are now in a leaked database, available to anyone.',
  },
  {
    icon: Repeat,
    title: 'Attackers try it everywhere',
    description:
      'Automated tools test that same email + password combination across hundreds of other services within hours.',
  },
  {
    icon: UserX,
    title: 'Your accounts are compromised',
    description:
      'If the password matches, they\'re in. Email, banking, social media — anything using the same credentials.',
  },
];

export function StorySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="learn" className="relative py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-[#ff3366]/[0.03] blur-[120px]" />
      </div>

      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
            How attacks happen
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">
            One weak link. Four steps to compromise.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#8b949e]">
            This is the most common attack chain in the real world. It doesn&apos;t
            require hacking — just reused credentials.
          </p>
        </motion.div>

        {/* Desktop: horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-10 h-px bg-gradient-to-r from-transparent via-[#00ffcc]/30 to-transparent" />

            <div className="grid grid-cols-4 gap-6">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="relative z-10 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#161b22]">
                    <step.icon className="h-8 w-8 text-[#00ffcc]" />
                  </div>
                  <div className="absolute left-1/2 top-10 z-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ffcc]" />
                  <h3 className="mb-2 text-center text-sm font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="text-center text-sm leading-relaxed text-[#8b949e]">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: vertical stack */}
        <div className="space-y-6 md:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#161b22]">
                  <step.icon className="h-5 w-5 text-[#00ffcc]" />
                </div>
                {i < steps.length - 1 && (
                  <div className="mt-2 h-full w-px bg-gradient-to-b from-[#00ffcc]/30 to-transparent" />
                )}
              </div>
              <div className="pb-6">
                <h3 className="mb-1 text-sm font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[#8b949e]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
