const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'inventory-management';

const initialProducts = [
  {
    name: "2/10s kw",
    sku: "YRN-2-10S-KW",
    description: "2/10s count knitting wool yarn",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 450,
    sellingPrice: 550,
    stock: 500,
    minStock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "2/20s kw",
    sku: "YRN-2-20S-KW",
    description: "2/20s count knitting wool yarn",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 480,
    sellingPrice: 590,
    stock: 450,
    minStock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "2/6s kw",
    sku: "YRN-2-6S-KW",
    description: "2/6s count knitting wool yarn",
    categoryId: "1",
    supplierId: "1",
    purchasePrice: 420,
    sellingPrice: 520,
    stock: 600,
    minStock: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "2/32s VL",
    sku: "YRN-2-32S-VL",
    description: "2/32s count viscose yarn",
    categoryId: "2",
    supplierId: "2",
    purchasePrice: 520,
    sellingPrice: 640,
    stock: 350,
    minStock: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "2/36s recycle Yarns",
    sku: "YRN-2-36S-RCY",
    description: "2/36s count recycled yarn - eco-friendly sustainable option",
    categoryId: "1",
    supplierId: "3",
    purchasePrice: 380,
    sellingPrice: 490,
    stock: 400,
    minStock: 100,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    name: "2/20s recycle Yarns",
    sku: "YRN-2-20S-RCY",
    description: "2/20s count recycled yarn - eco-friendly sustainable option",
    categoryId: "1",
    supplierId: "3",
    purchasePrice: 360,
    sellingPrice: 470,
    stock: 550,
    minStock: 120,
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