import { useState, type MouseEvent } from 'react';
import { phishing } from '../lib/api';
import type { PhishingAnalyzeResponse } from '../lib/api';
import {
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Link2,
  Zap,
  Globe,
  FileText,
  ArrowRight,
} from 'lucide-react';

const setSpotlight = (e: MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
};
const clearSpotlight = (e: MouseEvent<HTMLDivElement>) => {
  e.currentTarget.style.removeProperty('--spot-x');
  e.currentTarget.style.removeProperty('--spot-y');
};

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onMouseMove={setSpotlight}
      onMouseLeave={clearSpotlight}
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#161b22]/60 backdrop-blur-sm transition duration-500 ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(0,255,204,0.08), transparent 70%)',
        }}
      />
      {children}
    </div>
  );
}

const SAMPLE_EMAIL = `From: security@paypa1-support.com
Subject: Urgent: Unusual sign-in activity detected

Dear Customer,

We noticed a sign-in attempt from an unrecognized device. If this wasn't you, please verify your account immediately to prevent unauthorized access.

<a href="https://evil.example.com/login">Click here to verify at paypal.com</a>

This link will expire within 24 hours. Act now to secure your account.

Best regards,
PayPal Security Team`;

function verdictColor(v: string) {
  if (v === 'phishing') return { text: 'text-[#ff3366]', bg: 'bg-[#ff3366]', border: 'border-[#ff3366]/20', bgSoft: 'bg-[#ff3366]/5' };
  if (v === 'suspicious') return { text: 'text-[#ff6b35]', bg: 'bg-[#ff6b35]', border: 'border-[#ff6b35]/20', bgSoft: 'bg-[#ff6b35]/5' };
  return { text: 'text-[#00ff88]', bg: 'bg-[#00ff88]', border: 'border-[#00ff88]/20', bgSoft: 'bg-[#00ff88]/5' };
}

export default function PhishingAnalyzer() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<PhishingAnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);
    try {
      setResult(await phishing.analyze(input));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setInput(SAMPLE_EMAIL);
    setResult(null);
  };

  const vc = result ? verdictColor(result.detection.verdict) : null;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#00ffcc]">
          Phishing Analyzer
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Analyze Suspicious Emails
        </h1>
        <p className="max-w-2xl text-sm text-[#8b949e]">
          Paste the full email text (headers + body) or just the body. The analyzer
          extracts structural features — URLs, urgency cues, link mismatches — and
          classifies the message as phishing, suspicious, or safe.
        </p>
      </div>

      {/* Input card */}
      <Card>
        <div className="p-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
                <Mail className="h-4 w-4 text-[#00ffcc]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                Email Input
              </p>
            </div>
            <button
              onClick={loadSample}
              className="rounded-full border border-white/[0.08] px-4 py-1.5 text-xs font-medium text-[#8b949e] transition hover:border-white/[0.15] hover:text-white"
            >
              Load sample
            </button>
          </div>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"From: sender@example.com\nSubject: Verify your account\n\nClick https://example.com/verify to confirm..."}
              rows={10}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0d1117]/60 px-4 py-3 text-xs font-mono text-white placeholder-[#8b949e]/60 backdrop-blur-sm transition focus:border-[#00ffcc]/40 focus:outline-none focus:ring-1 focus:ring-[#00ffcc]/20"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-[#00ffcc] px-6 py-2.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze Email'}
                <ArrowRight className="h-4 w-4" />
              </button>
              {loading && (
                <span className="flex items-center gap-2 text-xs text-[#8b949e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
                  Extracting features...
                </span>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#ff3366]/20 bg-[#ff3366]/5 px-4 py-3 text-sm text-[#ff8899]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {result && vc && (
        <>
          {/* Verdict banner */}
          <Card className={vc.border}>
            <div className="flex items-center justify-between p-8">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${vc.bgSoft}`}>
                  {result.detection.verdict === 'safe'
                    ? <CheckCircle2 className={`h-7 w-7 ${vc.text}`} />
                    : <AlertTriangle className={`h-7 w-7 ${vc.text}`} />
                  }
                </div>
                <div>
                  <span className={`text-lg font-bold uppercase tracking-[0.25em] ${vc.text}`}>
                    {result.detection.verdict}
                  </span>
                  <p className="mt-1 max-w-lg text-sm text-[#8b949e]">{result.detection.explanation}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-white">{Math.round(result.detection.confidence * 100)}%</span>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Confidence</p>
              </div>
            </div>
          </Card>

          {/* Signals + Features bento */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Signals */}
            <Card>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff6b35]/10">
                    <Zap className="h-4 w-4 text-[#ff6b35]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff6b35]">
                      Detection Signals
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                      {result.detection.signals.length} found
                    </p>
                  </div>
                </div>
                {result.detection.signals.length > 0 ? (
                  <ul className="space-y-3">
                    {result.detection.signals.map((s, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-[#e6edf3]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b35]" />
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[#8b949e]">No signals detected.</p>
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
                    <FileText className="h-4 w-4 text-[#00ffcc]" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                    Extracted Metadata
                  </p>
                </div>
                <div className="space-y-3">
                  {result.features.sender && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Sender</p>
                      <p className="mt-1 break-all text-sm text-[#e6edf3]">{result.features.sender}</p>
                    </div>
                  )}
                  {result.features.subject && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Subject</p>
                      <p className="mt-1 text-sm text-[#e6edf3]">{result.features.subject}</p>
                    </div>
                  )}
                  <div className="rounded-2xl border border-white/[0.06] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Body Size</p>
                    <p className="mt-1 text-sm text-[#e6edf3]">{result.features.body_char_count.toLocaleString()} characters</p>
                  </div>
                  {result.features.parsing_notes.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Parser Notes</p>
                      {result.features.parsing_notes.map((n, i) => (
                        <p key={i} className="mt-1 text-xs text-[#8b949e]">{n}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* URLs */}
          {result.features.urls.length > 0 && (
            <Card>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
                    <Link2 className="h-4 w-4 text-[#00ffcc]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                      URLs Extracted
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                      {result.features.urls.length} URLs across {result.features.unique_registered_domains.length} domains
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {result.features.urls.map((url, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.06] px-4 py-3">
                      <p className="break-all text-xs font-mono text-[#00ffcc]/80">{url}</p>
                    </div>
                  ))}
                </div>
                {result.features.unique_registered_domains.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.features.unique_registered_domains.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 text-xs text-[#8b949e]">
                        <Globe className="h-3 w-3" />{d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Urgency keywords */}
          {result.features.urgency_keyword_hits.length > 0 && (
            <Card>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff6b35]/10">
                    <Shield className="h-4 w-4 text-[#ff6b35]" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff6b35]">
                    Urgency Keywords Detected
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.features.urgency_keyword_hits.map((kw) => (
                    <span key={kw} className="rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-4 py-2 text-sm text-[#ff6b35]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Link mismatches */}
          {result.features.link_mismatches.length > 0 && (
            <Card className="border-[#ff3366]/20">
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff3366]/10">
                    <AlertTriangle className="h-4 w-4 text-[#ff3366]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff3366]">
                      Link Mismatches
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                      Display domain differs from actual link target
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {result.features.link_mismatches.map((lm, i) => (
                    <div key={i} className="rounded-2xl border border-[#ff3366]/10 bg-[#ff3366]/5 p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Displayed Domain</p>
                          <p className="mt-1 text-sm font-medium text-[#ff6b35]">{lm.display_domain_guess}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Actual Target</p>
                          <p className="mt-1 text-sm font-medium text-[#ff3366]">{lm.href_host}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-[#8b949e]">{lm.note}</p>
                      <p className="mt-1 break-all text-xs font-mono text-[#8b949e]/60">{lm.href}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
