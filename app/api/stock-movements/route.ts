import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const stockMovements = await db.collection("stockMovements")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    
    // Convert ObjectId to string for frontend consumption
    const formattedMovements = stockMovements.map(movement => ({
      ...movement,
      id: movement._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, data: formattedMovements });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching stock movements:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock movements", details: message },
      { status: 500 }
    );
  }
}