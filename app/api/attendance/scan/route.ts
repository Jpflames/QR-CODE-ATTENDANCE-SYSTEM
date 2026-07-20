import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { validateQRPayload, calculateGeofenceDistanceMeters } from "@/services/qr-service";
import { Student } from "@/models/Student";
import { LectureSession } from "@/models/LectureSession";
import { Attendance } from "@/models/Attendance";
import { CourseRegistration } from "@/models/CourseRegistration";
import { AuditLog } from "@/models/AuditLog";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payload, studentUserId, deviceFingerprint, latitude, longitude } = body;

    if (!payload || !studentUserId) {
      return NextResponse.json(
        { success: false, error: "Missing payload or student identification" },
        { status: 400 }
      );
    }

    // 1. Validate QR Code Signature, Hash, and Expiration
    const qrValidation = await validateQRPayload(payload);
    if (!qrValidation.valid || !qrValidation.payload) {
      return NextResponse.json(
        { success: false, error: qrValidation.error || "Invalid QR Code" },
        { status: 400 }
      );
    }

    const { sessionId, courseId } = qrValidation.payload;

    await connectToDatabase();

    // 2. Verify Student Exists
    const student = await Student.findOne({ userId: studentUserId });
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student profile not found. Please register first." },
        { status: 404 }
      );
    }

    // 3. Verify Course Registration
    const isRegistered =
      student.registeredCourses?.includes(courseId) ||
      (await CourseRegistration.findOne({
        studentId: student._id,
        courseId,
        status: "registered",
      }));

    if (!isRegistered) {
      return NextResponse.json(
        { success: false, error: "You are not registered for this course" },
        { status: 403 }
      );
    }

    // 4. Check Duplicate Attendance
    const existingAttendance = await Attendance.findOne({
      sessionId,
      studentId: student._id,
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate scan rejected. You have already recorded attendance for this session.",
        },
        { status: 409 }
      );
    }

    // 5. Check Geofence Coordinates (if lecturer set classroom GPS)
    const session = await LectureSession.findById(sessionId);
    let distanceMeters: number | undefined = undefined;

    if (session?.latitude && session?.longitude) {
      if (!latitude || !longitude) {
        return NextResponse.json(
          {
            success: false,
            error: "Location permission required. Please enable GPS location on your device to record attendance.",
          },
          { status: 400 }
        );
      }

      distanceMeters = calculateGeofenceDistanceMeters(
        latitude,
        longitude,
        session.latitude,
        session.longitude
      );

      const maxRadius = session.geofenceRadius || 100; // 100 meters default
      if (distanceMeters > maxRadius) {
        return NextResponse.json(
          {
            success: false,
            error: `Geofence validation failed. You are ${distanceMeters}m away from the classroom (maximum allowed radius is ${maxRadius}m).`,
          },
          { status: 403 }
        );
      }
    }

    // 6. Record Attendance
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const attendanceRecord = await Attendance.create({
      sessionId,
      courseId,
      studentId: student._id,
      institutionId: student.institutionId,
      status: "PRESENT",
      deviceFingerprint,
      ipAddress: ip,
      latitude,
      longitude,
      distanceMeters,
      scannedAt: new Date(),
    });

    // Increment total attendance count on lecture session
    await LectureSession.findByIdAndUpdate(sessionId, {
      $inc: { totalAttendance: 1 },
    });

    // Log Audit Trail
    await AuditLog.create({
      userId: studentUserId,
      action: "ATTENDANCE_RECORDED",
      status: "SUCCESS",
      details: `Recorded attendance for session ${sessionId}. Distance: ${distanceMeters ?? "N/A"}m`,
      ipAddress: ip,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully!",
      attendance: {
        id: attendanceRecord._id,
        scannedAt: attendanceRecord.scannedAt,
        status: attendanceRecord.status,
      },
    });
  } catch (error: any) {
    console.error("Attendance scan error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process attendance scan" },
      { status: 500 }
    );
  }
}
