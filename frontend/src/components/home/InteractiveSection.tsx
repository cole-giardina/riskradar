import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { AlertTriangle, Check, X, Mail, Shield, Eye, EyeOff } from 'lucide-react';

export function InteractiveSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-24 md:py-32">
      <div ref={ref} className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
            Test yourself
          </span>
          <h2 className="text-3xl font-bold md:text-4xl">
            Can you spot the risk?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#8b949e]">
            Real security starts with awareness. Try these quick challenges
            to test your instincts.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0 }}
          >
            <PhishingCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PasswordCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <ChecklistCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PhishingCard() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="h-full rounded-xl border border-white/[0.06] bg-[#161b22]/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-[#00ffcc]" />
        <h3 className="font-semibold text-white">Would you click this?</h3>
      </div>

      <div className="rounded-lg border border-white/[0.04] bg-[#0d1117] p-4">
        <div className="mb-2 text-xs text-[#8b949e]">
          From: <span className="text-white">security@paypa1-support.com</span>
        </div>
        <div className="mb-3 text-sm font-medium text-white">
          Urgent: Unusual sign-in activity detected
        </div>
        <p className="mb-3 text-xs leading-relaxed text-[#8b949e]">
          We noticed a sign-in attempt from an unrecognized device. If this
          wasn&apos;t you, please verify your account immediately to prevent
          unauthorized access.
        </p>
        <div className="rounded-md bg-[#ff3366]/20 px-3 py-1.5 text-center text-xs font-medium text-[#ff3366]">
          Verify My Account Now →
        </div>
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-4 w-full rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-[#8b949e] transition-colors hover:border-white/20 hover:text-white"
        >
          Reveal the red flags
        </button>
      ) : (
        <div className="mt-4 space-y-2">
          {[
            'Sender domain is "paypa1" (number 1, not letter l)',
            'Creates urgency to bypass rational thinking',
            'Generic greeting — doesn\'t use your name',
            'Links to external verification (credential harvesting)',
          ].map((flag) => (
            <div key={flag} className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff6b35]" />
              <span className="text-xs text-[#8b949e]">{flag}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PasswordCard() {
  const [showPassword, setShowPassword] = useState(false);
  const passwords = [
    { value: 'password123', strength: 'Terrible', color: 'bg-[#ff3366]', width: '10%' },
    { value: 'Tr0ub4dor&3', strength: 'Moderate', color: 'bg-[#ff6b35]', width: '50%' },
    { value: 'correct-horse-battery-staple', strength: 'Strong', color: 'bg-[#00ff88]', width: '95%' },
  ];

  return (
    <div className="h-full rounded-xl border border-white/[0.06] bg-[#161b22]/60 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="h-5 w-5 text-[#00ffcc]" />
        <h3 className="font-semibold text-white">Password strength matters</h3>
      </div>

      <div className="space-y-4">
        {passwords.map((pw) => (
          <div key={pw.value}>
            <div className="mb-1.5 flex items-center justify-between">
              <code className="flex items-center gap-2 text-xs text-[#8b949e]">
                {showPassword ? pw.value : '•'.repeat(Math.min(pw.value.length, 20))}
              </code>
              <span
                className={`text-xs font-medium ${
                  pw.strength === 'Terrible'
                    ? 'text-[#ff3366]'
                    : pw.strength === 'Moderate'
                    ? 'text-[#ff6b35]'
                    : 'text-[#00ff88]'
                }`}
              >
                {pw.strength}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pw.color}`}
                style={{ width: pw.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowPassword(!showPassword)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-[#8b949e] transition-colors hover:border-white/20 hover:text-white"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {showPassword ? 'Hide' : 'Show'} passwords
      </button>

      <p className="mt-3 text-xs leading-relaxed text-[#8b949e]">
        Longer passphrases with real words beat short complex passwords. Length
        is the single biggest factor in password strength.
      </p>
    </div>
  );
}

function ChecklistCard() {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const items = [
    'I use unique passwords for important accounts',
    'I have 2FA enabled on email and banking',
    'I check for breaches at least once a year',
    'I don\'t click links in unexpected emails',
    'I keep my devices and browsers updated',
    'I use a password manager',
  ];

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const score = Math.round((checkedCount / items.length) * 100);

  return (
    <div className="h-full rounded-xl border border-white/[0.06] bg-[#161b22]/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#00ffcc]" />
          <h3 className="font-semibold text-white">Security hygiene check</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            score >= 80
              ? 'bg-[#00ff88]/10 text-[#00ff88]'
              : score >= 50
              ? 'bg-[#ff6b35]/10 text-[#ff6b35]'
              : 'bg-[#ff3366]/10 text-[#ff3366]'
          }`}
        >
          {score}%
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.03]"
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                checked[i]
                  ? 'border-[#00ffcc] bg-[#00ffcc]/10'
                  : 'border-white/10'
              }`}
            >
              {checked[i] ? (
                <Check className="h-3 w-3 text-[#00ffcc]" />
              ) : (
                <X className="h-3 w-3 text-transparent" />
              )}
            </div>
            <span className={`text-sm ${checked[i] ? 'text-[#e6edf3]' : 'text-[#8b949e]'}`}>
              {item}
            </span>
          </button>
        ))}
      </div>

      {checkedCount === items.length && (
        <div className="mt-4 rounded-lg bg-[#00ff88]/5 px-3 py-2 text-center text-xs text-[#00ff88]">
          You have excellent security habits.
        </div>
      )}
    </div>
  );
}
