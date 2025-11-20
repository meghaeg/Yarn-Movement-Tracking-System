import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface StockUpdateRequest {
  quantityChange: number;
  reason: string;
  userId?: string;
}

interface StockMovement {
  productId: string;
  productName: string;
  type: "add" | "remove";
  quantity: number;
  reason: string;
  timestamp: string;
  userId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body: StockUpdateRequest = await request.json();
    const { quantityChange, reason, userId = "1" } = body;

    if (!quantityChange || !reason) {
      return NextResponse.json(
        { success: false, error: "Quantity change and reason are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Get current product details
    const product = await db.collection("products").findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate new stock (ensure it doesn't go below 0)
    const currentStock = product.stock || 0;
    const newStock = Math.max(0, currentStock + quantityChange);

    // Update product stock
    const updateResult = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          stock: newStock,
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to update product stock" },
        { status: 500 }
      );
    }

    // Create stock movement record
    const stockMovement: StockMovement = {
      productId: id,
      productName: product.name,
      type: quantityChange > 0 ? "add" : "remove",
      quantity: Math.abs(quantityChange),
      reason,
      timestamp: new Date().toISOString(),
      userId,
    };

    // Save stock movement to database
    await db.collection("stockMovements").insertOne(stockMovement);

    // Get updated product
    const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(id) });
    
    const formattedProduct = updatedProduct ? {
      ...updatedProduct,
      id: updatedProduct._id.toString(),
      _id: undefined
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        product: formattedProduct,
        movement: {
          ...stockMovement,
          id: new ObjectId().toString()
        }
      },
      message: `Stock ${quantityChange > 0 ? 'increased' : 'decreased'} successfully`
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating stock:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update stock", details: message },
      { status: 500 }
    );
  }
}