import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@crickethub.io');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    try { await login(email, password); nav('/dashboard'); }
    catch (e: any) { setErr(e.response?.data?.error || 'Login failed'); }
  };
  return (
    <div className="min-h-screen grid place-items-center hero-bg px-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="text-slate-400 text-sm mt-1">Sign in to CricketHub</p>
        <div className="mt-6 space-y-3">
          <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button className="btn btn-primary w-full">Login</button>
        </div>
        <p className="text-sm text-slate-400 mt-4 text-center">
          No account? <Link to="/register" className="text-pitch-500 font-semibold">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
