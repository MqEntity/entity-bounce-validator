import clientPromise from "./mongodb";

export async function getUser(apiKey) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const user = await db.collection("EntityInfo").findOne({ apiKey });

    if (!user) return null;

    const now = new Date();
    if (now.toDateString() !== new Date(user.lastUsageReset).toDateString()) {
        await db.collection("EntityInfo").updateOne(
            { apiKey },
            { $set: { dailyUsage: 0, lastUsageReset: now } }
        );
        user.dailyUsage = 0;
        user.lastUsageReset = now;
    }

    return user;
}

export async function incrementUsage(apiKey, count = 1) {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Atomically increment dailyUsage only if it won't exceed dailyEmailLimit
    const result = await db.collection("EntityInfo").findOneAndUpdate(
        {
            apiKey,
            $expr: {
                $lt: ["$dailyUsage", "$dailyEmailLimit"]
            }
        },
        [
            {
                $set: {
                    dailyUsage: {
                        $cond: [
                            { $lt: [{ $add: ["$dailyUsage", count] }, "$dailyEmailLimit"] },
                            { $add: ["$dailyUsage", count] },
                            "$dailyEmailLimit"
                        ]
                    }
                }
            }
        ],
        {
            returnDocument: "after"
        }
    );

    if (!result.value) {
        const user = await db.collection("EntityInfo").findOne({ apiKey });
        if (!user) return { matched: false, modified: false };
        return {
            matched: true,
            modified: false,
            capped: true,
            dailyUsage: user.dailyUsage,
            remainingQuota: user.dailyEmailLimit - user.dailyUsage,
        };
    }

    const user = result.value;
    const capped = user.dailyUsage >= user.dailyEmailLimit;

    return {
        matched: true,
        modified: true,
        capped,
        dailyUsage: user.dailyUsage,
        remainingQuota: user.dailyEmailLimit - user.dailyUsage,
    };
}
