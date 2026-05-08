// JWT utility for Projexa
const jwt = require('jsonwebtoken');
const SECRET = process.env.PROJEXA_JWT_SECRET || 'projexa-dev-secret';
const EXPIRES_IN = '7d';

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verify(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { sign, verify };
