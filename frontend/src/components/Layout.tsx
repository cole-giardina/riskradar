import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, LayoutDashboard, ScanSearch, Mail, Settings, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/scan', label: 'Security Scan', icon: ScanSearch },
  { to: '/phishing', label: 'Phishing', icon: Mail },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative isolate min-h-screen">
      {/* Background layers matching hero-modern */}
      <div
        className="pointer-events-none fixed inset-0 -z-30"
        style={{
          backgroundColor: '#0d1117',
          backgroundImage: [
            'radial-gradient(ellipse 80% 60% at 10% -10%, rgba(0,255,204,0.05), transparent 60%)',
            'radial-gradient(ellipse 90% 70% at 90% -20%, rgba(0,170,255,0.04), transparent 70%)',
          ].join(', '),
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-20 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(0,255,204,0.04) 0.7px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(0,255,204,0.03) 0.7px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0d1117]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 font-bold text-[#00ffcc]">
            <Shield className="h-5 w-5" />
            <span className="text-lg tracking-tight">RiskRadar</span>
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] transition-all duration-300 ${
                    isActive
                      ? 'bg-[#00ffcc]/10 text-[#00ffcc]'
                      : 'text-[#8b949e] hover:bg-white/[0.04] hover:text-white'
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8b949e]">
              {user?.display_name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-[#8b949e] transition-all hover:border-[#ff3366]/30 hover:bg-[#ff3366]/5 hover:text-[#ff3366]"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-[#8b949e] md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-white/[0.06] bg-[#0d1117]/95 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm transition ${
                      isActive
                        ? 'bg-[#00ffcc]/10 text-[#00ffcc]'
                        : 'text-[#8b949e] hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
              <div className="mt-2 border-t border-white/[0.06] pt-3">
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-[#ff3366] hover:bg-[#ff3366]/5"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
