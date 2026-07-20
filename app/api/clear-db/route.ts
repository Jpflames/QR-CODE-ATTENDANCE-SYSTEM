import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dummy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    // Clear Better Auth collections
    await db.collection("user").deleteMany({});
    await db.collection("session").deleteMany({});
    await db.collection("account").deleteMany({});

    // Clear Mongoose collections
    await db.collection("students").deleteMany({});
    await db.collection("lecturers").deleteMany({});
    await db.collection("auditlogs").deleteMany({});
    await db.collection("institutions").deleteMany({});
    await db.collection("departments").deleteMany({});
    await db.collection("programmes").deleteMany({});
    await db.collection("courses").deleteMany({});
    await db.collection("courseregistrations").deleteMany({});
    await db.collection("lecturesessions").deleteMany({});
    await db.collection("attendances").deleteMany({});

    return NextResponse.json({
      message: "Database completely cleared! You can now register a fresh account.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
