import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Student } from "@/models/Student";
import { Lecturer } from "@/models/Lecturer";

export async function GET() {
  try {
    await connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 });
    
    // Transform into a unified format for the admin table
    const formattedUsers = await Promise.all(users.map(async (u) => {
      let identifier = "N/A";
      
      if (u.role === "student") {
        const student = await Student.findOne({ userId: u._id });
        identifier = student?.matricNumber || "Pending Setup";
      } else if (u.role === "lecturer") {
        const lecturer = await Lecturer.findOne({ userId: u._id });
        identifier = lecturer?.staffId || "Pending Setup";
      }

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || "active",
        identifier,
        createdAt: u.createdAt,
      };
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}
