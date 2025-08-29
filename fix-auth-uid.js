import prisma from './lib/prisma.js';

async function fixAuthUID() {
  try {
    // Update the auth_uid for arsemateferi79@gmail.com to match current Supabase user ID
    const result = await prisma.user.update({
      where: { email: 'arsemateferi79@gmail.com' },
      data: { auth_uid: '9a98cab2-28dc-4ce8-8d6b-ca2c5e391e6c' }
    });
    
    console.log('✅ Updated user auth_uid:');
    console.log(`Email: ${result.email}`);
    console.log(`New Auth UID: ${result.auth_uid}`);
    
  } catch (error) {
    console.error('❌ Error updating auth_uid:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAuthUID();
