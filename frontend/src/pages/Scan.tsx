import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { breach, paste, domain, password, quiz, dashboard } from '../lib/api';

type Tab = 'breach' | 'paste' | 'domain' | 'password' | 'reuse' | 'quiz';

export default function Scan() {
  const [tab, setTab] = useState<Tab>('breach');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Breach state
  const [breachEmail, setBreachEmail] = useState('');
  const [breachResult, setBreachResult] = useState<{
    found: boolean;
    breach_count: number;
    breaches: { name: string }[];
    message: string;
  } | null>(null);

  // Paste state
  const [pasteEmail, setPasteEmail] = useState('');
  const [pasteResult, setPasteResult] = useState<{
    found: boolean;
    paste_count: number;
    pastes: { source: string; id: string }[];
    message: string;
  } | null>(null);

  // Domain state
  const [domainInput, setDomainInput] = useState('');
  const [domainResult, setDomainResult] = useState<{
    found: boolean;
    breach_count: number;
    breaches: { name: string }[];
    message: string;
  } | null>(null);

  // Password state
  const [pwdInput, setPwdInput] = useState('');
  const [pwdResult, setPwdResult] = useState<{
    entropy: number;
    crack_time_display: string;
    strength_score: number;
    feedback: string[];
    is_pwned: boolean | null;
    pwned_count: number;
  } | null>(null);

  // Password reuse state
  const [reusePasswords, setReusePasswords] = useState('');
  const [reuseResult, setReuseResult] = useState<{
    pwned_indices: number[];
    duplicate_groups: number[][];
    reuse_detected: boolean;
    any_pwned: boolean;
  } | null>(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<
    { id: string; question: string; options: string[]; risk_if_no: string }[]
  >([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    score_impact: number;
    risks_identified: string[];
    recommendations: string[];
  } | null>(null);

  // Aggregated for final score

  const loadQuiz = () => {
    if (quizQuestions.length === 0) {
      quiz.getQuestions().then(setQuizQuestions);
    }
  };

  const handleBreachCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setBreachResult(null);
    try {
      const res = await breach.check(breachEmail);
      setBreachResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasteCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPasteResult(null);
    try {
      const res = await paste.check(pasteEmail.trim());
      setPasteResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDomainCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setDomainResult(null);
    try {
      const res = await domain.check(domainInput);
      setDomainResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPwdResult(null);
    try {
      const res = await password.check(pwdInput);
      setPwdResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReuseCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setReuseResult(null);
    try {
      const pwds = reusePasswords.split('\n').map((p) => p.trim()).filter(Boolean);
      if (pwds.length < 2) {
        setError('Enter at least 2 passwords (one per line)');
        setLoading(false);
        return;
      }
      const res = await password.checkReuse(pwds);
      setReuseResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setQuizResult(null);
    try {
      const res = await quiz.submit(quizAnswers);
      setQuizResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScore = async () => {
    setError('');
    setLoading(true);
    try {
      const allRisks = [
        ...(breachResult?.found ? [`Email found in ${breachResult.breach_count} data breach(es)`] : []),
        ...(pasteResult?.found ? [`Email found in ${pasteResult.paste_count} paste(s)`] : []),
        ...(reuseResult?.reuse_detected ? ['Password reuse detected across accounts'] : []),
        ...(quizResult?.risks_identified || []),
      ];
      const allRecs = [
        ...(breachResult?.found ? ['Rotate compromised passwords'] : []),
        ...(pasteResult?.found ? ['Monitor paste sites for your data'] : []),
        ...(reuseResult?.reuse_detected ? ['Use unique passwords for each account'] : []),
        ...(pwdResult?.is_pwned ? ['Change this password immediately - it was found in a breach'] : []),
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
    } finally {
      setLoading(false);
    }
  };

  const canCalculate =
    (breachResult !== null || pwdResult !== null || quizResult !== null) &&
    quizResult !== null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'breach', label: 'Breach' },
    { id: 'paste', label: 'Pastes' },
    { id: 'domain', label: 'Domain' },
    { id: 'password', label: 'Password' },
    { id: 'reuse', label: 'Reuse Check' },
    { id: 'quiz', label: 'Quiz' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security Scan</h1>
        <p className="text-[#8b949e] mt-1">
          Complete each section to calculate your security score
        </p>
      </div>

      <div className="flex gap-2 border-b border-[#30363d]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id);
              if (t.id === 'quiz') loadQuiz();
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? 'border-[#00ffcc] text-[#00ffcc]'
                : 'border-transparent text-[#8b949e] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded bg-[#ff3366]/20 text-[#ff3366] text-sm">
          {error}
        </div>
      )}

      {tab === 'breach' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold mb-2">Check if your email is in a data breach</h2>
          <p className="text-sm text-[#8b949e] mb-4">
            Uses HaveIBeenPwned to check known breaches. Your email is never stored.
          </p>
          <form onSubmit={handleBreachCheck} className="flex gap-2">
            <input
              type="email"
              value={breachEmail}
              onChange={(e) => setBreachEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:border-[#00ffcc] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>
          {breachResult && (
            <div className={`mt-4 p-4 rounded ${breachResult.found ? 'bg-[#ff3366]/20' : 'bg-[#00ff88]/20'}`}>
              <p className={breachResult.found ? 'text-[#ff3366]' : 'text-[#00ff88]'}>
                {breachResult.message}
              </p>
              {breachResult.breaches.length > 0 && (
                <ul className="mt-2 text-sm text-[#e6edf3]">
                  {breachResult.breaches.map((b, i) => (
                    <li key={i}>• {b.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'paste' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold mb-2">Check if your email appears in pastes</h2>
          <p className="text-sm text-[#8b949e] mb-4">
            Pastes are data dumps on sites like Pastebin. Check if your email was exposed.
          </p>
          <form onSubmit={handlePasteCheck} className="flex gap-2">
            <input
              type="email"
              value={pasteEmail}
              onChange={(e) => setPasteEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:border-[#00ffcc] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>
          {pasteResult && (
            <div className={`mt-4 p-4 rounded ${pasteResult.found ? 'bg-[#ff3366]/20' : 'bg-[#00ff88]/20'}`}>
              <p className={pasteResult.found ? 'text-[#ff3366]' : 'text-[#00ff88]'}>{pasteResult.message}</p>
              {pasteResult.pastes.length > 0 && (
                <ul className="mt-2 text-sm text-[#e6edf3]">
                  {pasteResult.pastes.slice(0, 10).map((p, i) => (
                    <li key={i}>• {p.source}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'domain' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold mb-2">Domain health check</h2>
          <p className="text-sm text-[#8b949e] mb-4">
            Check if a domain (e.g. company.com) has been breached. Enter domain or email.
          </p>
          <form onSubmit={handleDomainCheck} className="flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="company.com or user@company.com"
              required
              className="flex-1 px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:border-[#00ffcc] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </form>
          {domainResult && (
            <div className={`mt-4 p-4 rounded ${domainResult.found ? 'bg-[#ff3366]/20' : 'bg-[#00ff88]/20'}`}>
              <p className={domainResult.found ? 'text-[#ff3366]' : 'text-[#00ff88]'}>{domainResult.message}</p>
              {domainResult.breaches.length > 0 && (
                <ul className="mt-2 text-sm text-[#e6edf3]">
                  {domainResult.breaches.map((b, i) => (
                    <li key={i}>• {b.name}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold mb-2">Password strength checker</h2>
          <p className="text-sm text-[#8b949e] mb-4">
            Analyzed locally. We also check against known breached passwords (k-anonymity).
          </p>
          <form onSubmit={handlePasswordCheck} className="space-y-4">
            <input
              type="password"
              value={pwdInput}
              onChange={(e) => setPwdInput(e.target.value)}
              placeholder="Enter a password to check"
              className="w-full px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:border-[#00ffcc] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !pwdInput}
              className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>
          {pwdResult && (
            <div className="mt-4 p-4 rounded bg-[#161b22] border border-[#30363d] space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-[#00ffcc]">
                  {pwdResult.strength_score}/100
                </span>
                <span className="text-[#8b949e]">
                  Entropy: {pwdResult.entropy} bits • Crack time: {pwdResult.crack_time_display}
                </span>
              </div>
              {pwdResult.is_pwned && (
                <p className="text-[#ff3366] font-medium">
                  ⚠ This password was found in a data breach ({pwdResult.pwned_count.toLocaleString()} times). Change it immediately!
                </p>
              )}
              {pwdResult.feedback.length > 0 && (
                <ul className="text-sm text-[#8b949e]">
                  {pwdResult.feedback.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'reuse' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold mb-2">Password reuse checker</h2>
          <p className="text-sm text-[#8b949e] mb-4">
            Enter multiple passwords (one per line) to check for reuse and breach exposure. We never store them.
          </p>
          <form onSubmit={handleReuseCheck} className="space-y-4">
            <textarea
              value={reusePasswords}
              onChange={(e) => setReusePasswords(e.target.value)}
              placeholder="password1&#10;password2&#10;password3"
              rows={5}
              className="w-full px-4 py-2 rounded bg-[#0d1117] border border-[#30363d] text-white focus:border-[#00ffcc] focus:outline-none font-mono text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check for reuse'}
            </button>
          </form>
          {reuseResult && (
            <div className="mt-4 p-4 rounded bg-[#161b22] border border-[#30363d] space-y-2">
              {reuseResult.reuse_detected && (
                <p className="text-[#ff6b35] font-medium">
                  ⚠ Password reuse detected! Same password used across multiple entries.
                </p>
              )}
              {reuseResult.any_pwned && (
                <p className="text-[#ff3366] font-medium">
                  ⚠ Some passwords were found in data breaches. Change them immediately.
                </p>
              )}
              {!reuseResult.reuse_detected && !reuseResult.any_pwned && (
                <p className="text-[#00ff88]">No reuse or breach exposure detected.</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'quiz' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h2 className="font-semibold mb-2">Security habit quiz</h2>
          <p className="text-sm text-[#8b949e] mb-4">
            Quick questions about your security practices. Required for score calculation.
          </p>
          {quizQuestions.length === 0 ? (
            <button
              onClick={loadQuiz}
              className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8]"
            >
              Load Quiz
            </button>
          ) : (
            <form onSubmit={handleQuizSubmit} className="space-y-6">
              {quizQuestions.map((q) => (
                <div key={q.id}>
                  <p className="font-medium mb-2">{q.question}</p>
                  <div className="flex gap-4">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={quizAnswers[q.id] === opt}
                          onChange={() =>
                            setQuizAnswers((a) => ({ ...a, [q.id]: opt }))
                          }
                          className="accent-[#00ffcc]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </form>
          )}
          {quizResult && (
            <div className="mt-4 p-4 rounded bg-[#00ff88]/10 border border-[#00ff88]/30">
              <p className="text-[#00ff88] font-medium">
                Quiz score impact: +{quizResult.score_impact} points
              </p>
              <p className="text-sm text-[#8b949e] mt-1">
                {quizResult.risks_identified.length} risks, {quizResult.recommendations.length} recommendations
              </p>
            </div>
          )}
        </div>
      )}

      {canCalculate && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 text-center">
          <p className="text-[#8b949e] mb-4">
            You've completed the quiz. Optionally run breach and password checks for a more accurate score.
          </p>
          <button
            onClick={handleCalculateScore}
            disabled={loading}
            className="px-8 py-3 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50"
          >
            {loading ? 'Calculating...' : 'Calculate & Save Score'}
          </button>
        </div>
      )}
    </div>
  );
}
