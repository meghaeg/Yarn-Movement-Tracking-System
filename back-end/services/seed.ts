import { getDb } from "@/database/mongodb";

export async function runSeed() {
	const db = await getDb();
	const categories = db.collection("categories");
	const products = db.collection("products");
	const suppliers = db.collection("suppliers");
	const users = db.collection("users");
	const orders = db.collection("orders");
	const stock = db.collection("stock_movements");
	const settings = db.collection("settings");

	// Seed Textile Categories
	if ((await categories.estimatedDocumentCount()) === 0) {
		await categories.insertMany([
			{ name: "Cotton Threads", description: "Natural cotton threads for various textile applications" },
			{ name: "Polyester Threads", description: "Synthetic polyester threads for durability and strength" },
			{ name: "Silk Threads", description: "Premium silk threads for luxury textiles" },
			{ name: "Nylon Threads", description: "Strong nylon threads for industrial applications" },
			{ name: "Fabrics", description: "Various fabric materials and textiles" },
			{ name: "Accessories", description: "Buttons, zippers, and other textile accessories" },
		]);
	}

	const categoryDocs = await categories.find().toArray();
	const cottonThreadsId = categoryDocs.find(c => c.name === "Cotton Threads")?._id;
	const polyesterThreadsId = categoryDocs.find(c => c.name === "Polyester Threads")?._id;
	const fabricsId = categoryDocs.find(c => c.name === "Fabrics")?._id;

	// Seed Textile Suppliers
	if ((await suppliers.estimatedDocumentCount()) === 0) {
		await suppliers.insertMany([
			{ name: "Premium Thread Mills", contactEmail: "sales@premiumthreads.com", phone: "+91-9876543210", address: "Coimbatore, Tamil Nadu" },
			{ name: "Global Textiles Ltd", contactEmail: "orders@globaltextiles.com", phone: "+91-9876543211", address: "Tirupur, Tamil Nadu" },
			{ name: "Indian Cotton Suppliers", contactEmail: "supply@indiancotton.com", phone: "+91-9876543212", address: "Erode, Tamil Nadu" },
		]);
	}

	const supplierDocs = await suppliers.find().toArray();
	const premiumThreadsId = supplierDocs.find(s => s.name === "Premium Thread Mills")?._id;
	const globalTextilesId = supplierDocs.find(s => s.name === "Global Textiles Ltd")?._id;

	// Seed Textile Products
	if ((await products.estimatedDocumentCount()) === 0) {
		await products.insertMany([
			{
				name: "Cotton Thread 40s",
				sku: "CTN-40S-001",
				price: 85,
				stock: 500,
				categoryId: cottonThreadsId,
				supplierId: premiumThreadsId,
				description: "High quality 40s count cotton thread, perfect for garment stitching",
				quality: "A Grade",
				count: "40s",
				color: "White"
			},
			{
				name: "Polyester Thread 36s",
				sku: "PLY-36S-002",
				price: 65,
				stock: 350,
				categoryId: polyesterThreadsId,
				supplierId: globalTextilesId,
				description: "Durable 36s polyester thread for industrial use",
				quality: "Premium",
				count: "36s",
				color: "Black"
			},
			{
				name: "Cotton Fabric - Plain",
				sku: "FAB-CTN-003",
				price: 120,
				stock: 200,
				categoryId: fabricsId,
				supplierId: premiumThreadsId,
				description: "100% cotton plain fabric, 60 inches width",
				quality: "Export Quality",
				width: "60 inches",
				gsm: "150"
			},
		]);
	}

	// Seed Users (Admin and Staff only)
	if ((await users.estimatedDocumentCount()) === 0) {
		await users.insertMany([
			{ name: "Admin User", email: "admin@example.com", role: "admin" },
			{ name: "Staff User", email: "staff@example.com", role: "staff" },
		]);
	}

	if ((await orders.estimatedDocumentCount()) === 0) {
		const prodDocs = await products.find().toArray();
		const cola = prodDocs.find(p => p.sku === "COLA-330");
		await orders.insertOne({
			orderNumber: "ORD-1001",
			date: new Date(),
			status: "pending",
			items: cola ? [{ productId: cola._id, qty: 2, price: cola.price }] : [],
			total: cola ? cola.price * 2 : 0,
		});
	}

	if ((await stock.estimatedDocumentCount()) === 0) {
		const prodDocs = await products.find().toArray();
		const cola = prodDocs.find(p => p.sku === "COLA-330");
		if (cola) {
			await stock.insertOne({ productId: cola._id, change: 50, reason: "initial", at: new Date() });
		}
	}

	if ((await settings.estimatedDocumentCount()) === 0) {
		await settings.insertOne({ currency: "USD", lowStockThreshold: 10 });
	}

	return { ok: true, db: db.databaseName } as const;
}


