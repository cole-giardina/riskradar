import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GradientDots } from '@/components/ui/gradient-dots';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName || undefined);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
          <h2 className="text-xl font-semibold mb-4">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded bg-[#ff3366]/20 text-[#ff3366] text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm text-[#8b949e] mb-1">Display name (optional)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Cole"
                className="w-full px-4 py-2 rounded bg-[#0d1117]/60 backdrop-blur-sm border border-[#30363d]/50 text-white focus:border-[#00ffcc] focus:outline-none"
              />
            </div>
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
                minLength={8}
                className="w-full px-4 py-2 rounded bg-[#0d1117]/60 backdrop-blur-sm border border-[#30363d]/50 text-white focus:border-[#00ffcc] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-[#8b949e]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00ffcc] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
