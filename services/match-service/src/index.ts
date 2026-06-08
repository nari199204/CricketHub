import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '8083', 10);
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'crickethub',
  password: process.env.DB_PASSWORD || 'crickethub',
  database: process.env.DB_NAME || 'match_db',
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'match-service' }));

app.get('/', async (_req, res) => {
  const r = await pool.query('SELECT * FROM matches ORDER BY scheduled_at DESC');
  res.json(r.rows);
});
app.get('/upcoming', async (_req, res) => {
  const r = await pool.query("SELECT * FROM matches WHERE status='scheduled' ORDER BY scheduled_at ASC LIMIT 10");
  res.json(r.rows);
});
app.get('/recent', async (_req, res) => {
  const r = await pool.query("SELECT * FROM matches WHERE status IN ('completed','live') ORDER BY scheduled_at DESC LIMIT 10");
  res.json(r.rows);
});
app.get('/:id', async (req, res) => {
  const r = await pool.query('SELECT * FROM matches WHERE id=$1', [req.params.id]);
  res.json(r.rows[0] || null);
});
app.post('/', async (req, res) => {
  const role = req.headers['x-user-role'];
  if (!['admin', 'team_owner'].includes(String(role))) return res.status(403).json({ error: 'Forbidden' });
  const { team_a_id, team_b_id, team_a_name, team_b_name, venue, scheduled_at, overs } = req.body;
  const r = await pool.query(
    `INSERT INTO matches(team_a_id,team_b_id,team_a_name,team_b_name,venue,scheduled_at,overs)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [team_a_id, team_b_id, team_a_name, team_b_name, venue, scheduled_at, overs || 20]
  );
  res.json(r.rows[0]);
});
app.post('/:id/toss', async (req, res) => {
  const { toss_winner_id, toss_decision } = req.body;
  const r = await pool.query(
    `UPDATE matches SET toss_winner_id=$1, toss_decision=$2, status='live' WHERE id=$3 RETURNING *`,
    [toss_winner_id, toss_decision, req.params.id]
  );
  res.json(r.rows[0]);
});
app.post('/:id/complete', async (req, res) => {
  const r = await pool.query(`UPDATE matches SET status='completed' WHERE id=$1 RETURNING *`, [req.params.id]);
  res.json(r.rows[0]);
});

app.listen(PORT, () => console.log(`[match-service] listening on ${PORT}`));
