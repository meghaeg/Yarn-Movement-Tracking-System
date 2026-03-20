import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const items = await db
      .collection("activities")
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    const data = items.map((a: any) => ({ ...a, id: a._id.toString(), _id: undefined }));
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDb();
    const result = await db.collection("activities").insertOne({
      ...body,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, data: { id: result.insertedId.toString() } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
