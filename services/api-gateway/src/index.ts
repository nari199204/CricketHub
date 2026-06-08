import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'crickethub-secret';

const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:8081';
const TEAM_URL = process.env.TEAM_SERVICE_URL || 'http://team-service:8082';
const MATCH_URL = process.env.MATCH_SERVICE_URL || 'http://match-service:8083';
const SCORING_URL = process.env.SCORING_SERVICE_URL || 'http://scoring-service:8084';

app.use(cors());
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api-gateway' }));

// Auth middleware — allow all /api/auth routes through (login/register/health etc.)
// function authMiddleware(req: any, res: any, next: any) {
//   if (req.path.startsWith('/api/auth')) {
//     console.log('[GATEWAY] Allowing auth route without token:', req.method, req.path);
//     return next();
//   }
//   const header = req.headers.authorization;
//   if (!header || !header.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Missing token' });
//   }
//   try {
//     const decoded: any = jwt.verify(header.slice(7), JWT_SECRET);
//     req.headers['x-user-id'] = String(decoded.id);
//     req.headers['x-user-role'] = decoded.role;
//     req.headers['x-user-email'] = decoded.email;
//     next();
//   } catch {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// }

function authMiddleware(req: any, res: any, next: any) {
  console.log('[GATEWAY]', {
    originalUrl: req.originalUrl,
    path: req.path,
    baseUrl: req.baseUrl
  });

  // Express mounted at /api, so req.path becomes /auth/*
  if (req.path.startsWith('/auth')) {
    console.log('[GATEWAY] Allowing auth route without token:', req.method, req.path);
    return next();
  }

  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded: any = jwt.verify(header.slice(7), JWT_SECRET);

    req.headers['x-user-id'] = String(decoded.id);
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
function roleGate(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    const role = req.headers['x-user-role'];
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

app.use('/api', authMiddleware);

const proxy = (target: string, rewrites: Record<string, string>) =>
  createProxyMiddleware({ target, changeOrigin: true, pathRewrite: rewrites });

app.use('/api/auth', proxy(AUTH_URL, { '^/api/auth': '' }));
app.use('/api/teams', proxy(TEAM_URL, { '^(.*)$': '/teams$1' }));
app.use('/api/players', proxy(TEAM_URL, { '^(.*)$': '/players$1' }));
app.use('/api/matches', proxy(MATCH_URL, { '^/api/matches': '' }));
app.use('/api/scoring', proxy(SCORING_URL, { '^(.*)$': '/scoring$1' }));
app.use('/api/stats', proxy(SCORING_URL, { '^(.*)$': '/stats$1' }));

app.listen(PORT, () => console.log(`[api-gateway] listening on ${PORT}`));
