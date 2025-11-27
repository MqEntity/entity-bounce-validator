import { NextResponse } from "next/server";
import { incrementUsage } from "@/app/lib/dbUsers";

export async function POST(req) {
    const { apiKey, increment } = await req.json();
    if (!apiKey || typeof increment !== "number" || increment < 1) {
        return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    const op = await incrementUsage(apiKey, increment);

    if (!op.matched) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, usage: op });
}
