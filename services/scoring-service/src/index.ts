import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '8084', 10);
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'crickethub',
  password: process.env.DB_PASSWORD || 'crickethub',
  database: process.env.DB_NAME || 'scoring_db',
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'scoring-service' }));

// /api/scoring/* routes
const scoring = express.Router();

scoring.post('/innings', async (req, res) => {
  const { match_id, batting_team_id, bowling_team_id, innings_number } = req.body;
  const r = await pool.query(
    `INSERT INTO innings(match_id,batting_team_id,bowling_team_id,innings_number) VALUES($1,$2,$3,$4) RETURNING *`,
    [match_id, batting_team_id, bowling_team_id, innings_number || 1]
  );
  res.json(r.rows[0]);
});

scoring.get('/innings/match/:matchId', async (req, res) => {
  const r = await pool.query('SELECT * FROM innings WHERE match_id=$1 ORDER BY innings_number', [req.params.matchId]);
  res.json(r.rows);
});

// Record a ball
scoring.post('/ball', async (req, res) => {
  const role = req.headers['x-user-role'];
  if (!['admin', 'scorer'].includes(String(role))) return res.status(403).json({ error: 'Forbidden' });
  const { innings_id, batsman_id, bowler_id, event } = req.body;
  // event: dot, 1, 2, 3, 4, 6, wicket, wide, no_ball
  let runs = 0, is_wicket = false, is_wide = false, is_no_ball = false;
  switch (event) {
    case 'dot': runs = 0; break;
    case '1': runs = 1; break;
    case '2': runs = 2; break;
    case '3': runs = 3; break;
    case '4': runs = 4; break;
    case '6': runs = 6; break;
    case 'wicket': is_wicket = true; break;
    case 'wide': runs = 1; is_wide = true; break;
    case 'no_ball': runs = 1; is_no_ball = true; break;
    default: return res.status(400).json({ error: 'Invalid event' });
  }
  const inn = await pool.query('SELECT * FROM innings WHERE id=$1', [innings_id]);
  if (!inn.rows.length) return res.status(404).json({ error: 'Innings not found' });
  const i = inn.rows[0];
  const legal = !(is_wide || is_no_ball);
  const newBalls = i.total_balls + (legal ? 1 : 0);
  const overNumber = Math.floor(newBalls / 6);
  const ballNumber = legal ? (newBalls - 1) % 6 + 1 : (i.total_balls % 6) + 1;

  await pool.query(
    `INSERT INTO balls(innings_id,over_number,ball_number,batsman_id,bowler_id,runs,is_wicket,is_wide,is_no_ball,event)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [innings_id, overNumber, ballNumber, batsman_id, bowler_id, runs, is_wicket, is_wide, is_no_ball, event]
  );

  const updated = await pool.query(
    `UPDATE innings SET
       total_runs = total_runs + $1,
       total_wickets = total_wickets + $2,
       total_balls = $3,
       extras = extras + $4
     WHERE id=$5 RETURNING *`,
    [runs, is_wicket ? 1 : 0, newBalls, (is_wide || is_no_ball) ? 1 : 0, innings_id]
  );

  // Update player stats
  if (batsman_id && !is_wide && !is_no_ball) {
    await pool.query(
      `UPDATE player_stats SET runs_scored = runs_scored + $1, balls_faced = balls_faced + 1 WHERE player_id=$2`,
      [is_wicket ? 0 : runs, batsman_id]
    );
  }
  if (bowler_id) {
    await pool.query(
      `UPDATE player_stats SET runs_conceded = runs_conceded + $1, balls_bowled = balls_bowled + $2, wickets_taken = wickets_taken + $3 WHERE player_id=$4`,
      [runs, legal ? 1 : 0, is_wicket ? 1 : 0, bowler_id]
    );
  }

  res.json(updated.rows[0]);
});

scoring.get('/scorecard/:matchId', async (req, res) => {
  const inn = await pool.query('SELECT * FROM innings WHERE match_id=$1 ORDER BY innings_number', [req.params.matchId]);
  const result = [];
  for (const i of inn.rows) {
    const balls = await pool.query('SELECT * FROM balls WHERE innings_id=$1 ORDER BY id', [i.id]);
    result.push({ ...i, balls: balls.rows });
  }
  res.json(result);
});

// /api/stats/* routes
const stats = express.Router();
stats.get('/leaderboard/runs', async (_req, res) => {
  const r = await pool.query('SELECT * FROM player_stats ORDER BY runs_scored DESC LIMIT 10');
  res.json(r.rows);
});
stats.get('/leaderboard/wickets', async (_req, res) => {
  const r = await pool.query('SELECT * FROM player_stats ORDER BY wickets_taken DESC LIMIT 10');
  res.json(r.rows);
});
stats.get('/leaderboard/strike-rate', async (_req, res) => {
  const r = await pool.query(`
    SELECT *, CASE WHEN balls_faced>0 THEN ROUND(runs_scored::numeric*100/balls_faced,2) ELSE 0 END AS strike_rate
    FROM player_stats WHERE balls_faced > 50 ORDER BY strike_rate DESC LIMIT 10
  `);
  res.json(r.rows);
});
stats.get('/leaderboard/economy', async (_req, res) => {
  const r = await pool.query(`
    SELECT *, CASE WHEN balls_bowled>0 THEN ROUND(runs_conceded::numeric*6/balls_bowled,2) ELSE 0 END AS economy
    FROM player_stats WHERE balls_bowled > 30 ORDER BY economy ASC LIMIT 10
  `);
  res.json(r.rows);
});
stats.get('/player/:id', async (req, res) => {
  const r = await pool.query('SELECT * FROM player_stats WHERE player_id=$1', [req.params.id]);
  res.json(r.rows[0] || null);
});

app.use('/scoring', scoring);
app.use('/stats', stats);

app.listen(PORT, () => console.log(`[scoring-service] listening on ${PORT}`));
