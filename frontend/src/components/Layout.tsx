import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-[#30363d] bg-[#0d1117]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-[#00ffcc]">
            <span className="text-xl">🛡️</span>
            RiskRadar
          </NavLink>
          <div className="flex items-center gap-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-[#00ffcc]' : 'text-[#8b949e] hover:text-white'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/scan"
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-[#00ffcc]' : 'text-[#8b949e] hover:text-white'}`
              }
            >
              Security Scan
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `text-sm ${isActive ? 'text-[#00ffcc]' : 'text-[#8b949e] hover:text-white'}`
              }
            >
              Settings
            </NavLink>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#8b949e]">
                {user?.display_name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-[#8b949e] hover:text-[#ff3366] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
