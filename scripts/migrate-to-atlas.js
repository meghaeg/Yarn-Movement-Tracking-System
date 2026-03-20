const { MongoClient } = require('mongodb');

// Local MongoDB connection
const localUri = 'mongodb://127.0.0.1:27017';
const localDbName = 'inventory-management';

// Atlas MongoDB connection
const atlasUri = 'mongodb+srv://meghaeg27_db_user:megha2227@cluster0.hz2o1hb.mongodb.net/?appName=Cluster0';
const atlasDbName = 'Inventry-1credit';

async function migrateData() {
  const localClient = new MongoClient(localUri);
  const atlasClient = new MongoClient(atlasUri);

  try {
    console.log('Connecting to local MongoDB...');
    await localClient.connect();
    const localDb = localClient.db(localDbName);

    console.log('Connecting to Atlas MongoDB...');
    await atlasClient.connect();
    const atlasDb = atlasClient.db(atlasDbName);

    // Get all collections from local database
    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate`);

    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`Migrating collection: ${collectionName}`);

      // Get all documents from local collection
      const localCollection = localDb.collection(collectionName);
      const documents = await localCollection.find({}).toArray();

      if (documents.length > 0) {
        // Insert into Atlas collection
        const atlasCollection = atlasDb.collection(collectionName);
        
        // Clear existing data in Atlas collection
        await atlasCollection.deleteMany({});
        
        // Insert all documents
        const result = await atlasCollection.insertMany(documents);
        console.log(`  Migrated ${result.insertedCount} documents from ${collectionName}`);
      } else {
        console.log(`  No documents found in ${collectionName}`);
      }
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrateData();
