/**
 * Authentication service for GitHub Buddy.
 * - Passwords are hashed with Node's built-in scrypt (salted, never stored in plain text).
 * - Sessions use a signed token (HMAC-SHA256, JWT format) that expires after 7 days.
 * - Users are stored in server/data/users.json (no external database required for the MVP).
 */
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

let fallbackSecret = null;
function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (!fallbackSecret) {
    // Random per-process secret when JWT_SECRET is not configured (users must log in again after restart)
    fallbackSecret = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  JWT_SECRET not set. Using a temporary secret; set JWT_SECRET in .env for persistent logins.');
  }
  return fallbackSecret;
}

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')) || [];
  } catch {
    return [];
  }
}

function writeUsers(users) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

const b64url = (input) => Buffer.from(input).toString('base64url');

export function createToken(user) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(JSON.stringify({ sub: user.id, email: user.email, iat: now, exp: now + TOKEN_TTL_SECONDS }));
  const signature = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = crypto.createHmac('sha256', getSecret()).update(`${header}.${payload}`).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export function registerUser({ name, email, password }) {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalizedEmail)) {
    const err = new Error('An account with this email already exists. Please log in instead.');
    err.status = 409;
    err.code = 'EMAIL_EXISTS';
    throw err;
  }
  const { salt, hash } = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordSalt: salt,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return user;
}

export function loginUser({ email, password }) {
  const users = readUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    err.code = 'INVALID_CREDENTIALS';
    throw err;
  }
  return user;
}

export function findUserById(id) {
  return readUsers().find((u) => u.id === id) || null;
}
