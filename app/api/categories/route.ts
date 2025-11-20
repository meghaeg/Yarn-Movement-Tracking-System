import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Category {
  _id?: ObjectId;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db.collection("categories")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Convert ObjectId to string for frontend consumption
    const formattedCategories = categories.map(category => ({
      ...category,
      id: category._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, data: formattedCategories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching categories:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const categoryData: Omit<Category, "_id"> = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection("categories").insertOne(categoryData);

    const newCategory = {
      ...categoryData,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating category:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create category", details: message },
      { status: 500 }
    );
  }
}