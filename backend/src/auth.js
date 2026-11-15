// Password hashing (scrypt) and HMAC-signed bearer tokens, no external deps.
import crypto from 'node:crypto';

const SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const TTL_SECONDS = 60 * 60 * 12;

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(pw, salt, 32).toString('hex')}`;
}

export function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  const got = crypto.scryptSync(pw, salt, 32);
  return crypto.timingSafeEqual(got, Buffer.from(hash, 'hex'));
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

export function issueToken(user) {
  const payload = b64(JSON.stringify({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + TTL_SECONDS }));
  return `${payload}.${sign(payload)}`;
}

export function readToken(token) {
  const [payload, sig] = (token || '').split('.');
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return data.exp > Date.now() / 1000 ? data : null;
}

export const publicUser = ({ password_hash, ...u }) => u;

export function authenticate(db) {
  const find = db.prepare('SELECT * FROM users WHERE id = ?');
  return (req, _res, next) => {
    const data = readToken(req.headers.authorization?.replace(/^Bearer /, ''));
    const user = data && find.get(data.sub);
    req.user = user ? publicUser(user) : null;
    next();
  };
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to do that.' });
  }
  next();
};
