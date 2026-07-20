import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Lecturer } from "@/models/Lecturer";
import { Course } from "@/models/Course";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Use findOne with the string ID (Mongoose will cast to ObjectId if valid)
    let queryId: string | mongoose.Types.ObjectId = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryId = new mongoose.Types.ObjectId(userId);
    }

    const lecturer = await Lecturer.findOne({ userId: queryId })
      .populate("assignedCourses");

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer profile not found" }, { status: 404 });
    }

    // Map assigned courses with some mock performance metrics for now 
    // (since actual attendance performance logic is complex and needs more models)
    const assignedCourses = (lecturer.assignedCourses || []).map((c: any) => ({
      id: c._id,
      code: c.code,
      name: c.name,
      students: Math.floor(Math.random() * 100) + 20, // Mock student count
      avgAttendance: Math.floor(Math.random() * 20) + 75, // Mock attendance 75-95%
    }));

    return NextResponse.json({
      lecturer: {
        id: lecturer._id,
        staffId: lecturer.staffId,
      },
      assignedCourses,
      stats: {
        totalEnrolled: assignedCourses.reduce((acc: number, c: any) => acc + c.students, 0),
        avgAttendance: assignedCourses.length > 0 
          ? Math.round(assignedCourses.reduce((acc: number, c: any) => acc + c.avgAttendance, 0) / assignedCourses.length)
          : 0,
      }
    });
  } catch (error: any) {
    console.error("Lecturer dashboard API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch lecturer data" }, { status: 500 });
  }
}
