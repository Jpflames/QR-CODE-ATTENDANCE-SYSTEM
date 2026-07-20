import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dummy";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Attempt to use the database provided in the connection string, or default
    const db = client.db(); 
    
    // Fetch all users from Better Auth's user collection
    const users = await db.collection("user").find({}).toArray();
    
    // Fetch all students from Mongoose collection
    const students = await db.collection("students").find({}).toArray();

    // Mask passwords for safety
    const safeUsers = users.map(u => ({
      ...u,
      password: u.password ? "[REDACTED]" : undefined,
    }));

    return NextResponse.json({
      message: "Debug data retrieved",
      userCount: users.length,
      studentCount: students.length,
      users: safeUsers,
      students,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
