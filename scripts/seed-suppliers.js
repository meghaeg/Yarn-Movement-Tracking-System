const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'inventory-management';

const suppliers = [
    {
        name: "K.S. Kumaran Spinning Mills",
        email: "sales@kskumaran.com",
        phone: "+91-9876543210",
        address: "Industrial Estate, Coimbatore, Tamil Nadu 641001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        name: "Elackiya Exports",
        email: "contact@elackiyaexports.com",
        phone: "+91-9876543211",
        address: "Export Zone, Tirupur, Tamil Nadu 641604",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        name: "Sakthi Yarns Manufacturing",
        email: "info@sakthiyarns.com",
        phone: "+91-9876543212",
        address: "Textile Park, Erode, Tamil Nadu 638001",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        name: "Patteeswara Threads",
        email: "sales@patteeswarathreads.com",
        phone: "+91-9876543213",
        address: "Thread Lane, Karur, Tamil Nadu 639002",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

async function seedSuppliers() {
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const suppliersCollection = db.collection('suppliers');

        // Clear existing suppliers
        await suppliersCollection.deleteMany({});
        console.log('Cleared existing suppliers');

        // Insert new suppliers
        const result = await suppliersCollection.insertMany(suppliers);
        console.log(`Inserted ${result.insertedCount} suppliers`);

        // List all suppliers
        const allSuppliers = await suppliersCollection.find({}).toArray();
        console.log('\nSeeded suppliers:');
        allSuppliers.forEach(supplier => {
            console.log(`- ${supplier.name} (${supplier.email})`);
        });

    } catch (error) {
        console.error('Error seeding suppliers:', error);
    } finally {
        await client.close();
        console.log('\nDatabase connection closed');
    }
}

seedSuppliers();
