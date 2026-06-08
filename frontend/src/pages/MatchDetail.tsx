import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function MatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [match, setMatch] = useState<any>(null);
  const [innings, setInnings] = useState<any[]>([]);
  const [card, setCard] = useState<any[]>([]);

  const load = async () => {
    const m = await api.get(`/matches/${id}`); setMatch(m.data);
    const i = await api.get(`/scoring/innings/match/${id}`); setInnings(i.data);
    const s = await api.get(`/scoring/scorecard/${id}`); setCard(s.data);
  };
  useEffect(() => { load(); }, [id]);

  const canScore = user?.role === 'admin' || user?.role === 'scorer';

  const doToss = async () => {
    const winner = prompt(`Toss winner team id (${match.team_a_id} or ${match.team_b_id})?`);
    const decision = prompt('Decision (bat/bowl)?', 'bat');
    if (!winner) return;
    await api.post(`/matches/${id}/toss`, { toss_winner_id: parseInt(winner), toss_decision: decision });
    load();
  };

  const startInnings = async () => {
    await api.post('/scoring/innings', {
      match_id: parseInt(id!), batting_team_id: match.team_a_id,
      bowling_team_id: match.team_b_id, innings_number: innings.length + 1,
    });
    load();
  };

  if (!match) return <p>Loading…</p>;
  return (
    <div className="space-y-5">
      <div className="card">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">{match.team_a_name} vs {match.team_b_name}</h1>
            <p className="text-slate-400 mt-1">{match.venue} · {match.overs} overs</p>
            <p className="text-xs text-slate-500">{new Date(match.scheduled_at).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            {match.status === 'scheduled' && canScore && <button className="btn btn-primary" onClick={doToss}>Do toss</button>}
            {match.status === 'live' && canScore && <button className="btn btn-ghost" onClick={startInnings}>+ Start innings</button>}
            {innings.length > 0 && canScore && <Link to={`/matches/${id}/score`} className="btn btn-primary">Live score</Link>}
          </div>
        </div>
      </div>

      {card.map(inn => (
        <div key={inn.id} className="card">
          <div className="flex justify-between items-center">
            <h2 className="font-bold">Innings {inn.innings_number}</h2>
            <div className="font-mono text-2xl font-extrabold">
              {inn.total_runs}/{inn.total_wickets} <span className="text-sm text-slate-400">({Math.floor(inn.total_balls/6)}.{inn.total_balls%6} ov)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">{inn.balls?.length || 0} deliveries · extras {inn.extras}</p>
        </div>
      ))}
    </div>
  );
}
