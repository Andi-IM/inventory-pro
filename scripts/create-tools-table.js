const fs = require('fs');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');

// Load .env.local manually if run directly without env loader
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

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ Error: DATABASE_URL is not set in environment or .env.local");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

async function migrate() {
  console.log("⚡ Starting database migration for tools table...");

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.tools (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(50) DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("✅ Tools table created successfully!");
  } catch (error) {
    console.error("❌ Migration failed with error:", error);
  } finally {
    await pool.end();
  }
}

migrate();
