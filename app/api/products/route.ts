import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Product {
  _id?: ObjectId;
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  supplierId: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const products = await db.collection("products").find({}).toArray();
    
    // Convert ObjectId to string for frontend consumption
    const formattedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching products:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const productData: Omit<Product, "_id"> = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection("products").insertOne(productData);

    const newProduct = {
      ...productData,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating product:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create product", details: message },
      { status: 500 }
    );
  }
}