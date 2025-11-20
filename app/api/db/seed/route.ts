import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST() {
	try {
		const db = await getDb();
		
		// Seed Categories
		if ((await db.collection("categories").estimatedDocumentCount()) === 0) {
			await db.collection("categories").insertMany([
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
		}
		
		// Seed Suppliers
		if ((await db.collection("suppliers").estimatedDocumentCount()) === 0) {
			await db.collection("suppliers").insertMany([
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
		}
		
		return NextResponse.json({ success: true, message: "Database seeded successfully" });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ success: false, error: message }, { status: 500 });
	}
}


