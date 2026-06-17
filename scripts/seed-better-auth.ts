import { db } from '../lib/db';
import { user } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../lib/auth';

async function run() {
  try {
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@aditi.local';
    console.log('Deleting user if exists...');
    await db.delete(user).where(eq(user.email, email));
    
    console.log('Signing up with Better Auth...');
    const res = await auth.api.signUpEmail({
      body: {
        email,
        password: process.env.SEED_ADMIN_PASSWORD || 'change-me-123',
        name: process.env.SEED_ADMIN_NAME || 'Aditi Admin'
      }
    });
    console.log('Success:', res.user.id);
  } catch (err) {
    console.error('Error:', err);
  }
}

run();