import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

const EVENTS = [
  { v: 'dot', label: '·', cls: 'bg-slate-700' },
  { v: '1', label: '1', cls: 'bg-slate-700' },
  { v: '2', label: '2', cls: 'bg-slate-700' },
  { v: '3', label: '3', cls: 'bg-slate-700' },
  { v: '4', label: '4', cls: 'bg-pitch-500' },
  { v: '6', label: '6', cls: 'bg-pitch-700' },
  { v: 'wicket', label: 'WICKET', cls: 'bg-ball-500' },
  { v: 'wide', label: 'WD', cls: 'bg-yellow-600' },
  { v: 'no_ball', label: 'NB', cls: 'bg-orange-600' },
];

export default function Scoring() {
  const { id } = useParams();
  const [innings, setInnings] = useState<any[]>([]);
  const [match, setMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [batsman, setBatsman] = useState<number>(0);
  const [bowler, setBowler] = useState<number>(0);

  const refresh = async () => {
    const i = await api.get(`/scoring/innings/match/${id}`); setInnings(i.data);
  };
  useEffect(() => {
    api.get(`/matches/${id}`).then(async (m) => {
      setMatch(m.data);
      const a = await api.get(`/players?team_id=${m.data.team_a_id}`);
      const b = await api.get(`/players?team_id=${m.data.team_b_id}`);
      setPlayers([...a.data, ...b.data]);
      if (a.data[0]) setBatsman(a.data[0].id);
      if (b.data[0]) setBowler(b.data[0].id);
    });
    refresh();
  }, [id]);

  const current = innings[innings.length - 1];

  const score = async (event: string) => {
    if (!current) return alert('Start an innings first.');
    await api.post('/scoring/ball', { innings_id: current.id, batsman_id: batsman, bowler_id: bowler, event });
    refresh();
  };

  if (!match) return <p>Loading…</p>;
  return (
    <div className="space-y-5">
      <div className="card hero-bg">
        <h1 className="text-2xl font-extrabold">{match.team_a_name} vs {match.team_b_name}</h1>
        <p className="text-slate-300 text-sm">{match.venue}</p>
        {current && (
          <div className="mt-4 font-mono text-5xl font-black">
            {current.total_runs}/{current.total_wickets}
            <span className="text-xl text-slate-300 ml-3">({Math.floor(current.total_balls/6)}.{current.total_balls%6} ov)</span>
          </div>
        )}
        {current && match.overs && (
          <p className="mt-2 text-slate-400 text-sm">
            CRR: {current.total_balls ? (current.total_runs*6/current.total_balls).toFixed(2) : '0.00'} ·
            Balls left: {match.overs*6 - current.total_balls}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card">
          <label className="text-xs text-slate-400 uppercase">On strike</label>
          <select className="input mt-1" value={batsman} onChange={e=>setBatsman(parseInt(e.target.value))}>
            {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
          </select>
        </div>
        <div className="card">
          <label className="text-xs text-slate-400 uppercase">Bowling</label>
          <select className="input mt-1" value={bowler} onChange={e=>setBowler(parseInt(e.target.value))}>
            {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.role})</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold mb-3">Record ball</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {EVENTS.map(e => (
            <button key={e.v} onClick={()=>score(e.v)}
              className={`${e.cls} text-white font-extrabold text-xl py-6 rounded-xl hover:opacity-90 active:scale-95 transition`}>
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
