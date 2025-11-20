const { MongoClient } = require('mongodb');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-system';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();

    // Seed Categories
    const categoriesCount = await db.collection('categories').estimatedDocumentCount();
    if (categoriesCount === 0) {
      await db.collection('categories').insertMany([
        {
          name: "Electronics",
          description: "Electronic devices and components",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Clothing",
          description: "Apparel and fashion items",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Food & Beverages",
          description: "Food items and drinks",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Books & Stationery",
          description: "Books, office supplies, and stationery",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Home & Garden",
          description: "Home improvement and gardening supplies",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
      console.log('Categories seeded');
    }

    // Seed Suppliers
    const suppliersCount = await db.collection('suppliers').estimatedDocumentCount();
    if (suppliersCount === 0) {
      await db.collection('suppliers').insertMany([
        {
          name: "TechCorp Solutions",
          email: "sales@techcorp.com",
          phone: "+1-555-0123",
          address: "123 Tech Avenue, Silicon Valley, CA 94025",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Global Fashion Ltd",
          email: "orders@globalfashion.com",
          phone: "+1-555-0456",
          address: "456 Fashion Street, New York, NY 10001",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "Fresh Foods Inc",
          email: "supply@freshfoods.com",
          phone: "+1-555-0789",
          address: "789 Market Square, Chicago, IL 60601",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "BookWorld Distributors",
          email: "wholesale@bookworld.com",
          phone: "+1-555-0321",
          address: "321 Library Lane, Boston, MA 02108",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          name: "HomeStyle Suppliers",
          email: "info@homestylesuppliers.com",
          phone: "+1-555-0654",
          address: "654 Home Boulevard, Denver, CO 80202",
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