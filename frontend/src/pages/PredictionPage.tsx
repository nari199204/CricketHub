import { FormEvent, useState } from 'react';
import { api } from '../lib/api';

type Prediction = {
  winner: string;
  team_a_probability: number;
  team_b_probability: number;
};

const initialForm = {
  team_a: 'Mumbai Strikers',
  team_b: 'Delhi Daredevils',
  team_a_rating: 85,
  team_b_rating: 76,
  team_a_form: 4,
  team_b_form: 2,
  home_advantage: 1,
};

export default function PredictionPage() {
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateNumber = (field: keyof typeof initialForm, value: string) => {
    setForm(current => ({ ...current, [field]: Number(value) }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post<Prediction>('/predictions/predict', form);
      setPrediction(response.data);
    } catch {
      setPrediction(null);
      setError('Prediction is unavailable. Confirm the prediction service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-extrabold">Match Prediction</h1>
        <p className="mt-1 text-slate-400">Compare team strength and recent form using the local CricketHub model.</p>
      </div>

      <form className="card space-y-5" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm font-semibold">
            <span>Team A</span>
            <input className="input" value={form.team_a} maxLength={100} required
              onChange={event => setForm(current => ({ ...current, team_a: event.target.value }))} />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Team B</span>
            <input className="input" value={form.team_b} maxLength={100} required
              onChange={event => setForm(current => ({ ...current, team_b: event.target.value }))} />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Team A Rating</span>
            <input className="input" type="number" min="0" max="100" value={form.team_a_rating}
              onChange={event => updateNumber('team_a_rating', event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Team B Rating</span>
            <input className="input" type="number" min="0" max="100" value={form.team_b_rating}
              onChange={event => updateNumber('team_b_rating', event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Team A Form (0–5)</span>
            <input className="input" type="number" min="0" max="5" value={form.team_a_form}
              onChange={event => updateNumber('team_a_form', event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-semibold">
            <span>Team B Form (0–5)</span>
            <input className="input" type="number" min="0" max="5" value={form.team_b_form}
              onChange={event => updateNumber('team_b_form', event.target.value)} />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4 accent-pitch-500"
            checked={form.home_advantage === 1}
            onChange={event => setForm(current => ({ ...current, home_advantage: event.target.checked ? 1 : 0 }))} />
          Team A has home advantage
        </label>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Predicting…' : 'Predict Winner'}
        </button>
        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
      </form>

      {prediction && (
        <section className="space-y-3" aria-live="polite">
          <h2 className="text-xl font-bold">Predicted winner: <span className="text-pitch-500">{prediction.winner}</span></h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="text-sm text-slate-400">{form.team_a}</p>
              <p className="mt-2 text-3xl font-extrabold">{Math.round(prediction.team_a_probability * 100)}%</p>
            </div>
            <div className="card">
              <p className="text-sm text-slate-400">{form.team_b}</p>
              <p className="mt-2 text-3xl font-extrabold">{Math.round(prediction.team_b_probability * 100)}%</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}