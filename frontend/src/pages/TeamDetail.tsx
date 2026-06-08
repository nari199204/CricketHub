import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function TeamDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: '', role: 'Batsman', jersey_number: 1 });

  const load = () => api.get(`/teams/${id}`).then(r => setTeam(r.data));
  useEffect(() => { load(); }, [id]);

  const canManage = user?.role === 'admin' || user?.role === 'team_owner';

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/players', { ...f, team_id: parseInt(id!, 10) });
    setShow(false); setF({ name: '', role: 'Batsman', jersey_number: 1 }); load();
  };
  const remove = async (pid: number) => { await api.delete(`/players/${pid}`); load(); };

  if (!team) return <p>Loading…</p>;
  return (
    <div className="space-y-5">
      <div className="card flex items-center gap-5">
        <img src={team.logo_url} className="w-24 h-24 rounded-full bg-slate-700" alt="" />
        <div>
          <h1 className="text-3xl font-extrabold">{team.name}</h1>
          <p className="text-slate-400">{team.city}</p>
          <p className="text-sm mt-1 text-slate-500">{team.players?.length || 0} players</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Squad</h2>
        {canManage && <button className="btn btn-primary" onClick={()=>setShow(true)}>+ Add player</button>}
      </div>

      {show && (
        <form onSubmit={addPlayer} className="card grid md:grid-cols-4 gap-3 items-center">
          <input className="input" placeholder="Player name" value={f.name} onChange={e=>setF({...f, name: e.target.value})} required />
          <select className="input" value={f.role} onChange={e=>setF({...f, role: e.target.value})}>
            <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>Wicket-keeper</option>
          </select>
          <input className="input" type="number" placeholder="Jersey #" value={f.jersey_number} onChange={e=>setF({...f, jersey_number: parseInt(e.target.value)||1})} />
          <div className="flex gap-2">
            <button className="btn btn-primary">Add</button>
            <button type="button" className="btn btn-ghost" onClick={()=>setShow(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {team.players?.map((p: any) => (
          <div key={p.id} className="card flex items-center gap-3">
            <img src={p.avatar_url} className="w-14 h-14 rounded-full bg-slate-700" alt="" />
            <div className="flex-1">
              <p className="font-bold">{p.name}</p>
              <p className="text-xs text-slate-400">#{p.jersey_number} · {p.role}</p>
            </div>
            {canManage && <button onClick={()=>remove(p.id)} className="text-red-400 text-sm hover:text-red-300">✕</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
