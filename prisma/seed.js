const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log("⚡ Starting database seeding (Prisma + Supabase)...");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("⚠️ Warning: SUPABASE_SERVICE_ROLE_KEY is not set. Seeding might fail due to rate limits or email restrictions.");
  }

  try {
    // 1. Seed Feature Flags
    console.log("Seeding default feature flags...");
    await prisma.featureFlag.upsert({
      where: { key: 'loan_module' },
      update: { enabled: true },
      create: { key: 'loan_module', enabled: true },
    });
    await prisma.featureFlag.upsert({
      where: { key: 'user_management' },
      update: { enabled: true },
      create: { key: 'user_management', enabled: true },
    });

    // 2. Seed Role Permissions
    console.log("Seeding default role permissions...");
    const rolePermissions = [
      { role: 'peminjam', permission: 'loan:apply' },
      { role: 'peminjam', permission: 'loan:view_own' },
      { role: 'operator', permission: 'loan:apply' },
      { role: 'operator', permission: 'loan:view_own' },
      { role: 'operator', permission: 'loan:view_all' },
      { role: 'operator', permission: 'loan:review' },
    ];

    for (const rp of rolePermissions) {
      const exists = await prisma.rolePermission.findFirst({
        where: { role: rp.role, permission: rp.permission }
      });
      if (!exists) {
        await prisma.rolePermission.create({ data: rp });
      }
    }

    // 3. Seed Default Users via Supabase Auth
    console.log("Seeding default users via Supabase API...");
    const defaultUsers = [
      { name: 'Super User', email: 'superuser@example.com', role: 'superuser' },
      { name: 'Operator User', email: 'operator@example.com', role: 'operator' },
      { name: 'Peminjam User', email: 'peminjam@example.com', role: 'peminjam' },
    ];

    const password = 'Password123!';

    for (const u of defaultUsers) {
      const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
      let userId = existingUser?.id;

      if (!existingUser) {
        let data, error;

        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.log(`Creating user via Admin API: ${u.email}...`);
          const res = await supabase.auth.admin.createUser({
            email: u.email,
            password: password,
            email_confirm: true,
            user_metadata: { name: u.name, role: u.role }
          });
          data = res.data;
          error = res.error;
        } else {
          console.log(`Creating user via Public API: ${u.email}...`);
          const res = await supabase.auth.signUp({
            email: u.email,
            password: password,
            options: {
              data: { name: u.name, role: u.role }
            }
          });
          data = res.data;
          error = res.error;
        }

        if (error) {
          console.error(`❌ Error registering ${u.email}:`, error.message);
        } else if (data.user) {
          userId = data.user.id;
          console.log(`✅ Registered user ${u.email} via API.`);
          
          await prisma.user.upsert({
            where: { email: u.email },
            update: { id: userId, name: u.name, role: u.role },
            create: { id: userId, email: u.email, name: u.name, role: u.role }
          });
        }
      } else {
        console.log(`User already exists: ${u.email}`);
        
        // Ensure role is correct
        if (existingUser.role !== u.role) {
          await prisma.user.update({
            where: { email: u.email },
            data: { role: u.role }
          });
          console.log(`Updated role for ${u.email} to '${u.role}'`);
        }
      }
    }

    console.log("\n🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
