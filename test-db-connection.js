const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function testDatabaseConnection() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME || 'inventory-management';
    
    console.log('🔍 Testing MongoDB Connection...');
    console.log('URI:', uri);
    console.log('Database Name:', dbName);
    console.log('==========================================');
    
    if (!uri) {
        console.error('❌ MONGODB_URI is not set in environment variables');
        return;
    }
    
    let client;
    
    try {
        // Test basic connection
        console.log('📡 Connecting to MongoDB...');
        client = new MongoClient(uri);
        await client.connect();
        console.log('✅ Connected to MongoDB successfully!');
        
        // Test database ping
        console.log('🏓 Testing database ping...');
        await client.db(dbName).admin().ping();
        console.log('✅ Database ping successful!');
        
        // Get database info
        console.log('📊 Getting database information...');
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        
        console.log(`✅ Database "${dbName}" accessed successfully!`);
        console.log(`📋 Found ${collections.length} collections:`);
        
        if (collections.length > 0) {
            collections.forEach((collection, index) => {
                console.log(`   ${index + 1}. ${collection.name}`);
            });
        } else {
            console.log('   (No collections found - this is normal for a new database)');
        }
        
        // Test collection operations
        console.log('🧪 Testing collection operations...');
        const testCollection = db.collection('connection_test');
        
        // Insert test document
        const testDoc = { 
            test: true, 
            timestamp: new Date(),
            message: 'Database connection test successful'
        };
        
        const insertResult = await testCollection.insertOne(testDoc);
        console.log('✅ Test document inserted with ID:', insertResult.insertedId);
        
        // Read test document
        const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
        console.log('✅ Test document retrieved successfully');
        
        // Clean up test document
        await testCollection.deleteOne({ _id: insertResult.insertedId });
        console.log('✅ Test document cleaned up');
        
        console.log('==========================================');
        console.log('🎉 ALL DATABASE TESTS PASSED!');
        console.log('✅ Your MongoDB connection is working perfectly!');
        
    } catch (error) {
        console.error('==========================================');
        console.error('❌ DATABASE CONNECTION FAILED!');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('');
            console.error('🔧 TROUBLESHOOTING TIPS:');
            console.error('1. Make sure MongoDB is running on your system');
            console.error('2. Check if MongoDB Compass is connected');
            console.error('3. Verify MongoDB is running on port 27017');
            console.error('4. Try starting MongoDB service:');
            console.error('   Windows: net start mongodb');
            console.error('   Or check MongoDB Compass connection status');
        }
        
    } finally {
        if (client) {
            await client.close();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run the test
testDatabaseConnection();