import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '8082', 10);
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'crickethub',
  password: process.env.DB_PASSWORD || 'crickethub',
  database: process.env.DB_NAME || 'team_db',
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'team-service' }));

const teams = express.Router();
teams.get('/', async (_req, res) => {
  const r = await pool.query('SELECT * FROM teams ORDER BY id');
  res.json(r.rows);
});
teams.get('/:id', async (req, res) => {
  const t = await pool.query('SELECT * FROM teams WHERE id=$1', [req.params.id]);
  if (!t.rows.length) return res.status(404).json({ error: 'Not found' });
  const players = await pool.query('SELECT * FROM players WHERE team_id=$1', [req.params.id]);
  res.json({ ...t.rows[0], players: players.rows });
});
teams.post('/', async (req, res) => {
  const userId = parseInt(String(req.headers['x-user-id'] || '0'), 10);
  const role = req.headers['x-user-role'];
  if (!['admin', 'team_owner'].includes(String(role))) return res.status(403).json({ error: 'Forbidden' });
  const { name, logo_url, city } = req.body;
  const r = await pool.query(
    'INSERT INTO teams(name,logo_url,owner_id,city) VALUES($1,$2,$3,$4) RETURNING *',
    [name, logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`, userId, city]
  );
  res.json(r.rows[0]);
});
teams.put('/:id', async (req, res) => {
  const { name, logo_url, city } = req.body;
  const r = await pool.query(
    'UPDATE teams SET name=COALESCE($1,name), logo_url=COALESCE($2,logo_url), city=COALESCE($3,city) WHERE id=$4 RETURNING *',
    [name, logo_url, city, req.params.id]
  );
  res.json(r.rows[0]);
});
teams.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM teams WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

const players = express.Router();
players.get('/', async (req, res) => {
  const { team_id } = req.query;
  if (team_id) {
    const r = await pool.query('SELECT * FROM players WHERE team_id=$1', [team_id]);
    return res.json(r.rows);
  }
  const r = await pool.query('SELECT * FROM players ORDER BY id');
  res.json(r.rows);
});
players.get('/:id', async (req, res) => {
  const r = await pool.query('SELECT * FROM players WHERE id=$1', [req.params.id]);
  res.json(r.rows[0] || null);
});
players.post('/', async (req, res) => {
  const { team_id, name, role, avatar_url, jersey_number } = req.body;
  const r = await pool.query(
    'INSERT INTO players(team_id,name,role,avatar_url,jersey_number) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [team_id, name, role, avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`, jersey_number]
  );
  res.json(r.rows[0]);
});
players.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM players WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

app.use('/teams', teams);
app.use('/players', players);

app.listen(PORT, () => console.log(`[team-service] listening on ${PORT}`));
