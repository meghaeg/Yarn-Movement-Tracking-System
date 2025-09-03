import { NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function GET() {
	try {
		const client = await getMongoClient();
		await client.db().admin().ping();
		return NextResponse.json({ ok: true });
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}


