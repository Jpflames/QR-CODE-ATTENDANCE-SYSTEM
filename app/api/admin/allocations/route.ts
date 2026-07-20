import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Lecturer } from "@/models/Lecturer";
import { Course } from "@/models/Course";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const lecturers = await Lecturer.find({}).populate("assignedCourses");
    const courses = await Course.find({}).sort({ code: 1 });

    // Fetch user details for lecturers to display their names
    const populatedLecturers = await Promise.all(
      lecturers.map(async (lec) => {
        const user = await User.findById(lec.userId).select("name email");
        return {
          id: lec._id,
          staffId: lec.staffId,
          name: user?.name || "Unknown",
          email: user?.email || "",
          assignedCourses: lec.assignedCourses.map((c: any) => ({
            id: c._id,
            code: c.code,
            name: c.name,
          })),
        };
      })
    );

    return NextResponse.json({
      lecturers: populatedLecturers,
      courses: courses.map((c: any) => ({
        id: c._id,
        code: c.code,
        name: c.name,
        creditUnits: c.creditUnits,
      })),
    });
  } catch (error: any) {
    console.error("Admin allocations API GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { lecturerId, courseIds } = body;

    if (!lecturerId || !Array.isArray(courseIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const lecturer = await Lecturer.findByIdAndUpdate(
      lecturerId,
      { assignedCourses: courseIds },
      { new: true }
    );

    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Courses allocated successfully" });
  } catch (error: any) {
    console.error("Admin allocations API POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to allocate courses" }, { status: 500 });
  }
}
