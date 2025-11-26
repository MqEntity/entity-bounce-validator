import { NextResponse } from "next/server";
import { EntityValidator } from "@/app/lib/EntityValidator";

export async function POST(req) {
    try {
        const { email } = await req.json();
        const result = await EntityValidator(email);
        return NextResponse.json(result);
    } catch (err) {
        return NextResponse.json(
            { error: "Processing failure", detail: err.message },
            { status: 500 }
        );
    }
}
