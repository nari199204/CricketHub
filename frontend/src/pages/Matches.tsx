import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ team_a_id: '', team_b_id: '', venue: '', scheduled_at: '', overs: 20 });

  const load = () => api.get('/matches').then(r => setMatches(r.data));
  useEffect(() => { load(); api.get('/teams').then(r => setTeams(r.data)); }, []);

  const canCreate = user?.role === 'admin' || user?.role === 'team_owner';

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const ta = teams.find(t => t.id == f.team_a_id);
    const tb = teams.find(t => t.id == f.team_b_id);
    await api.post('/matches', {
      team_a_id: parseInt(f.team_a_id), team_b_id: parseInt(f.team_b_id),
      team_a_name: ta?.name, team_b_name: tb?.name,
      venue: f.venue, scheduled_at: f.scheduled_at, overs: f.overs,
    });
    setShow(false); load();
  };

  const statusTag = (s: string) => ({
    scheduled: 'bg-blue-500/20 text-blue-300',
    live: 'bg-red-500/20 text-red-300 animate-pulse',
    completed: 'bg-slate-700 text-slate-300',
  }[s] || 'bg-slate-700');

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Matches</h1>
        {canCreate && <button className="btn btn-primary" onClick={()=>setShow(true)}>+ New match</button>}
      </div>
      {show && (
        <form onSubmit={create} className="card grid md:grid-cols-5 gap-3">
          <select className="input" value={f.team_a_id} onChange={e=>setF({...f, team_a_id: e.target.value})} required>
            <option value="">Team A</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="input" value={f.team_b_id} onChange={e=>setF({...f, team_b_id: e.target.value})} required>
            <option value="">Team B</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input className="input" placeholder="Venue" value={f.venue} onChange={e=>setF({...f, venue: e.target.value})} />
          <input className="input" type="datetime-local" value={f.scheduled_at} onChange={e=>setF({...f, scheduled_at: e.target.value})} />
          <button className="btn btn-primary">Create</button>
        </form>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {matches.map(m => (
          <Link to={`/matches/${m.id}`} key={m.id} className="card hover:border-pitch-500 transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{m.team_a_name} <span className="text-slate-500">vs</span> {m.team_b_name}</h3>
                <p className="text-sm text-slate-400 mt-1">{m.venue}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date(m.scheduled_at).toLocaleString()} · {m.overs} overs</p>
              </div>
              <span className={`tag ${statusTag(m.status)}`}>{m.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
