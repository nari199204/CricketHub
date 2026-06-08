import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || '8081', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'crickethub-secret';

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'crickethub',
  password: process.env.DB_PASSWORD || 'crickethub',
  database: process.env.DB_NAME || 'auth_db',
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

app.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const safeRole = ['admin', 'team_owner', 'scorer', 'viewer'].includes(role) ? role : 'viewer';
    const r = await pool.query(
      'INSERT INTO users(email,password_hash,name,role) VALUES($1,$2,$3,$4) RETURNING id,email,name,role',
      [email, password, name, safeRole]
    );
    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e: any) {
    if (e.code === '23505') return res.status(409).json({ error: 'Email exists' });
    res.status(500).json({ error: e.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const u = r.rows[0];
    if (password !== u.password_hash) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: u.id, email: u.email, role: u.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: u.id, email: u.email, name: u.name, role: u.role } });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/me', async (req, res) => {
  const id = req.headers['x-user-id'];
  if (!id) return res.status(401).json({ error: 'Unauthorized' });
  const r = await pool.query('SELECT id,email,name,role FROM users WHERE id=$1', [id]);
  res.json(r.rows[0] || null);
});

app.get('/users', async (_req, res) => {
  const r = await pool.query('SELECT id,email,name,role,created_at FROM users ORDER BY id');
  res.json(r.rows);
});

app.listen(PORT, () => console.log(`[auth-service] listening on ${PORT}`));
