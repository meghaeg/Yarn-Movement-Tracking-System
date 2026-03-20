import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface DbUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "manager";
  unit?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection<DbUser>("users");

    // Seed a default admin if none exists
    const adminExisting = await users.findOne({ role: "admin" });
    if (!adminExisting) {
      await users.insertOne({
        name: "Admin",
        email: "admin@example.com",
        password: "123",
        role: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const user = await users.findOne({ email });
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const safeUser = {
      id: user._id?.toString() || "",
      email: user.email,
      name: user.name,
      role: user.role,
      unit: user.unit,
    };

    return NextResponse.json({ user: safeUser });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
