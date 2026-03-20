const { MongoClient } = require('mongodb');

// Atlas MongoDB connection
const atlasUri = 'mongodb+srv://meghaeg27_db_user:megha2227@cluster0.hz2o1hb.mongodb.net/?appName=Cluster0';
const atlasDbName = 'Inventry-1credit';

async function testAtlasConnection() {
  const atlasClient = new MongoClient(atlasUri);

  try {
    console.log('Testing Atlas connection...');
    await atlasClient.connect();
    const atlasDb = atlasClient.db(atlasDbName);

    // Test connection and count documents
    const collections = await atlasDb.listCollections().toArray();
    console.log(`Connected to Atlas! Found ${collections.length} collections:`);

    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await atlasDb.collection(collectionName).countDocuments();
      console.log(`  ${collectionName}: ${count} documents`);
    }

    console.log('Atlas connection test successful!');
  } catch (error) {
    console.error('Atlas connection test failed:', error);
  } finally {
    await atlasClient.close();
  }
}

testAtlasConnection();
