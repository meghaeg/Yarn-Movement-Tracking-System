import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Supplier {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const suppliers = await db.collection("suppliers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Convert ObjectId to string for frontend consumption
    const formattedSuppliers = suppliers.map(supplier => ({
      ...supplier,
      id: supplier._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, data: formattedSuppliers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching suppliers:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const supplierData: Omit<Supplier, "_id"> = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection("suppliers").insertOne(supplierData);

    const newSupplier = {
      ...supplierData,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ success: true, data: newSupplier }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating supplier:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create supplier", details: message },
      { status: 500 }
    );
  }
}