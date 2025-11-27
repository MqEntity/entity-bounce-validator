import { NextResponse } from "next/server";
import { getUser } from "@/app/lib/dbUsers";

export async function POST(req) {
    const { apiKey } = await req.json();
    const user = await getUser(apiKey);

    if (!user) return NextResponse.json({ error: "Apikey is invalid!" }, { status: 404 });

    return NextResponse.json({
        _id: user._id,
        name: user.name,
        apiKey: user.apiKey,
        maxWorkers: user.maxWorkers,
        dailyEmailLimit: user.dailyEmailLimit,
        dailyUsage: user.dailyUsage,
        remainingQuota: user.dailyEmailLimit - user.dailyUsage,
    });
}
