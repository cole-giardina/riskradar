import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { breach, paste, domain, password, quiz, dashboard, phishing } from '../lib/api';
import type { PhishingAnalyzeResponse } from '../lib/api';
import {
  SearchCheck,
  FileText,
  Globe,
  KeyRound,
  Copy,
  ClipboardList,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Zap,
} from 'lucide-react';

type Tab = 'breach' | 'paste' | 'domain' | 'password' | 'reuse' | 'quiz' | 'phishing';

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

export default function Scan() {
  const [tab, setTab] = useState<Tab>('breach');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [breachEmail, setBreachEmail] = useState('');
  const [breachResult, setBreachResult] = useState<{
    found: boolean;
    breach_count: number;
    breaches: { name: string }[];
    message: string;
  } | null>(null);

  const [pasteEmail, setPasteEmail] = useState('');
  const [pasteResult, setPasteResult] = useState<{
    found: boolean;
    paste_count: number;
    pastes: { source: string; id: string }[];
    message: string;
  } | null>(null);

  const [domainInput, setDomainInput] = useState('');
  const [domainResult, setDomainResult] = useState<{
    found: boolean;
    breach_count: number;
    breaches: { name: string }[];
    message: string;
  } | null>(null);

  const [pwdInput, setPwdInput] = useState('');
  const [pwdResult, setPwdResult] = useState<{
    entropy: number;
    crack_time_display: string;
    strength_score: number;
    feedback: string[];
    is_pwned: boolean | null;
    pwned_count: number;
  } | null>(null);

  const [reusePasswords, setReusePasswords] = useState('');
  const [reuseResult, setReuseResult] = useState<{
    pwned_indices: number[];
    duplicate_groups: number[][];
    reuse_detected: boolean;
    any_pwned: boolean;
  } | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<
    { id: string; question: string; options: string[]; risk_if_no: string }[]
  >([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    score_impact: number;
    risks_identified: string[];
    recommendations: string[];
  } | null>(null);

  const [phishingInput, setPhishingInput] = useState('');
  const [phishingResult, setPhishingResult] = useState<PhishingAnalyzeResponse | null>(null);

  const loadQuiz = () => {
    if (quizQuestions.length === 0) {
      quiz.getQuestions().then(setQuizQuestions);
    }
  };

  const handleBreachCheck = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setBreachResult(null);
    try { setBreachResult(await breach.check(breachEmail)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Check failed'); }
    finally { setLoading(false); }
  };

  const handlePasteCheck = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setPasteResult(null);
    try { setPasteResult(await paste.check(pasteEmail.trim())); }
    catch (err) { setError(err instanceof Error ? err.message : 'Check failed'); }
    finally { setLoading(false); }
  };

  const handleDomainCheck = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setDomainResult(null);
    try { setDomainResult(await domain.check(domainInput)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Check failed'); }
    finally { setLoading(false); }
  };

  const handlePasswordCheck = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setPwdResult(null);
    try { setPwdResult(await password.check(pwdInput)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Check failed'); }
    finally { setLoading(false); }
  };

  const handleReuseCheck = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setReuseResult(null);
    try {
      const pwds = reusePasswords.split('\n').map((p) => p.trim()).filter(Boolean);
      if (pwds.length < 2) { setError('Enter at least 2 passwords (one per line)'); setLoading(false); return; }
      setReuseResult(await password.checkReuse(pwds));
    } catch (err) { setError(err instanceof Error ? err.message : 'Check failed'); }
    finally { setLoading(false); }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setQuizResult(null);
    try { setQuizResult(await quiz.submit(quizAnswers)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Submit failed'); }
    finally { setLoading(false); }
  };

  const handlePhishingAnalyze = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true); setPhishingResult(null);
    try { setPhishingResult(await phishing.analyze(phishingInput)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Analysis failed'); }
    finally { setLoading(false); }
  };

  const handleCalculateScore = async () => {
    setError(''); setLoading(true);
    try {
      const phishVerdict = phishingResult?.detection.verdict;
      const allRisks = [
        ...(breachResult?.found ? [`Email found in ${breachResult.breach_count} data breach(es)`] : []),
        ...(pasteResult?.found ? [`Email found in ${pasteResult.paste_count} paste(s)`] : []),
        ...(reuseResult?.reuse_detected ? ['Password reuse detected across accounts'] : []),
        ...(phishVerdict === 'phishing' ? ['Submitted email identified as phishing'] : []),
        ...(phishVerdict === 'suspicious' ? ['Submitted email flagged as suspicious'] : []),
        ...(quizResult?.risks_identified || []),
      ];
      const allRecs = [
        ...(breachResult?.found ? ['Rotate compromised passwords'] : []),
        ...(pasteResult?.found ? ['Monitor paste sites for your data'] : []),
        ...(reuseResult?.reuse_detected ? ['Use unique passwords for each account'] : []),
        ...(pwdResult?.is_pwned ? ['Change this password immediately - it was found in a breach'] : []),
        ...(phishVerdict && phishVerdict !== 'safe' ? ['Learn to recognize phishing red flags before clicking links'] : []),
        ...(quizResult?.recommendations || []),
      ];
      await dashboard.calculate({
        breach_count: (breachResult?.breach_count ?? 0) + (pasteResult?.paste_count ?? 0),
        password_strength: pwdResult?.strength_score ?? null,
        quiz_score: quizResult?.score_impact ?? 0,
        risks: allRisks,
        recommendations: allRecs,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
    } finally { setLoading(false); }
  };

  const canCalculate = (breachResult !== null || pwdResult !== null || quizResult !== null) && quizResult !== null;

  const tabs: { id: Tab; label: string; icon: typeof SearchCheck }[] = [
    { id: 'breach', label: 'Breach', icon: SearchCheck },
    { id: 'paste', label: 'Pastes', icon: FileText },
    { id: 'domain', label: 'Domain', icon: Globe },
    { id: 'password', label: 'Password', icon: KeyRound },
    { id: 'reuse', label: 'Reuse', icon: Copy },
    { id: 'phishing', label: 'Phishing', icon: Mail },
    { id: 'quiz', label: 'Quiz', icon: ClipboardList },
  ];

  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-[#0d1117]/60 px-4 py-3 text-sm text-white placeholder-[#8b949e]/60 backdrop-blur-sm transition focus:border-[#00ffcc]/40 focus:outline-none focus:ring-1 focus:ring-[#00ffcc]/20';
  const btnPrimary =
    'inline-flex items-center gap-2 rounded-full bg-[#00ffcc] px-6 py-2.5 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20 disabled:opacity-50';

  function ResultBanner({ found, message }: { found: boolean; message: string }) {
    return (
      <div className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        found
          ? 'border-[#ff3366]/20 bg-[#ff3366]/5 text-[#ff8899]'
          : 'border-[#00ff88]/20 bg-[#00ff88]/5 text-[#00ff88]'
      }`}>
        {found ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#00ffcc]">
          Security Scan
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Analyze Your Risk Profile
        </h1>
        <p className="text-sm text-[#8b949e]">
          Complete each section to calculate your security score
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const completed =
            (t.id === 'breach' && breachResult !== null) ||
            (t.id === 'paste' && pasteResult !== null) ||
            (t.id === 'domain' && domainResult !== null) ||
            (t.id === 'password' && pwdResult !== null) ||
            (t.id === 'reuse' && reuseResult !== null) ||
            (t.id === 'phishing' && phishingResult !== null) ||
            (t.id === 'quiz' && quizResult !== null);
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === 'quiz') loadQuiz(); }}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] transition-all ${
                tab === t.id
                  ? 'border-[#00ffcc]/40 bg-[#00ffcc]/10 text-[#00ffcc]'
                  : 'border-white/[0.08] text-[#8b949e] hover:border-white/[0.15] hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {completed && <CheckCircle2 className="h-3 w-3 text-[#00ff88]" />}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#ff3366]/20 bg-[#ff3366]/5 px-4 py-3 text-sm text-[#ff8899]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tab content */}
      {tab === 'breach' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Breach Check</p>
            <h2 className="mb-2 text-lg font-semibold">Check if your email is in a data breach</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Uses HaveIBeenPwned to check known breaches. Your email is never stored.</p>
            <form onSubmit={handleBreachCheck} className="flex gap-3">
              <input type="email" value={breachEmail} onChange={(e) => setBreachEmail(e.target.value)} placeholder="your@email.com" required className={`flex-1 ${inputClass}`} />
              <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Checking...' : 'Check'}</button>
            </form>
            {breachResult && (
              <>
                <ResultBanner found={breachResult.found} message={breachResult.message} />
                {breachResult.breaches.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pl-1">{breachResult.breaches.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#e6edf3]"><span className="h-1 w-1 rounded-full bg-[#ff3366]" />{b.name}</li>
                  ))}</ul>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {tab === 'paste' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Paste Check</p>
            <h2 className="mb-2 text-lg font-semibold">Check if your email appears in pastes</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Pastes are data dumps on sites like Pastebin. Check if your email was exposed.</p>
            <form onSubmit={handlePasteCheck} className="flex gap-3">
              <input type="email" value={pasteEmail} onChange={(e) => setPasteEmail(e.target.value)} placeholder="your@email.com" required className={`flex-1 ${inputClass}`} />
              <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Checking...' : 'Check'}</button>
            </form>
            {pasteResult && (
              <>
                <ResultBanner found={pasteResult.found} message={pasteResult.message} />
                {pasteResult.pastes.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pl-1">{pasteResult.pastes.slice(0, 10).map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#e6edf3]"><span className="h-1 w-1 rounded-full bg-[#ff3366]" />{p.source}</li>
                  ))}</ul>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {tab === 'domain' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Domain Check</p>
            <h2 className="mb-2 text-lg font-semibold">Domain health check</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Check if a domain has been breached. Enter domain or email.</p>
            <form onSubmit={handleDomainCheck} className="flex gap-3">
              <input type="text" value={domainInput} onChange={(e) => setDomainInput(e.target.value)} placeholder="company.com or user@company.com" required className={`flex-1 ${inputClass}`} />
              <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Checking...' : 'Check'}</button>
            </form>
            {domainResult && (
              <>
                <ResultBanner found={domainResult.found} message={domainResult.message} />
                {domainResult.breaches.length > 0 && (
                  <ul className="mt-3 space-y-1.5 pl-1">{domainResult.breaches.map((b, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#e6edf3]"><span className="h-1 w-1 rounded-full bg-[#ff3366]" />{b.name}</li>
                  ))}</ul>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      {tab === 'password' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Password Analysis</p>
            <h2 className="mb-2 text-lg font-semibold">Password strength checker</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Analyzed locally. Also checks against known breached passwords (k-anonymity).</p>
            <form onSubmit={handlePasswordCheck} className="space-y-4">
              <input type="password" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)} placeholder="Enter a password to check" className={inputClass} />
              <button type="submit" disabled={loading || !pwdInput} className={btnPrimary}>{loading ? 'Analyzing...' : 'Analyze'}</button>
            </form>
            {pwdResult && (
              <div className="mt-5 space-y-3 rounded-2xl border border-white/[0.08] bg-[#0d1117]/40 p-5">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-[#00ffcc]">{pwdResult.strength_score}/100</span>
                  <span className="text-xs text-[#8b949e]">
                    Entropy: {pwdResult.entropy} bits &middot; Crack time: {pwdResult.crack_time_display}
                  </span>
                </div>
                {/* Strength bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pwdResult.strength_score >= 80 ? 'bg-[#00ff88]' : pwdResult.strength_score >= 50 ? 'bg-[#ff6b35]' : 'bg-[#ff3366]'
                    }`}
                    style={{ width: `${pwdResult.strength_score}%` }}
                  />
                </div>
                {pwdResult.is_pwned && (
                  <p className="flex items-center gap-2 text-sm font-medium text-[#ff3366]">
                    <AlertTriangle className="h-4 w-4" />
                    Found in a data breach ({pwdResult.pwned_count.toLocaleString()} times). Change immediately!
                  </p>
                )}
                {pwdResult.feedback.length > 0 && (
                  <ul className="space-y-1">{pwdResult.feedback.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[#8b949e]"><span className="h-1 w-1 rounded-full bg-[#8b949e]" />{f}</li>
                  ))}</ul>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === 'reuse' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Reuse Check</p>
            <h2 className="mb-2 text-lg font-semibold">Password reuse checker</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Enter multiple passwords (one per line) to check for reuse and breach exposure.</p>
            <form onSubmit={handleReuseCheck} className="space-y-4">
              <textarea value={reusePasswords} onChange={(e) => setReusePasswords(e.target.value)} placeholder={"password1\npassword2\npassword3"} rows={4} className={`${inputClass} font-mono`} />
              <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Checking...' : 'Check for reuse'}</button>
            </form>
            {reuseResult && (
              <div className="mt-5 space-y-2">
                {reuseResult.reuse_detected && (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#ff6b35]/20 bg-[#ff6b35]/5 px-4 py-3 text-sm text-[#ff6b35]">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Password reuse detected! Same password used across multiple entries.
                  </div>
                )}
                {reuseResult.any_pwned && (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#ff3366]/20 bg-[#ff3366]/5 px-4 py-3 text-sm text-[#ff8899]">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Some passwords were found in data breaches. Change them immediately.
                  </div>
                )}
                {!reuseResult.reuse_detected && !reuseResult.any_pwned && (
                  <div className="flex items-center gap-2 rounded-2xl border border-[#00ff88]/20 bg-[#00ff88]/5 px-4 py-3 text-sm text-[#00ff88]">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    No reuse or breach exposure detected.
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === 'phishing' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Phishing Analysis</p>
            <h2 className="mb-2 text-lg font-semibold">Analyze a suspicious email</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Paste the full email text (headers + body) or just the body. The analyzer extracts features and classifies the message.</p>
            <form onSubmit={handlePhishingAnalyze} className="space-y-4">
              <textarea value={phishingInput} onChange={(e) => setPhishingInput(e.target.value)} placeholder={"From: security@paypa1-support.com\nSubject: Urgent: Verify your account\n\nClick https://evil.example/login to verify now."} rows={6} className={`${inputClass} font-mono text-xs`} />
              <button type="submit" disabled={loading || !phishingInput.trim()} className={btnPrimary}>{loading ? 'Analyzing...' : 'Analyze Email'}</button>
            </form>
            {phishingResult && (
              <div className="mt-5 space-y-4">
                {/* Verdict badge */}
                <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${
                  phishingResult.detection.verdict === 'phishing'
                    ? 'border-[#ff3366]/20 bg-[#ff3366]/5'
                    : phishingResult.detection.verdict === 'suspicious'
                    ? 'border-[#ff6b35]/20 bg-[#ff6b35]/5'
                    : 'border-[#00ff88]/20 bg-[#00ff88]/5'
                }`}>
                  <div className="flex items-center gap-3">
                    {phishingResult.detection.verdict === 'safe'
                      ? <CheckCircle2 className="h-5 w-5 text-[#00ff88]" />
                      : <AlertTriangle className={`h-5 w-5 ${phishingResult.detection.verdict === 'phishing' ? 'text-[#ff3366]' : 'text-[#ff6b35]'}`} />
                    }
                    <div>
                      <span className={`text-sm font-semibold uppercase tracking-[0.2em] ${
                        phishingResult.detection.verdict === 'phishing' ? 'text-[#ff3366]'
                        : phishingResult.detection.verdict === 'suspicious' ? 'text-[#ff6b35]'
                        : 'text-[#00ff88]'
                      }`}>{phishingResult.detection.verdict}</span>
                      <p className="mt-0.5 text-xs text-[#8b949e]">{phishingResult.detection.explanation}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white">{Math.round(phishingResult.detection.confidence * 100)}%</span>
                </div>

                {/* Signals */}
                {phishingResult.detection.signals.length > 0 && (
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/40 p-5">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                      <Zap className="h-3.5 w-3.5" /> Signals
                    </p>
                    <ul className="space-y-2">{phishingResult.detection.signals.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#e6edf3]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b35]" />{s}
                      </li>
                    ))}</ul>
                  </div>
                )}

                {/* Extracted features summary */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {phishingResult.features.sender && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Sender</p>
                      <p className="mt-1 text-sm text-[#e6edf3] break-all">{phishingResult.features.sender}</p>
                    </div>
                  )}
                  {phishingResult.features.subject && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Subject</p>
                      <p className="mt-1 text-sm text-[#e6edf3]">{phishingResult.features.subject}</p>
                    </div>
                  )}
                  {phishingResult.features.urls.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3 sm:col-span-2">
                      <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                        <Link2 className="h-3 w-3" /> URLs Found ({phishingResult.features.urls.length})
                      </p>
                      <ul className="space-y-1">{phishingResult.features.urls.map((u, i) => (
                        <li key={i} className="break-all text-xs text-[#00ffcc]/80">{u}</li>
                      ))}</ul>
                    </div>
                  )}
                  {phishingResult.features.urgency_keyword_hits.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] px-4 py-3 sm:col-span-2">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">Urgency Keywords</p>
                      <div className="flex flex-wrap gap-2">{phishingResult.features.urgency_keyword_hits.map((kw) => (
                        <span key={kw} className="rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 px-3 py-1 text-xs text-[#ff6b35]">{kw}</span>
                      ))}</div>
                    </div>
                  )}
                  {phishingResult.features.link_mismatches.length > 0 && (
                    <div className="rounded-2xl border border-[#ff3366]/20 bg-[#ff3366]/5 px-4 py-3 sm:col-span-2">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#ff3366]">Link Mismatches</p>
                      {phishingResult.features.link_mismatches.map((lm, i) => (
                        <div key={i} className="mt-2 text-xs">
                          <p className="text-[#e6edf3]">Display: <span className="text-[#ff6b35]">{lm.display_domain_guess}</span> &rarr; Actual: <span className="text-[#ff3366]">{lm.href_host}</span></p>
                          <p className="mt-0.5 text-[#8b949e]">{lm.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {tab === 'quiz' && (
        <Card>
          <div className="p-8">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">Security Quiz</p>
            <h2 className="mb-2 text-lg font-semibold">Security habit quiz</h2>
            <p className="mb-6 text-sm text-[#8b949e]">Quick questions about your security practices. Required for score calculation.</p>
            {quizQuestions.length === 0 ? (
              <button onClick={loadQuiz} className={btnPrimary}>Load Quiz</button>
            ) : (
              <form onSubmit={handleQuizSubmit} className="space-y-6">
                {quizQuestions.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-white/[0.06] p-5">
                    <p className="mb-3 text-sm font-medium">{q.question}</p>
                    <div className="flex flex-wrap gap-3">
                      {q.options.map((opt) => (
                        <label key={opt} className={`flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm transition ${
                          quizAnswers[q.id] === opt
                            ? 'border-[#00ffcc]/40 bg-[#00ffcc]/10 text-[#00ffcc]'
                            : 'border-white/[0.08] text-[#8b949e] hover:border-white/[0.15] hover:text-white'
                        }`}>
                          <input type="radio" name={q.id} value={opt} checked={quizAnswers[q.id] === opt} onChange={() => setQuizAnswers((a) => ({ ...a, [q.id]: opt }))} className="sr-only" />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Submitting...' : 'Submit Quiz'}</button>
              </form>
            )}
            {quizResult && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#00ff88]/20 bg-[#00ff88]/5 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-[#00ff88]" />
                <div>
                  <p className="text-sm font-medium text-[#00ff88]">Quiz score impact: +{quizResult.score_impact} points</p>
                  <p className="text-xs text-[#8b949e]">{quizResult.risks_identified.length} risks, {quizResult.recommendations.length} recommendations</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Calculate score CTA */}
      {canCalculate && (
        <Card className="border-[#00ffcc]/20">
          <div className="p-8 text-center">
            <p className="mb-4 text-sm text-[#8b949e]">
              You&rsquo;ve completed the quiz. Optionally run breach and password checks for a more accurate score.
            </p>
            <button onClick={handleCalculateScore} disabled={loading} className={`${btnPrimary} px-8 py-3`}>
              {loading ? 'Calculating...' : 'Calculate & Save Score'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
