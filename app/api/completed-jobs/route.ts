import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
    try {
        const db = await getDb();
        const jobs = await db.collection("completed_jobs").find({}).sort({ timestamp: -1 }).toArray();
        return NextResponse.json({ success: true, data: jobs.map(j => ({ ...j, id: j._id.toString(), _id: undefined })) });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: "Failed to fetch completed jobs" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const jobData = await request.json();
        const db = await getDb();
        const result = await db.collection("completed_jobs").insertOne({
            ...jobData,
            timestamp: new Date().toISOString()
        });
        return NextResponse.json({ success: true, data: { ...jobData, id: result.insertedId.toString() } });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: "Failed to save completed job" }, { status: 500 });
    }
}
