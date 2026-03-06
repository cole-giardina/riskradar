import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  TrendingUp,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export function ProductPreviewSection() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ffcc]/[0.03] blur-[150px]" />
      </div>

      <ContainerScroll
        titleComponent={
          <div className="mb-8">
            <span className="mb-3 inline-block text-sm font-medium text-[#00ffcc]">
              Product preview
            </span>
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
              Cybersecurity,{' '}
              <span className="bg-gradient-to-r from-[#00ffcc] to-[#00aaff] bg-clip-text text-transparent">
                made visible
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#8b949e]">
              Your personal security dashboard — breach exposure, password health,
              and actionable recommendations in one place.
            </p>
          </div>
        }
      >
        <DashboardMockup />
      </ContainerScroll>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="p-4 md:p-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#00ffcc]" />
          <span className="font-semibold text-white">RiskRadar Dashboard</span>
        </div>
        <span className="rounded-full bg-[#00ffcc]/10 px-3 py-1 text-xs font-medium text-[#00ffcc]">
          Pro
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Score */}
        <div className="rounded-xl border border-white/[0.06] bg-[#161b22]/80 p-5">
          <div className="text-sm text-[#8b949e]">Overall Score</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#00ff88]">82</span>
            <span className="text-lg text-[#8b949e]">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[#00ff88]" />
            <span className="text-xs text-[#00ff88]">+9 from last scan</span>
          </div>
        </div>

        {/* Breach status */}
        <div className="rounded-xl border border-white/[0.06] bg-[#161b22]/80 p-5">
          <div className="flex items-center gap-2 text-sm text-[#8b949e]">
            <Eye className="h-4 w-4" />
            Breach Exposure
          </div>
          <div className="mt-2 text-2xl font-bold text-[#ff6b35]">2 found</div>
          <p className="mt-2 text-xs text-[#8b949e]">
            Credentials from 2 services were found in known breaches
          </p>
        </div>

        {/* 2FA */}
        <div className="rounded-xl border border-white/[0.06] bg-[#161b22]/80 p-5">
          <div className="flex items-center gap-2 text-sm text-[#8b949e]">
            <Lock className="h-4 w-4" />
            2FA Status
          </div>
          <div className="mt-2 text-2xl font-bold text-[#00ffcc]">Enabled</div>
          <p className="mt-2 text-xs text-[#8b949e]">
            TOTP-based two-factor authentication is active
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#161b22]/80 p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
          <AlertTriangle className="h-4 w-4 text-[#ff6b35]" />
          Recommendations
        </div>
        <div className="space-y-2.5">
          {[
            'Change your password for LinkedIn — found in 2023 breach',
            'Enable 2FA on your Google account for critical protection',
            'Stop reusing your email password on other services',
            'Check for new paste exposures monthly',
          ].map((rec) => (
            <div key={rec} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00ffcc]/50" />
              <span className="text-sm text-[#8b949e]">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Password health bar */}
      <div className="mt-4 rounded-xl border border-white/[0.06] bg-[#161b22]/80 p-5">
        <div className="mb-3 text-sm font-medium text-white">Password Health</div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Strong', pct: 60, color: 'bg-[#00ff88]' },
            { label: 'Moderate', pct: 25, color: 'bg-[#ff6b35]' },
            { label: 'Weak', pct: 10, color: 'bg-[#ff3366]' },
            { label: 'Reused', pct: 5, color: 'bg-purple-400' },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-[#8b949e]">{item.label}</span>
                <span className="text-xs font-medium text-white">{item.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
