const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB_NAME || 'inventory-management';

// Generate dates for the last 30 days
const generateRandomDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * days));
  return date.toISOString();
};

const initialOrders = [
  {
    productId: "68d96bb1ccbb137af12bc597", // iPhone 14 Pro
    productName: "iPhone 14 Pro",
    quantity: 3,
    unitPrice: 99900,
    totalAmount: 299700,
    status: "completed",
    timestamp: generateRandomDate(30),
    userId: "1",
  },
  {
    productId: "68d96bb1ccbb137af12bc598", // Samsung Galaxy S24
    productName: "Samsung Galaxy S24",
    quantity: 2,
    unitPrice: 89900,
    totalAmount: 179800,
    status: "completed",
    timestamp: generateRandomDate(30),
    userId: "1",
  },
  {
    productId: "68d96bb1ccbb137af12bc599", // MacBook Pro 16"
    productName: 'MacBook Pro 16"',
    quantity: 1,
    unitPrice: 249900,
    totalAmount: 249900,
    status: "completed",
    timestamp: generateRandomDate(30),
    userId: "2",
  },
  {
    productId: "68d96bb1ccbb137af12bc59a", // Nike Air Max
    productName: "Nike Air Max",
    quantity: 5,
    unitPrice: 12000,
    totalAmount: 60000,
    status: "pending",
    timestamp: generateRandomDate(7),
    userId: "1",
  },
  {
    productId: "68d96bb1ccbb137af12bc597", // iPhone 14 Pro
    productName: "iPhone 14 Pro",
    quantity: 2,
    unitPrice: 99900,
    totalAmount: 199800,
    status: "completed",
    timestamp: generateRandomDate(15),
    userId: "3",
  },
  {
    productId: "68d96bb1ccbb137af12bc598", // Samsung Galaxy S24
    productName: "Samsung Galaxy S24",
    quantity: 1,
    unitPrice: 89900,
    totalAmount: 89900,
    status: "completed",
    timestamp: generateRandomDate(20),
    userId: "2",
  },
  {
    productId: "68d96bb1ccbb137af12bc599", // MacBook Pro 16"
    productName: 'MacBook Pro 16"',
    quantity: 2,
    unitPrice: 249900,
    totalAmount: 499800,
    status: "completed",
    timestamp: generateRandomDate(10),
    userId: "1",
  },
  {
    productId: "68d96bb1ccbb137af12bc597", // iPhone 14 Pro
    productName: "iPhone 14 Pro",
    quantity: 1,
    unitPrice: 99900,
    totalAmount: 99900,
    status: "pending",
    timestamp: generateRandomDate(3),
    userId: "4",
  },
];

async function seedOrders() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const ordersCollection = db.collection('orders');
    
    // Clear existing orders
    await ordersCollection.deleteMany({});
    console.log('Cleared existing orders');
    
    // Insert initial orders
    const result = await ordersCollection.insertMany(initialOrders);
    console.log(`Inserted ${result.insertedCount} orders`);
    
    // Calculate statistics
    const totalOrders = await ordersCollection.countDocuments();
    const completedOrders = await ordersCollection.countDocuments({ status: "completed" });
    const pendingOrders = await ordersCollection.countDocuments({ status: "pending" });
    
    const revenueResult = await ordersCollection.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]).toArray();
    
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    
    console.log('\nOrder Statistics:');
    console.log(`- Total Orders: ${totalOrders}`);
    console.log(`- Completed Orders: ${completedOrders}`);
    console.log(`- Pending Orders: ${pendingOrders}`);
    console.log(`- Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
    
    // List recent orders
    const recentOrders = await ordersCollection.find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();
    
    console.log('\nRecent Orders:');
    recentOrders.forEach(order => {
      console.log(`- ${order.productName} x${order.quantity} - ₹${order.totalAmount.toLocaleString('en-IN')} (${order.status})`);
    });
    
  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

seedOrders();