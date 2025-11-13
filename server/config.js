// server/config.js
const path = require('path');
const dotenv = require('dotenv');

// ensure we load the project root .env (server is in server/)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Basic sanity check and normalized config object
const cfg = {
  PG: {
    user: process.env.PG_USER || '',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'edubridge_db',
    password: process.env.PG_PASSWORD || '',
    port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432
  },
  JWT: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    exp: process.env.JWT_EXP || '8h'
  },
  SERVER: {
    port: process.env.PORT ? Number(process.env.PORT) : 5000
  }
};

// optional debug: enable by setting DEBUG_CFG=1 in .env
if (process.env.DEBUG_CFG === '1') {
  console.log('DBG: loaded config ->', JSON.stringify({
    PG_HOST: cfg.PG.host,
    PG_USER: cfg.PG.user,
    PG_DATABASE: cfg.PG.database,
    PG_PORT: cfg.PG.port,
    PG_PASSWORD_type: typeof cfg.PG.password,
  }));
}

module.exports = cfg;
