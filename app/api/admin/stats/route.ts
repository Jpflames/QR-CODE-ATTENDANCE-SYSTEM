import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Student } from "@/models/Student";
import { Lecturer } from "@/models/Lecturer";
import { Department } from "@/models/Department";
import { Course } from "@/models/Course";

export async function GET() {
  try {
    await connectToDatabase();

    const [
      totalStudents,
      totalLecturers,
      totalDepartments,
      totalCourses,
    ] = await Promise.all([
      Student.countDocuments(),
      Lecturer.countDocuments(),
      Department.countDocuments(),
      Course.countDocuments(),
    ]);

    // Mock trend analytics data for past 7 days for visualization
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const attendanceTrends = days.map((day, idx) => ({
      name: day,
      scans: Math.floor(Math.random() * 200) + 50,
      sessions: Math.floor(Math.random() * 15) + 5,
    }));

    return NextResponse.json({
      totalStudents,
      totalLecturers,
      totalDepartments,
      totalCourses,
      todayAttendance: 142, // Mocked for initial presentation
      todaySessions: 12,
      attendanceTrends,
    });
  } catch (error: any) {
    console.error("Admin stats fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
