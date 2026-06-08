import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '', name: '', role: 'team_owner' });
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    try { await register(f.email, f.password, f.name, f.role); nav('/dashboard'); }
    catch (e: any) { setErr(e.response?.data?.error || 'Registration failed'); }
  };
  return (
    <div className="min-h-screen grid place-items-center hero-bg px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <div className="mt-6 space-y-3">
          <input className="input" placeholder="Full name" value={f.name} onChange={e=>setF({...f, name: e.target.value})} />
          <input className="input" placeholder="Email" value={f.email} onChange={e=>setF({...f, email: e.target.value})} />
          <input className="input" type="password" placeholder="Password" value={f.password} onChange={e=>setF({...f, password: e.target.value})} />
          <select className="input" value={f.role} onChange={e=>setF({...f, role: e.target.value})}>
            <option value="team_owner">Team Owner</option>
            <option value="scorer">Scorer</option>
            <option value="viewer">Viewer</option>
          </select>
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button className="btn btn-primary w-full">Sign up</button>
        </div>
        <p className="text-sm text-slate-400 mt-4 text-center">
          Already have an account? <Link to="/login" className="text-pitch-500 font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
}
