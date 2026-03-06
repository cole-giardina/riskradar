import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { dashboard, tips } from '../lib/api';
import type { SecurityScore } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    current_score: SecurityScore | null;
    score_history: { score: number; date: string }[];
    risks: string[];
    recommendations: string[];
    percentile: number | null;
    industry_average: number;
  } | null>(null);
  const [tipList, setTipList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard
      .get()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    tips.get().then((r) => setTipList(r.tips));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-[#8b949e]">Loading dashboard...</div>
      </div>
    );
  }

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'User';
  const score = data?.current_score?.score ?? null;
  const hasHistory = data?.score_history && data.score_history.length > 0;
  const lastScan = user?.last_scan_at ? new Date(user.last_scan_at) : null;
  const daysSinceScan = lastScan ? Math.floor((Date.now() - lastScan.getTime()) / 86400000) : null;
  const showReminder = daysSinceScan !== null && daysSinceScan >= 14;

  const chartData = {
    labels: (data?.score_history || [])
      .map((h) => new Date(h.date).toLocaleDateString())
      .reverse(),
    datasets: [
      {
        label: 'Security Score',
        data: (data?.score_history || []).map((h) => h.score).reverse(),
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0, 255, 204, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: '#30363d' },
        ticks: { color: '#8b949e' },
      },
      x: {
        grid: { color: '#30363d' },
        ticks: { color: '#8b949e' },
      },
    },
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-[#00ff88]';
    if (s >= 60) return 'text-[#00ffcc]';
    if (s >= 40) return 'text-[#ff6b35]';
    return 'text-[#ff3366]';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {displayName}'s Security Score
        </h1>
        <p className="text-[#8b949e] mt-1">
          Like a credit score, but for cybersecurity
        </p>
      </div>

      {showReminder && (
        <div className="p-4 rounded-lg bg-[#ff6b35]/20 border border-[#ff6b35]/50">
          <p className="text-[#ff6b35]">
            ⏰ You haven't run a security scan in {daysSinceScan} days. Consider checking for new breaches.
          </p>
          <Link to="/scan" className="text-[#00ffcc] hover:underline text-sm mt-2 inline-block">
            Run scan →
          </Link>
        </div>
      )}

      {score === null ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 text-center">
          <p className="text-[#8b949e] mb-4">
            You haven't run a security scan yet. Complete the scan to get your score.
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded font-medium bg-[#00ffcc] text-[#0d1117] hover:bg-[#00e6b8] transition-colors"
          >
            Run Security Scan →
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
                <span className="text-2xl text-[#8b949e]">/ 100</span>
              </div>
              <p className="text-[#8b949e] mt-2">Current Security Score</p>
              {data?.percentile != null && (
                <p className="text-[#00ffcc] text-sm mt-1">
                  Top {100 - data.percentile}% — Industry avg: {data?.industry_average ?? 58}
                </p>
              )}
            </div>

            {hasHistory && (
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
                <h3 className="font-semibold mb-4">Score History</h3>
                <div className="h-40">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-[#ff6b35]">⚠</span> Risks Found
              </h3>
              <ul className="space-y-2">
                {(data?.risks?.length ? data.risks : ['No risks identified']).map((r, i) => (
                  <li key={i} className="text-sm text-[#e6edf3] flex items-start gap-2">
                    <span className="text-[#ff6b35]">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-[#00ff88]">✔</span> Recommendations
              </h3>
              <ul className="space-y-2">
                {(data?.recommendations?.length ? data.recommendations : ['Keep up the good work!']).map((r, i) => (
                  <li key={i} className="text-sm text-[#e6edf3] flex items-start gap-2">
                    <span className="text-[#00ff88]">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {tipList.length > 0 && (
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="font-semibold mb-3">Security Tips</h3>
              <ul className="space-y-2">
                {tipList.map((tip, i) => (
                  <li key={i} className="text-sm text-[#e6edf3] flex gap-2">
                    <span className="text-[#00ffcc]">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/scan"
              className="text-[#00ffcc] hover:underline text-sm"
            >
              Run another scan to update your score →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
