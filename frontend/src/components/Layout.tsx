import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/teams', label: 'Teams' },
    { to: '/matches', label: 'Matches' },
    { to: '/leaderboard', label: 'Leaderboard' },
  ];
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pitch-500 to-pitch-700 grid place-items-center text-white font-black">C</div>
            <span className="font-extrabold text-lg tracking-tight">CricketHub</span>
          </Link>
          <nav className="hidden md:flex gap-1">
            {links.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({isActive}) => `px-3 py-1.5 rounded-lg text-sm font-medium ${isActive ? 'bg-pitch-500/20 text-pitch-50' : 'text-slate-300 hover:bg-slate-800'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-slate-400">{user?.name} <span className="tag bg-pitch-500/20 text-pitch-50 ml-1">{user?.role}</span></span>
            <button className="btn btn-ghost text-sm" onClick={() => { logout(); nav('/'); }}>Logout</button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800">CricketHub © 2025 — Score. Track. Win.</footer>
    </div>
  );
}
