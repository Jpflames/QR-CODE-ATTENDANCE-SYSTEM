import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Student } from "@/models/Student";
import { User } from "@/models/User";
import { Course } from "@/models/Course";
import { Department } from "@/models/Department";
import { Programme } from "@/models/Programme";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId query parameter is required" }, { status: 400 });
    }

    await connectToDatabase();

    let queryId: string | mongoose.Types.ObjectId = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      queryId = new mongoose.Types.ObjectId(userId);
    }

    const student = await Student.findOne({ userId: queryId })
      .populate("departmentId")
      .populate("programmeId")
      .populate("registeredCourses");

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    const user = await User.findById(userId).select("name email image");

    // Generate mock stats and attendance history records for demonstration
    const registeredCourses = student.registeredCourses || [];
    const courseStats = registeredCourses.map((c: any) => ({
      _id: c._id,
      code: c.code,
      name: c.name,
      creditUnits: c.creditUnits,
      attended: Math.floor(Math.random() * 8) + 12,
      total: 20,
      percentage: Math.floor(Math.random() * 20) + 80, // e.g. 85% - 100%
    }));

    const overallPercentage = courseStats.length > 0
      ? Math.round(courseStats.reduce((acc: number, item: any) => acc + item.percentage, 0) / courseStats.length)
      : 0;

    const mockHistory = [
      {
        id: "att_1",
        courseCode: "CSC401",
        courseName: "Software Engineering",
        date: "2026-07-18 10:15 AM",
        status: "PRESENT",
        lecturer: "Dr. Alan Turing",
        ip: "192.168.1.45",
      },
      {
        id: "att_2",
        courseCode: "CSC403",
        courseName: "Database Systems",
        date: "2026-07-17 02:05 PM",
        status: "PRESENT",
        lecturer: "Prof. Ada Lovelace",
        ip: "192.168.1.45",
      },
      {
        id: "att_3",
        courseCode: "CSC405",
        courseName: "Computer Networks",
        date: "2026-07-15 11:30 AM",
        status: "LATE",
        lecturer: "Dr. Grace Hopper",
        ip: "192.168.1.45",
      },
    ];

    return NextResponse.json({
      student: {
        id: student._id,
        matricNumber: student.matricNumber,
        currentLevel: student.currentLevel,
        department: student.departmentId?.name || "Computer Science",
        programme: student.programmeId?.name || "B.Sc. Computer Science",
        user: {
          name: user?.name || "Student",
          email: user?.email || "",
          image: user?.image || "",
        },
      },
      stats: {
        totalRegistered: registeredCourses.length,
        overallPercentage,
        totalClasses: 60,
        attendedClasses: 52,
      },
      courseStats,
      attendanceHistory: mockHistory,
    });
  } catch (error: any) {
    console.error("Student dashboard API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch student data" }, { status: 500 });
  }
}
