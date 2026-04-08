import { useEffect, useState, type MouseEvent } from 'react';
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
import {
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Clock,
} from 'lucide-react';

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
  spotlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  spotlight?: boolean;
}) {
  return (
    <div
      onMouseMove={spotlight ? setSpotlight : undefined}
      onMouseLeave={spotlight ? clearSpotlight : undefined}
      className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#161b22]/60 backdrop-blur-sm transition duration-500 ${className}`}
    >
      {spotlight && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(300px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(0,255,204,0.08), transparent 70%)',
          }}
        />
      )}
      {children}
    </div>
  );
}

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
        <div className="flex items-center gap-3 text-[#8b949e]">
          <div className="h-2 w-2 rounded-full bg-[#00ffcc] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.35em]">Loading dashboard</span>
        </div>
      </div>
    );
  }

  const displayName = user?.display_name || user?.email?.split('@')[0] || 'User';
  const score = data?.current_score?.score ?? null;
  const hasHistory = data?.score_history && data.score_history.length > 0;
  const lastScan = user?.last_scan_at ? new Date(user.last_scan_at) : null;
  const daysSinceScan = lastScan ? Math.floor((Date.now() - lastScan.getTime()) / 86400000) : null;
  const showReminder = daysSinceScan !== null && daysSinceScan >= 14;

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-[#00ff88]';
    if (s >= 60) return 'text-[#00ffcc]';
    if (s >= 40) return 'text-[#ff6b35]';
    return 'text-[#ff3366]';
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return 'from-[#00ff88]/20 to-[#00ff88]/5';
    if (s >= 60) return 'from-[#00ffcc]/20 to-[#00ffcc]/5';
    if (s >= 40) return 'from-[#ff6b35]/20 to-[#ff6b35]/5';
    return 'from-[#ff3366]/20 to-[#ff3366]/5';
  };

  const chartData = {
    labels: (data?.score_history || [])
      .map((h) => new Date(h.date).toLocaleDateString())
      .reverse(),
    datasets: [
      {
        label: 'Security Score',
        data: (data?.score_history || []).map((h) => h.score).reverse(),
        borderColor: '#00ffcc',
        backgroundColor: 'rgba(0, 255, 204, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00ffcc',
        pointBorderColor: '#0d1117',
        pointBorderWidth: 2,
        pointRadius: 4,
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
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b949e', font: { size: 10 } },
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8b949e', font: { size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#00ffcc]">
          Dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          {displayName}&rsquo;s Security Score
        </h1>
        <p className="text-sm text-[#8b949e]">
          Like a credit score, but for cybersecurity
        </p>
      </div>

      {/* Stale scan reminder */}
      {showReminder && (
        <Card spotlight>
          <div className="flex items-center gap-4 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ff6b35]/10">
              <Clock className="h-5 w-5 text-[#ff6b35]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#ff6b35]">
                You haven&rsquo;t run a security scan in {daysSinceScan} days
              </p>
              <p className="mt-0.5 text-xs text-[#8b949e]">Consider checking for new breaches</p>
            </div>
            <Link
              to="/scan"
              className="flex items-center gap-1.5 rounded-full bg-[#ff6b35]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#ff6b35] transition hover:bg-[#ff6b35]/20"
            >
              Run scan
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      )}

      {score === null ? (
        /* No score yet CTA */
        <Card spotlight className="border-[#00ffcc]/20">
          <div className="relative p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
              <ShieldCheck className="h-7 w-7 text-[#00ffcc]" />
            </div>
            <h2 className="text-xl font-semibold">No scan yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#8b949e]">
              Complete the security scan to get your score, see your risk profile,
              and get personalized recommendations.
            </p>
            <Link
              to="/scan"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#00ffcc] px-7 py-3 text-sm font-semibold text-[#0d1117] transition-all hover:bg-[#00e6b8] hover:shadow-lg hover:shadow-[#00ffcc]/20"
            >
              Run Security Scan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Score + History bento row */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            {/* Score card */}
            <Card spotlight>
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                    Current Score
                  </p>
                  <span className="flex items-center gap-1.5 rounded-full bg-[#00ffcc]/10 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.3em] text-[#00ffcc]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className={`text-7xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-2xl text-[#8b949e]">/ 100</span>
                </div>
                {data?.percentile != null && (
                  <p className="mt-3 text-sm text-[#00ffcc]/70">
                    Top {100 - data.percentile}% of users &middot; Industry avg: {data?.industry_average ?? 58}
                  </p>
                )}
                <div className={`mt-6 h-2 w-full overflow-hidden rounded-full bg-gradient-to-r ${getScoreBg(score)}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      score >= 80 ? 'bg-[#00ff88]' : score >= 60 ? 'bg-[#00ffcc]' : score >= 40 ? 'bg-[#ff6b35]' : 'bg-[#ff3366]'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* History chart */}
            {hasHistory ? (
              <Card spotlight>
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                      Score History
                    </p>
                    <TrendingUp className="h-4 w-4 text-[#8b949e]" />
                  </div>
                  <div className="mt-6 h-48">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="flex h-full items-center justify-center p-8 text-sm text-[#8b949e]">
                  Complete more scans to see your score history
                </div>
              </Card>
            )}
          </div>

          {/* Risks + Recommendations row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card spotlight>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff6b35]/10">
                    <AlertTriangle className="h-4 w-4 text-[#ff6b35]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#ff6b35]">
                      Risks Found
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                      {data?.risks?.length || 0} identified
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {(data?.risks?.length ? data.risks : ['No risks identified']).map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#e6edf3]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6b35]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card spotlight>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ff88]/10">
                    <ShieldCheck className="h-4 w-4 text-[#00ff88]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ff88]">
                      Recommendations
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#8b949e]">
                      {data?.recommendations?.length || 0} actions
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {(data?.recommendations?.length ? data.recommendations : ['Keep up the good work!']).map((r, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#e6edf3]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00ff88]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          {/* Tips */}
          {tipList.length > 0 && (
            <Card spotlight>
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#00ffcc]/10">
                    <Lightbulb className="h-4 w-4 text-[#00ffcc]" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc]">
                    Security Tips
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {tipList.map((tip, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-white/[0.06] px-4 py-3 text-sm text-[#e6edf3] transition hover:-translate-y-0.5 hover:border-white/[0.12]"
                    >
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Rescan link */}
          <div className="text-center">
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#00ffcc] transition hover:text-[#00e6b8]"
            >
              Run another scan to update your score
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
