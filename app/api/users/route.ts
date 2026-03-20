import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface DbUser {
  _id?: ObjectId;
  name: string;
  email: string; // used as username too
  password: string;
  role: "admin" | "manager";
  unit?: string; // e.g., UNIT1, UNIT2, UNIT3
  createdAt?: string;
  updatedAt?: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const users = await db.collection<DbUser>("users").find({}).sort({ createdAt: -1 }).toArray();
    const safe = users.map((u) => ({
      id: u._id?.toString() || "",
      name: u.name,
      email: u.email,
      role: u.role,
      unit: u.unit,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    return NextResponse.json({ success: true, data: safe });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, unit } = body as Partial<DbUser>;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    if (role === "manager" && !unit) {
      return NextResponse.json({ success: false, error: "Manager must have a unit" }, { status: 400 });
    }

    const db = await getDb();

    const existing = await db.collection<DbUser>("users").findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, error: "User already exists" }, { status: 409 });
    }

    const toInsert: DbUser = {
      name,
      email,
      password,
      role: role as "admin" | "manager", // Validated by Typescript, but runtime check above ensures role (ish)
      unit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection<DbUser>("users").insertOne(toInsert);

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        name: toInsert.name,
        email: toInsert.email,
        role: toInsert.role,
        unit: toInsert.unit,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
