import { NextResponse } from "next/server";
import { runSeed } from "@/back-end/services/seed";

export async function POST() {
	try {
		const result = await runSeed();
		return NextResponse.json(result);
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ ok: false, error: message }, { status: 500 });
	}
}


