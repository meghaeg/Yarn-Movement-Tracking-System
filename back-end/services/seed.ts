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

	if ((await categories.estimatedDocumentCount()) === 0) {
		await categories.insertMany([
			{ name: "Beverages" },
			{ name: "Snacks" },
			{ name: "Stationery" },
		]);
	}

	const categoryDocs = await categories.find().toArray();
	const beveragesId = categoryDocs.find(c => c.name === "Beverages")?._id;
	const snacksId = categoryDocs.find(c => c.name === "Snacks")?._id;

	if ((await suppliers.estimatedDocumentCount()) === 0) {
		await suppliers.insertMany([
			{ name: "Acme Supplies", contactEmail: "sales@acme.test" },
			{ name: "Global Traders", contactEmail: "info@global.test" },
		]);
	}

	const supplierDocs = await suppliers.find().toArray();
	const acmeId = supplierDocs.find(s => s.name === "Acme Supplies")?._id;

	if ((await products.estimatedDocumentCount()) === 0) {
		await products.insertMany([
			{ name: "Cola 330ml", sku: "COLA-330", price: 1.25, stock: 120, categoryId: beveragesId, supplierId: acmeId },
			{ name: "Potato Chips 70g", sku: "CHIP-070", price: 0.99, stock: 80, categoryId: snacksId, supplierId: acmeId },
		]);
	}

	if ((await users.estimatedDocumentCount()) === 0) {
		await users.insertMany([
			{ name: "Admin User", email: "admin@example.com", role: "admin" },
			{ name: "Manager User", email: "manager@example.com", role: "manager" },
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


