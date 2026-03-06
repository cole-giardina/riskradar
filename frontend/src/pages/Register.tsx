import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GradientDots } from '@/components/ui/gradient-dots';
import { LiquidButton, LiquidGlassCard } from '@/components/ui/liquid-glass-button';

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
        <LiquidGlassCard>
          <div className="p-6">
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
                  className="w-full px-4 py-2 rounded bg-[#0d1117]/40 backdrop-blur-sm border border-white/[0.08] text-white focus:border-[#00ffcc] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-[#8b949e] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded bg-[#0d1117]/40 backdrop-blur-sm border border-white/[0.08] text-white focus:border-[#00ffcc] focus:outline-none"
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
                  className="w-full px-4 py-2 rounded bg-[#0d1117]/40 backdrop-blur-sm border border-white/[0.08] text-white focus:border-[#00ffcc] focus:outline-none"
                />
              </div>
              <div className="flex justify-center">
                <LiquidButton
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full"
                >
                  {loading ? 'Creating account...' : 'Sign up'}
                </LiquidButton>
              </div>
            </form>
            <p className="mt-4 text-center text-sm text-[#8b949e]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00ffcc] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </LiquidGlassCard>
      </div>
    </div>
  );
}
