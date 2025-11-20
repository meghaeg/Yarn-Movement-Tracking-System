import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface UpdateProductData {
  name?: string;
  sku?: string;
  description?: string;
  categoryId?: string;
  supplierId?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stock?: number;
  minStock?: number;
  expiryDate?: string;
  image?: string;
}

export async function PUT(
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

    const body: UpdateProductData = await request.json();
    
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch the updated product
    const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(id) });
    
    const formattedProduct = updatedProduct ? {
      ...updatedProduct,
      id: updatedProduct._id.toString(),
      _id: undefined
    } : null;

    return NextResponse.json({ 
      success: true, 
      data: formattedProduct,
      message: "Product updated successfully"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating product:", message);
    return NextResponse.json(
      { success: false, error: "Failed to update product", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const db = await getDb();
    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Product deleted successfully"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting product:", message);
    return NextResponse.json(
      { success: false, error: "Failed to delete product", details: message },
      { status: 500 }
    );
  }
}