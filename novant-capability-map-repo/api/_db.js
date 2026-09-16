const { neon } = require('@neondatabase/serverless');

let sqlClient;

// Lazily creates the Neon HTTP client. DATABASE_URL is set as a Vercel
// environment variable pointing at the Neon connection string.
function getSql() {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

// Vercel's Node.js functions parse JSON bodies for you when the
// Content-Type header is application/json, but this guards against
// the rare case where req.body arrives as a raw string.
function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      return {};
    }
  }
  return req.body;
}

module.exports = { getSql, parseBody };
