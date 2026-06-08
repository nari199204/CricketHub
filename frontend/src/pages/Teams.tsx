import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Teams() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: '', city: '' });

  const load = () => api.get('/teams').then(r => setTeams(r.data));
  useEffect(() => { load(); }, []);

  const canCreate = user?.role === 'admin' || user?.role === 'team_owner';
  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/teams', f);
    setShow(false); setF({ name: '', city: '' }); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Teams</h1>
        {canCreate && <button className="btn btn-primary" onClick={()=>setShow(true)}>+ New team</button>}
      </div>
      {show && (
        <form onSubmit={create} className="card flex flex-col md:flex-row gap-3 items-center">
          <input className="input" placeholder="Team name" value={f.name} onChange={e=>setF({...f, name: e.target.value})} required />
          <input className="input" placeholder="City" value={f.city} onChange={e=>setF({...f, city: e.target.value})} />
          <button className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={()=>setShow(false)}>Cancel</button>
        </form>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(t => (
          <Link to={`/teams/${t.id}`} key={t.id} className="card hover:border-pitch-500 transition">
            <div className="flex items-center gap-4">
              <img src={t.logo_url} alt="" className="w-16 h-16 rounded-full bg-slate-700" />
              <div>
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-sm text-slate-400">{t.city}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
