// Quick database connection test
const { PrismaClient } = require('./generated/prisma')

async function testDatabaseConnection() {
  console.log('🔍 Testing current database connection...')
  
  const prisma = new PrismaClient({
    log: ['error']
  })
  
  try {
    console.log('Attempting to connect...')
    await prisma.$connect()
    console.log('✅ Connected successfully!')
    
    console.log('Testing basic query...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query successful:', result)
    
    console.log('Checking tables...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log(`✅ Found ${tables.length} tables in database`)
    
    console.log('Testing songs table...')
    const songCount = await prisma.song.count()
    console.log(`✅ Songs table has ${songCount} records`)
    
    console.log('\n🎉 Database connection is working!')
    console.log('Your songs API should now work without authentication.')
    
  } catch (error) {
    console.log('❌ Database connection failed:')
    console.log('Error:', error.message)
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 This usually means:')
      console.log('1. Your Supabase project is paused (most common)')
      console.log('2. Incorrect database credentials')
      console.log('3. Network connectivity issues')
      console.log('\n🔧 To fix:')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Find your project and check if it\'s paused')
      console.log('3. If paused, click "Resume"')
      console.log('4. Get fresh connection string from Settings → Database')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()
