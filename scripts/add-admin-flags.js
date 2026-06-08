const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await pool.query(`
    INSERT INTO public.feature_flags (key, enabled) VALUES 
    ('user_management', true),
    ('role_management', true),
    ('flag_management', true)
    ON CONFLICT (key) DO NOTHING;
  `);
  console.log('Feature flags added');
  await pool.end();
}
run();
