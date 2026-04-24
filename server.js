'use strict';

const crypto = require('crypto');
const fs = require('fs/promises');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DB_PATH = path.join(ROOT_DIR, 'backend', 'projexa.json');
const JWT_SECRET = process.env.PROJEXA_JWT_SECRET || 'projexa-dev-secret';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60; // 7 days in seconds

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

let SQL = null;
let db = null;

async function initDatabase() {
  SQL = await initSqlJs();
  
  let data = null;
  try {
    data = await fs.readFile(DB_PATH, 'utf8');
    data = JSON.parse(data);
  } catch (error) {
    data = null;
  }

  if (data && data.sqlState) {
    db = new SQL.Database(new Uint8Array(Buffer.from(data.sqlState, 'base64')));
  } else {
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        passwordSalt TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        startDate TEXT,
        endDate TEXT,
        description TEXT,
        members TEXT,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS passwordResets (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        requestedAt TEXT NOT NULL
      );
    `);
  }

  return db;
}

async function persistDatabase() {
  if (!db) return;
  const data = db.export();
  const sqlState = Buffer.from(data).toString('base64');
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify({ sqlState }, null, 2), 'utf8');
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
}

function verifyPassword(password, user) {
  if (!user || !user.passwordHash || !user.passwordSalt) {
    return false;
  }

  const { hash } = hashPassword(password, user.passwordSalt);
  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(hash, 'hex');

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}

function publicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt
  };
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let rawBody = '';

    req.on('data', (chunk) => {
      rawBody += chunk;

      if (rawBody.length > 1_000_000) {
        reject(new Error('Request body is too large.'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(new Error('Request body must be valid JSON.'));
      }
    });

    req.on('error', reject);
  });
}

function getStaticFilePath(pathname) {
  const safePath = pathname === '/' ? '/index.html' : pathname;
  const resolvedPath = path.normalize(path.join(ROOT_DIR, safePath));

  if (!resolvedPath.startsWith(ROOT_DIR)) {
    return null;
  }

  return resolvedPath;
}

async function serveStaticFile(res, pathname) {
  const filePath = getStaticFilePath(pathname);
  if (!filePath) {
    sendError(res, 403, 'Forbidden.');
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendError(res, 404, 'Not found.');
      return;
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': fileBuffer.length
    });
    res.end(fileBuffer);
  } catch (error) {
    sendError(res, 404, 'Not found.');
  }
}

async function handleAuthSignup(req, res) {
  const fullName = String(req.body.fullName || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!fullName || !email || !password) {
    sendError(res, 400, 'Full name, email, and password are required.');
    return;
  }

  try {
    const existing = db.exec('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      sendError(res, 409, 'An account with that email already exists.');
      return;
    }

    const id = crypto.randomUUID();
    const { salt, hash } = hashPassword(password);
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO users (id, fullName, email, passwordHash, passwordSalt, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [id, fullName, email, hash, salt, createdAt]
    );

    await persistDatabase();

    const user = publicUser({ id, fullName, email, createdAt });
    const token = signToken({ userId: id, email });

    sendJson(res, 201, {
      message: 'Account created successfully.',
      user,
      token
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Internal server error.');
  }
}

async function handleAuthLogin(req, res) {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    sendError(res, 400, 'Email and password are required.');
    return;
  }

  try {
    const result = db.exec('SELECT id, fullName, email, passwordHash, passwordSalt, createdAt FROM users WHERE email = ?', [email]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      sendError(res, 401, 'Invalid email or password.');
      return;
    }

    const row = result[0].values[0];
    const user = {
      id: row[0],
      fullName: row[1],
      email: row[2],
      passwordHash: row[3],
      passwordSalt: row[4],
      createdAt: row[5]
    };

    if (!verifyPassword(password, user)) {
      sendError(res, 401, 'Invalid email or password.');
      return;
    }

    const token = signToken({ userId: user.id, email: user.email });

    sendJson(res, 200, {
      message: 'Login successful.',
      user: publicUser(user),
      token
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Internal server error.');
  }
}

async function handleResetPassword(req, res) {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    sendError(res, 400, 'Email is required.');
    return;
  }

  try {
    const id = crypto.randomUUID();
    const requestedAt = new Date().toISOString();

    db.run(
      'INSERT INTO passwordResets (id, email, requestedAt) VALUES (?, ?, ?)',
      [id, email, requestedAt]
    );

    await persistDatabase();

    sendJson(res, 200, {
      message: 'If that email exists in Projexa, a reset link has been queued.'
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Internal server error.');
  }
}

async function handleGetProjects(req, res) {
  try {
    const result = db.exec('SELECT id, name, category, startDate, endDate, description, members, createdAt FROM projects ORDER BY createdAt DESC');
    
    const projects = [];
    if (result.length > 0) {
      result[0].values.forEach((row) => {
        projects.push({
          id: row[0],
          name: row[1],
          category: row[2],
          startDate: row[3],
          endDate: row[4],
          description: row[5],
          members: row[6] ? JSON.parse(row[6]) : [],
          createdAt: row[7]
        });
      });
    }

    sendJson(res, 200, { projects });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Internal server error.');
  }
}

async function handleCreateProject(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  const payload = verifyToken(token);

  if (!payload) {
    sendError(res, 401, 'Unauthorized. Please sign in first.');
    return;
  }

  const name = String(req.body.name || '').trim();
  const category = String(req.body.category || '').trim();
  const startDate = String(req.body.startDate || '').trim();
  const endDate = String(req.body.endDate || '').trim();
  const description = String(req.body.description || '').trim();
  const members = Array.isArray(req.body.members)
    ? req.body.members.map((member) => String(member || '').trim()).filter(Boolean)
    : [];

  if (!name) {
    sendError(res, 400, 'Project name is required.');
    return;
  }

  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    sendError(res, 400, 'End date must be after start date.');
    return;
  }

  try {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const membersJson = JSON.stringify(members);

    db.run(
      'INSERT INTO projects (id, name, category, startDate, endDate, description, members, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, startDate, endDate, description, membersJson, createdAt]
    );

    await persistDatabase();

    sendJson(res, 201, {
      message: 'Project saved successfully.',
      project: {
        id,
        name,
        category,
        startDate,
        endDate,
        description,
        members,
        createdAt
      }
    });
  } catch (error) {
    console.error(error);
    sendError(res, 500, 'Internal server error.');
  }
}

async function startServer() {
  console.log('Initializing database...');
  await initDatabase();
  console.log('Database ready.');

  const server = http.createServer(async (req, res) => {
    const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = requestUrl.pathname;

    try {
      if (req.method === 'GET' && pathname === '/api/health') {
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/projects') {
        await handleGetProjects(req, res);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/auth/signup') {
        req.body = await readRequestBody(req);
        await handleAuthSignup(req, res);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/auth/login') {
        req.body = await readRequestBody(req);
        await handleAuthLogin(req, res);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/auth/reset-password') {
        req.body = await readRequestBody(req);
        await handleResetPassword(req, res);
        return;
      }

      if (req.method === 'POST' && pathname === '/api/projects') {
        req.body = await readRequestBody(req);
        await handleCreateProject(req, res);
        return;
      }

      if (req.method === 'GET') {
        await serveStaticFile(res, pathname);
        return;
      }

      sendError(res, 404, 'Not found.');
    } catch (error) {
      console.error(error);
      sendError(res, 500, 'Internal server error.');
    }
  });

  server.listen(PORT, () => {
    console.log(`Projexa backend running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
