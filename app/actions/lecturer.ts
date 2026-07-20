"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { LectureSession } from "@/models/LectureSession";
import { Lecturer } from "@/models/Lecturer";
import { Attendance } from "@/models/Attendance";
import { AuditLog } from "@/models/AuditLog";
import { generateSecureQRCode } from "@/services/qr-service";

/**
 * Creates a new active lecture attendance session and generates initial QR code
 */
export async function createLectureSession(data: {
  userId: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
}) {
  try {
    await connectToDatabase();

    const lecturer = await Lecturer.findOne({ userId: data.userId });
    if (!lecturer) {
      return { success: false, error: "Lecturer profile not found" };
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + data.durationMinutes * 60 * 1000);

    const session = await LectureSession.create({
      courseId: data.courseId,
      lecturerId: lecturer._id,
      institutionId: lecturer.institutionId,
      title: data.title,
      status: "active",
      startTime,
      endTime,
      latitude: data.latitude,
      longitude: data.longitude,
      geofenceRadius: data.geofenceRadius || 100, // 100m default
      totalAttendance: 0,
    });

    // Generate initial secure QR code payload
    const { qrDataUrl, payload } = await generateSecureQRCode({
      sessionId: session._id.toString(),
      courseId: data.courseId,
      durationSeconds: 3600, // Rotates every 1 hour
    });

    // Log Audit Trail
    await AuditLog.create({
      userId: data.userId,
      action: "QR_GENERATED",
      status: "SUCCESS",
      details: `Created attendance session ${session._id} for course ${data.courseId}`,
    });

    return {
      success: true,
      session: {
        id: session._id.toString(),
        title: session.title,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
      },
      qrDataUrl,
      payload,
    };
  } catch (error: any) {
    console.error("Create lecture session error:", error);
    return { success: false, error: error.message || "Failed to create lecture session" };
  }
}

/**
 * Updates lecture session status (active, paused, closed)
 */
export async function updateSessionStatus(sessionId: string, status: "active" | "paused" | "closed") {
  try {
    await connectToDatabase();

    const session = await LectureSession.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true }
    );

    return { 
      success: true, 
      session: {
        id: session._id.toString(),
        title: session.title,
        status: session.status,
        startTime: session.startTime,
        endTime: session.endTime,
      } 
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update session status" };
  }
}

/**
 * Retrieves real-time attendance log list for an active session
 */
export async function getSessionAttendanceLogs(sessionId: string) {
  try {
    await connectToDatabase();

    const logs = await Attendance.find({ sessionId })
      .populate({
        path: "studentId",
        populate: { path: "userId", select: "name email" },
      })
      .sort({ scannedAt: -1 });

    return {
      success: true,
      count: logs.length,
      logs: logs.map((log: any) => ({
        id: log._id.toString(),
        name: log.studentId?.userId?.name || "Student",
        matricNumber: log.studentId?.matricNumber || "N/A",
        scannedAt: log.scannedAt,
        status: log.status,
        distanceMeters: log.distanceMeters,
      })),
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch attendance logs" };
  }
}
