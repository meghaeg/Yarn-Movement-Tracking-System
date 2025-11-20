import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface Order {
  _id?: ObjectId;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  timestamp: string;
  userId: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const orders = await db.collection("orders")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    
    // Convert ObjectId to string for frontend consumption
    const formattedOrders = orders.map(order => ({
      ...order,
      id: order._id.toString(),
      _id: undefined
    }));

    return NextResponse.json({ success: true, data: formattedOrders });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching orders:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const orderData: Omit<Order, "_id"> = {
      ...body,
      timestamp: new Date().toISOString(),
    };

    const db = await getDb();
    const result = await db.collection("orders").insertOne(orderData);

    const newOrder = {
      ...orderData,
      id: result.insertedId.toString(),
    };

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating order:", message);
    return NextResponse.json(
      { success: false, error: "Failed to create order", details: message },
      { status: 500 }
    );
  }
}