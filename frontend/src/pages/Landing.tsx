import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen hero-bg">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pitch-500 to-pitch-700 grid place-items-center text-white font-black">C</div>
          <span className="font-extrabold text-lg">CricketHub</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign up</Link>
        </div>
      </header>
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        <span className="tag bg-pitch-500/20 text-pitch-50 mb-4">⚡ Live ball-by-ball scoring</span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Cricket scoring,<br/><span className="text-pitch-500">simplified.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
          Build your team, schedule matches, score every ball, and track stats — all in one modern platform built for cricketers.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link to="/register" className="btn btn-primary text-lg px-6 py-3">Get started free</Link>
          <Link to="/login" className="btn btn-ghost text-lg px-6 py-3">Login</Link>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-5">
        {[
          { t: 'Team Management', d: 'Create teams, manage rosters, assign jersey numbers.' },
          { t: 'Live Scoring', d: 'Score every ball with one tap. Auto-calculated overs & rates.' },
          { t: 'Player Stats', d: 'Track runs, wickets, strike rate, economy — career-wide.' },
        ].map(f => (
          <div key={f.t} className="card">
            <h3 className="font-bold text-lg">{f.t}</h3>
            <p className="text-slate-400 mt-2 text-sm">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
