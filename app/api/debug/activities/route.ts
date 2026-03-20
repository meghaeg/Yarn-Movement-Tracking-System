import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
    try {
        const db = await getDb();
        const items = await db.collection("activities").find({}).toArray();
        return NextResponse.json({ count: items.length, items });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
