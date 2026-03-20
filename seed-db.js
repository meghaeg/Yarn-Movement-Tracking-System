const { MongoClient } = require('mongodb');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-system';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();

    // Seed Categories - Textile Focused
    const categoriesCount = await db.collection('categories').estimatedDocumentCount();
    if (categoriesCount === 0) {
      await db.collection('categories').insertMany([
        {
          name: "Cotton Threads",
          description: "Natural cotton threads for various textile applications",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Polyester Threads",
          description: "Synthetic polyester threads for durability and strength",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Silk Threads",
          description: "Premium silk threads for luxury textiles",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Nylon Threads",
          description: "Strong nylon threads for industrial applications",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Fabrics",
          description: "Various fabric materials and textiles",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Accessories",
          description: "Buttons, zippers, and other textile accessories",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      console.log('Categories seeded');
    }

    // Seed Suppliers - Textile Industry
    const suppliersCount = await db.collection('suppliers').estimatedDocumentCount();
    if (suppliersCount === 0) {
      await db.collection('suppliers').insertMany([
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
      ]);
      console.log('Suppliers seeded');
    }

    console.log('Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();