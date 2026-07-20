"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Student } from "@/models/Student";
import { CourseRegistration } from "@/models/CourseRegistration";
import { AuditLog } from "@/models/AuditLog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Registers student for selected courses in the current academic session
 */
export async function registerStudentCourses(data: {
  userId: string;
  courseIds: string[];
  academicSession: string;
  semester: "first" | "second";
}) {
  try {
    await connectToDatabase();

    const student = await Student.findOne({ userId: data.userId });
    if (!student) {
      return { success: false, error: "Student profile not found" };
    }

    // Register each course in CourseRegistration collection
    for (const courseId of data.courseIds) {
      await CourseRegistration.findOneAndUpdate(
        {
          studentId: student._id,
          courseId,
          academicSession: data.academicSession,
          semester: data.semester,
        },
        { status: "registered" },
        { upsert: true, new: true }
      );
    }

    // Add courses to student's registeredCourses list
    await Student.findByIdAndUpdate(student._id, {
      $addToSet: { registeredCourses: { $each: data.courseIds } },
    });

    // Audit Log
    await AuditLog.create({
      userId: data.userId,
      action: "COURSE_REGISTRATION",
      status: "SUCCESS",
      details: `Registered ${data.courseIds.length} courses for ${data.academicSession} (${data.semester} semester)`,
    });

    return { success: true, count: data.courseIds.length };
  } catch (error: any) {
    console.error("Course registration error:", error);
    return { success: false, error: error.message || "Failed to register courses" };
  }
}

/**
 * Updates the student's device fingerprint identifier
 */
export async function updateStudentFingerprint(userId: string, fingerprintId: string) {
  try {
    await connectToDatabase();
    await Student.findOneAndUpdate({ userId }, { fingerprintId });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update fingerprint" };
  }
}
