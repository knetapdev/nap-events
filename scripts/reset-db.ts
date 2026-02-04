import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/napevents';

async function resetDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get database
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error('Database connection not established');
    }

    console.log('\n⚠️  WARNING: This will delete ALL data from the database!');
    console.log('🔄 Dropping all collections...\n');

    // Get all collections
    const collections = await db.listCollections().toArray();

    // Drop each collection
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`✅ Dropped collection: ${collection.name}`);
    }

    console.log('\n✅ Database reset complete!');
    console.log('💡 Run "pnpm seed" to recreate the initial data.');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset error:', error);
    process.exit(1);
  }
}

resetDatabase();
