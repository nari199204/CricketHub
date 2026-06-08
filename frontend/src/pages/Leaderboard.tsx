import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Leaderboard() {
  const [tab, setTab] = useState<'runs'|'wickets'|'strike-rate'|'economy'>('runs');
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => { api.get(`/stats/leaderboard/${tab}`).then(r => setRows(r.data)); }, [tab]);

  const labels = {
    runs: 'Top Run Scorers',
    wickets: 'Top Wicket Takers',
    'strike-rate': 'Highest Strike Rate',
    economy: 'Best Economy',
  };
  const valueOf = (p: any) => ({
    runs: p.runs_scored,
    wickets: p.wickets_taken,
    'strike-rate': p.strike_rate,
    economy: p.economy,
  }[tab]);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-extrabold">Leaderboards</h1>
      <div className="flex flex-wrap gap-2">
        {(['runs','wickets','strike-rate','economy'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)}
            className={`btn ${tab===t ? 'btn-primary' : 'btn-ghost'}`}>{labels[t]}</button>
        ))}
      </div>
      <div className="card">
        <h2 className="font-bold mb-3">{labels[tab]}</h2>
        <table className="w-full">
          <thead className="text-xs uppercase text-slate-400">
            <tr><th className="text-left py-2">#</th><th className="text-left">Player</th><th className="text-right">Value</th></tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr key={p.player_id} className="border-t border-slate-800">
                <td className="py-3 font-mono text-slate-500">{i+1}</td>
                <td className="font-semibold">{p.player_name}</td>
                <td className="text-right font-mono text-pitch-500 font-bold">{valueOf(p)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
