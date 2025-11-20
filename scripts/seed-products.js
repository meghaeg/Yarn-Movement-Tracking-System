const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'inventory-management';

const initialProducts = [
  {
    name: "iPhone 14 Pro",
    sku: "IPH14PRO001",
    description: "Latest iPhone with advanced camera system",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 80000,
    sellingPrice: 99900,
    stock: 25,
    minStock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Samsung Galaxy S24",
    sku: "SAM24001",
    description: "Premium Android smartphone",
    categoryId: "1",
    supplierId: "2",
    purchasePrice: 70000,
    sellingPrice: 89900,
    stock: 5,
    minStock: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'MacBook Pro 16"',
    sku: "MBP16001",
    description: "Professional laptop for developers",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 200000,
    sellingPrice: 249900,
    stock: 8,
    minStock: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "Nike Air Max",
    sku: "NIKE001",
    description: "Comfortable running shoes",
    categoryId: "2",
    supplierId: "3",
    purchasePrice: 8000,
    sellingPrice: 12000,
    stock: 0,
    minStock: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seedProducts() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const productsCollection = db.collection('products');
    
    // Clear existing products
    await productsCollection.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert initial products
    const result = await productsCollection.insertMany(initialProducts);
    console.log(`Inserted ${result.insertedCount} products`);
    
    // List all products
    const products = await productsCollection.find({}).toArray();
    console.log('\nSeeded products:');
    products.forEach(product => {
      console.log(`- ${product.name} (${product.sku}): ${product.stock} in stock`);
    });
    
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

seedProducts();