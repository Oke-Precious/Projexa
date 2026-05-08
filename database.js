// SQLite database setup for Projexa
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, 'backend', 'projexa.sqlite');
const db = new Database(DB_PATH);

// Create tables if not exist
// Users
// Projects
// PasswordResets

db.exec(`
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

module.exports = db;
