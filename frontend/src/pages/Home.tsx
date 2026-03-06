import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/home/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { ProductPreviewSection } from '@/components/home/ProductPreviewSection';
import { StorySection } from '@/components/home/StorySection';
import { InteractiveSection } from '@/components/home/InteractiveSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TrustSection } from '@/components/home/TrustSection';
import { CTASection } from '@/components/home/CTASection';
import { Footer } from '@/components/home/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProductPreviewSection />
      <StorySection />
      <InteractiveSection />
      <FeaturesSection />
      <TrustSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

const faqs = [
  {
    q: 'Is RiskRadar free?',
    a: 'Yes. You can run a full security scan and get your score for free. Create an account to save your results and track improvement over time.',
  },
  {
    q: 'Do you store my passwords?',
    a: 'Never. Password checks use k-anonymity hashing — we only send a partial hash to check against breach databases. Your full password never leaves your device.',
  },
  {
    q: 'Where does the breach data come from?',
    a: 'We check against publicly known breach databases including HaveIBeenPwned and similar sources. These are the same databases security researchers use.',
  },
  {
    q: 'Who is this for?',
    a: 'Anyone who uses the internet. RiskRadar is designed for regular people — not security professionals. If you have email accounts, social media, or online banking, this is relevant to you.',
  },
  {
    q: 'How is my score calculated?',
    a: 'Your score combines breach exposure, password strength, security habits (from a quick quiz), and whether you use protections like 2FA. It\'s a holistic view of your security posture.',
  },
];

function FAQSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div ref={ref} className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
            FAQ
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">
            Common questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-[#161b22]/40 px-5 py-4 text-left transition-colors hover:bg-[#161b22]/60"
              >
                <span className="pr-4 text-sm font-medium text-[#e6edf3]">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[#8b949e] transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pt-2 pb-4 text-sm leading-relaxed text-[#8b949e]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
