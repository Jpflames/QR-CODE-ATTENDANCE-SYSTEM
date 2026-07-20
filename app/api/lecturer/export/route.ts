import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Attendance } from "@/models/Attendance";
import { generateExcelAttendanceReport, generateCSVAttendanceReport } from "@/services/report-generator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "excel";
    const sessionId = searchParams.get("sessionId");

    await connectToDatabase();

    const query = sessionId ? { sessionId } : {};
    const logs = await Attendance.find(query)
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name" },
      })
      .populate("courseId")
      .populate("sessionId")
      .sort({ scannedAt: -1 });

    const rows = logs.map((log: any) => ({
      studentName: log.studentId?.userId?.name || "Student",
      matricNumber: log.studentId?.matricNumber || "N/A",
      department: "Computer Science",
      courseCode: log.courseId?.code || "CSC401",
      courseName: log.courseId?.name || "Software Engineering",
      sessionTitle: log.sessionId?.title || "Lecture Session",
      date: new Date(log.scannedAt).toLocaleString(),
      status: log.status,
      ipAddress: log.ipAddress || "127.0.0.1",
    }));

    if (format === "csv") {
      const csvString = generateCSVAttendanceReport(rows);
      return new NextResponse(csvString, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="attendance_report.csv"',
        },
      });
    } else {
      const excelBuffer = generateExcelAttendanceReport(rows);
      return new NextResponse(new Uint8Array(excelBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="attendance_report.xlsx"',
        },
      });
    }
  } catch (error: any) {
    console.error("Export API error:", error);
    return NextResponse.json({ error: "Failed to generate export file" }, { status: 500 });
  }
}
