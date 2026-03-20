import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
    try {
        const db = await getDb();

        // Strictly maintain exactly 3 units: UNIT1, UNIT2, UNIT3
        let units = await db.collection("units").find({}).toArray();

        if (units.length !== 3) {
            // If count is wrong, reset to fresh state
            await db.collection("units").deleteMany({});
            const initialUnits = [
                { name: "Ready", supplier: "-", weight: 0, grade: "-", unit: "UNIT1", status: "stopped" },
                { name: "Ready", supplier: "-", weight: 0, grade: "-", unit: "UNIT2", status: "stopped" },
                { name: "Ready", supplier: "-", weight: 0, grade: "-", unit: "UNIT3", status: "stopped" }
            ];
            await db.collection("units").insertMany(initialUnits);
            units = await db.collection("units").find({}).toArray();
        }

        return NextResponse.json({
            success: true,
            data: units.map(u => ({ ...u, id: u._id.toString(), _id: undefined }))
        });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: "Failed to fetch units" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;
        const db = await getDb();

        await db.collection("units").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        return NextResponse.json({ success: false, error: "Failed to update unit" }, { status: 500 });
    }
}
