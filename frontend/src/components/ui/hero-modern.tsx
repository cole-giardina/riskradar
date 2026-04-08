import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, ShieldCheck, Lock, AlertTriangle } from "lucide-react";

const STYLE_ID = "hero3-animations";

const RadarGlyph = () => {
  const stroke = "#00ffcc";
  const fill = "rgba(0,255,204,0.06)";

  return (
    <svg viewBox="0 0 120 120" className="h-16 w-16" aria-hidden>
      <circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke={stroke}
        strokeWidth="1.4"
        className="motion-safe:animate-[hero3-orbit_8.5s_linear_infinite] motion-reduce:animate-none"
        style={{ strokeDasharray: "18 14" }}
      />
      <rect
        x="34"
        y="34"
        width="52"
        height="52"
        rx="14"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        className="motion-safe:animate-[hero3-grid_5.4s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <circle cx="60" cy="60" r="7" fill={stroke} />
      <path
        d="M60 30v10M60 80v10M30 60h10M80 60h10"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinecap="round"
        className="motion-safe:animate-[hero3-pulse_6s_ease-in-out_infinite] motion-reduce:animate-none"
      />
    </svg>
  );
};

function HeroOrbitDeck() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"scan" | "monitor">("scan");
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.innerHTML = `
      @keyframes hero3-intro {
        0% { opacity: 0; transform: translate3d(0, 64px, 0) scale(0.98); filter: blur(12px); }
        60% { filter: blur(0); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
      }
      @keyframes hero3-card {
        0% { opacity: 0; transform: translate3d(0, 32px, 0) scale(0.95); }
        100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
      }
      @keyframes hero3-orbit {
        0% { stroke-dashoffset: 0; transform: rotate(0deg); transform-origin: 60px 60px; }
        100% { stroke-dashoffset: -64; transform: rotate(360deg); transform-origin: 60px 60px; }
      }
      @keyframes hero3-grid {
        0%, 100% { transform: rotate(-2deg); opacity: 0.7; transform-origin: 60px 60px; }
        50% { transform: rotate(2deg); opacity: 1; transform-origin: 60px 60px; }
      }
      @keyframes hero3-pulse {
        0%, 100% { stroke-dasharray: 0 200; opacity: 0.2; }
        45%, 60% { stroke-dasharray: 200 0; opacity: 1; }
      }
      @keyframes hero3-glow {
        0%, 100% { opacity: 0.45; transform: translate3d(0,0,0); }
        50% { opacity: 0.9; transform: translate3d(0,-8px,0); }
      }
      @keyframes hero3-drift {
        0%, 100% { transform: translate3d(0,0,0) rotate(-3deg); }
        50% { transform: translate3d(0,-12px,0) rotate(3deg); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  useEffect(() => {
    if (!sectionRef.current) {
      setVisible(true);
      return;
    }

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const palette = {
    surface: "bg-transparent text-[#e6edf3]",
    subtle: "text-[#8b949e]",
    border: "border-white/[0.08]",
    card: "bg-[#161b22]/60",
    accent: "bg-[#00ffcc]/5",
    glow: "rgba(0,255,204,0.12)",
  };

  const metrics = [
    { label: "Breaches checked", value: "10B+" },
    { label: "Avg scan time", value: "<3s" },
    { label: "User satisfaction", value: "96%" },
  ];

  const modes = useMemo(
    () => ({
      scan: {
        title: "Security Scan",
        description:
          "Analyze your breach exposure, password strength, and security habits in seconds. Get a clear 0–100 score with actionable steps to improve.",
        items: [
          "Email breach detection via HaveIBeenPwned",
          "Password entropy & crack-time analysis",
          "Security habit quiz with personalized scoring",
        ],
      },
      monitor: {
        title: "Ongoing Monitoring",
        description:
          "Track your security posture over time. Earn badges by completing challenges, get reminders to rotate passwords, and watch your score improve.",
        items: [
          "Score history with trend visualization",
          "Security challenges & achievement badges",
          "Automated reminders for password rotation",
        ],
      },
    }),
    []
  );

  const activeMode = modes[mode];

  const protocols = [
    {
      name: "Breach Detection",
      detail: "Scan your email against 10B+ compromised records. Results in under 3 seconds.",
      status: "Live",
    },
    {
      name: "Risk Assessment",
      detail: "Analyze password health, 2FA status, and security habits for a holistic score.",
      status: "Ready",
    },
    {
      name: "Action Plan",
      detail: "Receive prioritized, plain-language recommendations tailored to your risk profile.",
      status: "Active",
    },
  ];

  const setSpotlight = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--hero3-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--hero3-y", `${event.clientY - rect.top}px`);
  };

  const clearSpotlight = (event: React.MouseEvent<HTMLLIElement>) => {
    const target = event.currentTarget;
    target.style.removeProperty("--hero3-x");
    target.style.removeProperty("--hero3-y");
  };

  return (
    <div className={`relative isolate w-full ${palette.surface}`}>
      {/* Background layers */}
      <div
        className="pointer-events-none absolute inset-0 -z-30"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 80% 60% at 10% -10%, rgba(0,255,204,0.08), transparent 60%)",
            "radial-gradient(ellipse 90% 70% at 90% -20%, rgba(0,170,255,0.06), transparent 70%)",
          ].join(", "),
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(0,255,204,0.04) 0.7px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(0,255,204,0.03) 0.7px, transparent 1px)",
          backgroundSize: "12px 12px",
          backgroundRepeat: "repeat",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 10%, rgba(0,255,204,0.10), transparent 70%)",
          filter: "blur(22px)",
        }}
      />

      <section
        ref={sectionRef}
        className={`relative flex w-full flex-col gap-16 px-6 pt-32 pb-16 transition-opacity duration-700 md:gap-20 md:px-10 lg:px-16 xl:px-24 ${
          visible ? "motion-safe:animate-[hero3-intro_1s_cubic-bezier(.22,.68,0,1)_forwards]" : "opacity-0"
        }`}
      >
        <header className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)] lg:items-end">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.4em] ${palette.border} ${palette.accent} text-[#00ffcc]`}>
                <Shield className="h-3 w-3" />
                Cyber Security Score
              </span>
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                See how exposed your{" "}
                <span className="bg-gradient-to-r from-[#00ffcc] to-[#00aaff] bg-clip-text text-transparent">
                  digital life
                </span>{" "}
                really is.
              </h1>
              <p className={`max-w-2xl text-base md:text-lg ${palette.subtle}`}>
                RiskRadar checks your breach exposure, password habits, and security
                practices — then gives you a clear score and practical steps to
                improve. Like a credit score, but for cybersecurity.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-[#00ffcc] px-6 py-3 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20"
                >
                  Check My Risk
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    document.querySelector("#learn")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className={`rounded-full border px-6 py-3 text-sm font-medium transition ${palette.border} hover:bg-white/5`}
                >
                  Learn How It Works
                </button>
              </div>
              <div className={`flex divide-x divide-white/[0.08] overflow-hidden rounded-full border text-xs uppercase tracking-[0.35em] ${palette.border}`}>
                {metrics.map((metric) => (
                  <div key={metric.label} className="flex flex-col px-5 py-3">
                    <span className={`text-[11px] ${palette.subtle}`}>{metric.label}</span>
                    <span className="text-lg font-semibold tracking-tight text-[#00ffcc]">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mode card */}
          <div className={`relative flex flex-col gap-6 rounded-3xl border p-8 transition ${palette.border} ${palette.card} backdrop-blur-sm`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-[#00ffcc]">Mode</p>
                <h2 className="text-xl font-semibold tracking-tight">{activeMode.title}</h2>
              </div>
              <RadarGlyph />
            </div>
            <p className={`text-sm leading-relaxed ${palette.subtle}`}>{activeMode.description}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("scan")}
                className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                  mode === "scan"
                    ? "bg-[#00ffcc] text-[#0d1117] border-[#00ffcc]"
                    : `${palette.border} ${palette.accent} text-[#e6edf3]`
                }`}
              >
                Scan
              </button>
              <button
                type="button"
                onClick={() => setMode("monitor")}
                className={`flex-1 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                  mode === "monitor"
                    ? "bg-[#00ffcc] text-[#0d1117] border-[#00ffcc]"
                    : `${palette.border} ${palette.accent} text-[#e6edf3]`
                }`}
              >
                Monitor
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              {activeMode.items.map((item) => (
                <li key={item} className={`flex items-start gap-3 ${palette.subtle}`}>
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-[#00ffcc]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>

        {/* Three-column bento */}
        <div className="grid gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.9fr)] xl:items-stretch">
          {/* Left: capabilities */}
          <div className={`order-2 flex flex-col gap-6 rounded-3xl border p-8 transition ${palette.border} ${palette.card} backdrop-blur-sm xl:order-1`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.35em] text-[#00ffcc]">Capabilities</h3>
              <span className="text-xs uppercase tracking-[0.35em] opacity-60">v2.0</span>
            </div>
            <p className={`text-sm leading-relaxed ${palette.subtle}`}>
              Built for everyday people — not security professionals. Get real insight into
              your digital risk without jargon or complexity.
            </p>
            <div className="grid gap-3">
              {[
                { text: "Breach scanning via k-anonymity", icon: ShieldCheck },
                { text: "Password entropy analysis", icon: Lock },
                { text: "Personalized risk scoring", icon: AlertTriangle },
              ].map((item) => (
                <div
                  key={item.text}
                  className={`group relative overflow-hidden rounded-2xl border px-4 py-3 text-xs uppercase tracking-[0.3em] transition duration-500 hover:-translate-y-0.5 ${palette.border}`}
                  style={{
                    boxShadow: "none",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-[#00ffcc] shrink-0" />
                    <span>{item.text}</span>
                  </div>
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(180px circle at 50% 20%, ${palette.glow}, transparent 70%)` }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Center: score preview */}
          <figure className={`order-1 overflow-hidden rounded-[32px] border transition ${palette.border} xl:order-2`} style={{ position: "relative" }}>
            <div className="relative w-full bg-[#0d1117]">
              <div className="p-8 md:p-12">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#8b949e]">Your Security Score</span>
                  <span className="rounded-full bg-[#00ffcc]/10 px-2.5 py-0.5 text-xs text-[#00ffcc] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-7xl font-bold text-[#00ffcc] md:text-8xl">73</span>
                  <span className="text-2xl text-[#8b949e]">/ 100</span>
                </div>
                <p className="mt-2 text-sm text-[#00ffcc]/70">Top 38% of users</p>

                <div className="mt-8 space-y-3">
                  {[
                    { icon: ShieldCheck, label: "Breach Exposure", value: "2 found", color: "text-[#ff6b35]" },
                    { icon: Lock, label: "Password Health", value: "Moderate", color: "text-[#00ffcc]" },
                    { icon: AlertTriangle, label: "2FA Status", value: "Not enabled", color: "text-[#ff3366]" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-[#8b949e]" />
                        <span className="text-sm text-[#8b949e]">{item.label}</span>
                      </div>
                      <span className={`text-sm font-medium ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-[#8b949e]">Score trend</span>
                    <span className="text-[#00ff88]">+12 pts this month</span>
                  </div>
                  <div className="flex items-end gap-1 h-10">
                    {[35, 42, 48, 45, 55, 60, 58, 65, 68, 73].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-[#00ffcc]/30 to-[#00ffcc]/70 transition-all duration-700"
                        style={{ height: visible ? `${h}%` : "0%", transitionDelay: `${0.5 + i * 0.05}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <span className="pointer-events-none absolute -left-16 top-16 h-40 w-40 rounded-full border border-[#00ffcc]/10 opacity-70 motion-safe:animate-[hero3-glow_9s_ease-in-out_infinite]" />
              <span className="pointer-events-none absolute -right-12 bottom-16 h-48 w-48 rounded-full border border-[#00aaff]/10 opacity-40 motion-safe:animate-[hero3-drift_12s_ease-in-out_infinite]" />
            </div>
            <figcaption className={`flex items-center justify-between border-t border-white/[0.06] px-6 py-5 text-xs uppercase tracking-[0.35em] ${palette.subtle}`}>
              <span>Dashboard preview</span>
              <span className="flex items-center gap-2">
                <span className="h-1 w-8 bg-[#00ffcc]" />
                Real-time scoring
              </span>
            </figcaption>
          </figure>

          {/* Right: protocols */}
          <aside className={`order-3 flex flex-col gap-6 rounded-3xl border p-8 transition ${palette.border} ${palette.card} backdrop-blur-sm xl:order-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-[0.35em] text-[#00ffcc]">How It Works</h3>
              <span className="text-xs uppercase tracking-[0.35em] opacity-60">3 steps</span>
            </div>
            <ul className="space-y-4">
              {protocols.map((protocol, index) => (
                <li
                  key={protocol.name}
                  onMouseMove={setSpotlight}
                  onMouseLeave={clearSpotlight}
                  className={`group relative overflow-hidden rounded-2xl border px-5 py-4 transition duration-500 hover:-translate-y-0.5 ${palette.border}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(190px circle at var(--hero3-x, 50%) var(--hero3-y, 50%), rgba(0,255,204,0.12), transparent 72%)",
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.25em]">{protocol.name}</h4>
                    <span className={`text-[10px] uppercase tracking-[0.35em] ${
                      protocol.status === "Live" ? "text-[#00ff88]" : "text-[#00ffcc]/70"
                    }`}>
                      {protocol.status}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm leading-relaxed ${palette.subtle}`}>{protocol.detail}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/20 px-6 py-3 text-sm font-semibold text-[#00ffcc] transition hover:bg-[#00ffcc]/20"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default HeroOrbitDeck;
export { HeroOrbitDeck };
