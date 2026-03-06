import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = '/api';

export default function PublicProfile() {
  const { username } = useParams();
  const [data, setData] = useState<{
    username: string;
    display_name: string;
    score: number;
    breach_count: number;
    risks: string[];
    recommendations: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!username) return;
    fetch(`${API_BASE}/public/score/${username}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('Profile not found'))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center"><p className="text-[#ff3366]">{error || 'Not found'}</p></div>;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-[#00ff88]';
    if (s >= 60) return 'text-[#00ffcc]';
    if (s >= 40) return 'text-[#ff6b35]';
    return 'text-[#ff3366]';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-[#00ffcc] hover:underline text-sm mb-6 inline-block">
          ← RiskRadar
        </Link>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8">
          <h1 className="text-2xl font-bold">
            {data.display_name}'s Security Score
          </h1>
          <div className="flex items-baseline gap-2 mt-4">
            <span className={`text-5xl font-bold ${getScoreColor(data.score)}`}>
              {data.score}
            </span>
            <span className="text-2xl text-[#8b949e]">/ 100</span>
          </div>
          <div className="mt-6 grid gap-4">
            <div>
              <h3 className="font-semibold text-[#ff6b35] mb-2">Risks</h3>
              <ul className="text-sm text-[#e6edf3]">
                {(data.risks || []).map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#00ff88] mb-2">Recommendations</h3>
              <ul className="text-sm text-[#e6edf3]">
                {(data.recommendations || []).map((r, i) => (
                  <li key={i}>• {r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
