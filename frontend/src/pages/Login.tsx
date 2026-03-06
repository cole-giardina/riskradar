import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GradientDots } from '@/components/ui/gradient-dots';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result?.needs2FA && result?.pendingToken) {
        setPendingToken(result.pendingToken);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingToken) return;
    setError('');
    setLoading(true);
    try {
      await verify2FA(twoFACode, pendingToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <GradientDots duration={20} />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#00ffcc] flex items-center justify-center gap-2">
            <span>🛡️</span> RiskRadar
          </h1>
          <p className="text-[#8b949e] mt-2">Your Cyber Security Score</p>
        </div>
        <div className="bg-[#161b22]/40 backdrop-blur-xl border border-white/10 rounded-lg p-6 shadow-2xl">
          <h2 className="text-xl font-semibold mb-4">
            {pendingToken ? 'Enter 2FA code' : 'Sign in'}
          </h2>
          {pendingToken ? (
            <form onSubmit={handle2FASubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-[#ff3366]/20 text-[#ff3366] text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">6-digit code</label>
                <input
                  type="text"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-2 rounded bg-[#0d1117]/60 backdrop-blur-sm border border-[#30363d]/50 text-white focus:border-[#00ffcc] focus:outline-none text-center text-2xl tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={loading || twoFACode.length !== 6}
                className="w-full py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={() => setPendingToken(null)}
                className="w-full py-2 text-sm text-[#8b949e] hover:text-white"
              >
                ← Back
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-[#ff3366]/20 text-[#ff3366] text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-[#8b949e] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#0d1117]/60 backdrop-blur-sm border border-[#30363d]/50 text-white focus:border-[#00ffcc] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8b949e] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-[#0d1117]/60 backdrop-blur-sm border border-[#30363d]/50 text-white focus:border-[#00ffcc] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          )}
          <p className="mt-4 text-center text-sm text-[#8b949e]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00ffcc] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
