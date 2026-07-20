import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Student } from "@/models/Student";
import { Course } from "@/models/Course";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ userId });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Fetch all courses that match the student's department and level
    // We optionally match by level, or just return all departmental courses
    const query: any = { departmentId: student.departmentId };
    if (student.currentLevel) {
      query.level = student.currentLevel;
    }

    const availableCourses = await Course.find(query).select("_id name code creditUnits level semester");
    
    return NextResponse.json({
      registeredCourses: student.registeredCourses || [],
      availableCourses
    });
  } catch (error: any) {
    console.error("Fetch student courses API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, courseIds } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    
    if (!Array.isArray(courseIds)) {
      return NextResponse.json({ error: "courseIds must be an array" }, { status: 400 });
    }

    await connectToDatabase();

    const student = await Student.findOne({ userId });
    
    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    student.registeredCourses = courseIds;
    await student.save();

    return NextResponse.json({ success: true, message: "Courses registered successfully" });
  } catch (error: any) {
    console.error("Register student courses API error:", error);
    return NextResponse.json({ error: error.message || "Failed to register courses" }, { status: 500 });
  }
}
