import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Dashboard() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [topRuns, setTopRuns] = useState<any[]>([]);

  useEffect(() => {
    api.get('/matches/upcoming').then(r => setUpcoming(r.data));
    api.get('/matches/recent').then(r => setRecent(r.data));
    api.get('/teams').then(r => setTeams(r.data));
    api.get('/stats/leaderboard/runs').then(r => setTopRuns(r.data.slice(0,5)));
  }, []);

  const stat = (label: string, value: any, sub?: string) => (
    <div className="card">
      <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-extrabold mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-slate-400 text-sm">Your cricket world, at a glance.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stat('Teams', teams.length)}
        {stat('Upcoming matches', upcoming.length)}
        {stat('Recent matches', recent.length)}
        {stat('Top scorer', topRuns[0]?.runs_scored ?? '—', topRuns[0]?.player_name)}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Upcoming Matches</h2>
            <Link to="/matches" className="text-pitch-500 text-sm">View all →</Link>
          </div>
          <div className="space-y-3">
            {upcoming.length === 0 && <p className="text-slate-500 text-sm">No upcoming matches.</p>}
            {upcoming.slice(0,4).map(m => (
              <Link to={`/matches/${m.id}`} key={m.id} className="block p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{m.team_a_name} <span className="text-slate-500">vs</span> {m.team_b_name}</span>
                  <span className="tag bg-blue-500/20 text-blue-300">Scheduled</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{m.venue} · {new Date(m.scheduled_at).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Top Run Scorers</h2>
            <Link to="/leaderboard" className="text-pitch-500 text-sm">Leaderboard →</Link>
          </div>
          <div className="space-y-2">
            {topRuns.map((p, i) => (
              <div key={p.player_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-bold text-slate-500">{i+1}</span>
                  <span className="font-semibold">{p.player_name}</span>
                </div>
                <span className="font-mono text-pitch-500 font-bold">{p.runs_scored}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Your Teams</h2>
          <Link to="/teams" className="text-pitch-500 text-sm">Manage →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {teams.slice(0,4).map(t => (
            <Link to={`/teams/${t.id}`} key={t.id} className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-center">
              <img src={t.logo_url} alt="" className="w-16 h-16 mx-auto rounded-full bg-slate-700" />
              <p className="mt-2 font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-slate-500">{t.city}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
