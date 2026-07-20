"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Institution } from "@/models/Institution";
import { Faculty } from "@/models/Faculty";
import { Department } from "@/models/Department";
import { Programme } from "@/models/Programme";
import { Course } from "@/models/Course";
import { CourseAllocation } from "@/models/CourseAllocation";
import { Student } from "@/models/Student";
import { Lecturer } from "@/models/Lecturer";
import { User } from "@/models/User";
import { AuditLog } from "@/models/AuditLog";
import { parseStudentExcel, parseLecturerExcel } from "@/utils/excel";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Creates a new Institution
 */
export async function createInstitution(data: {
  name: string;
  code: string;
  type: "university" | "college" | "polytechnic" | "secondary" | "corporate" | "training";
  address?: string;
}) {
  try {
    await connectToDatabase();
    const existing = await Institution.findOne({ code: data.code.toUpperCase() });
    if (existing) {
      return { success: false, error: "An institution with this code already exists" };
    }

    const institution = await Institution.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return { success: true, institution: JSON.parse(JSON.stringify(institution)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create institution" };
  }
}

/**
 * Creates a new Department
 */
export async function createDepartment(data: {
  name: string;
  code: string;
  institutionId: string;
  facultyId?: string;
}) {
  try {
    await connectToDatabase();
    const existing = await Department.findOne({
      institutionId: data.institutionId,
      code: data.code.toUpperCase(),
    });
    if (existing) {
      return { success: false, error: "Department code already exists in this institution" };
    }

    const department = await Department.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return { success: true, department: JSON.parse(JSON.stringify(department)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create department" };
  }
}

/**
 * Creates a new Programme
 */
export async function createProgramme(data: {
  name: string;
  code: string;
  departmentId: string;
  durationYears: number;
}) {
  try {
    await connectToDatabase();
    const existing = await Programme.findOne({
      departmentId: data.departmentId,
      code: data.code.toUpperCase(),
    });
    if (existing) {
      return { success: false, error: "Programme code already exists in this department" };
    }

    const programme = await Programme.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return { success: true, programme: JSON.parse(JSON.stringify(programme)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create programme" };
  }
}

/**
 * Creates a new Course
 */
export async function createCourse(data: {
  name: string;
  code: string;
  institutionId: string;
  departmentId: string;
  level: number;
  semester: "first" | "second";
  creditUnits: number;
}) {
  try {
    await connectToDatabase();
    const existing = await Course.findOne({
      institutionId: data.institutionId,
      code: data.code.toUpperCase(),
    });
    if (existing) {
      return { success: false, error: "Course code already exists in this institution" };
    }

    const course = await Course.create({
      ...data,
      code: data.code.toUpperCase(),
    });

    return { success: true, course: JSON.parse(JSON.stringify(course)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create course" };
  }
}

/**
 * Allocates a course to a lecturer
 */
export async function allocateCourseToLecturer(data: {
  lecturerId: string;
  courseId: string;
  academicSession: string;
  semester: "first" | "second";
}) {
  try {
    await connectToDatabase();

    const allocation = await CourseAllocation.findOneAndUpdate(
      {
        courseId: data.courseId,
        academicSession: data.academicSession,
        semester: data.semester,
      },
      {
        lecturerId: data.lecturerId,
      },
      { upsert: true, new: true }
    );

    // Also update assignedCourses array on Lecturer model
    await Lecturer.findByIdAndUpdate(data.lecturerId, {
      $addToSet: { assignedCourses: data.courseId },
    });

    return { success: true, allocation: JSON.parse(JSON.stringify(allocation)) };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to allocate course" };
  }
}

/**
 * Bulk import students via uploaded Excel file
 */
export async function bulkImportStudents(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const institutionId = formData.get("institutionId") as string;

    if (!file || !institutionId) {
      return { success: false, error: "File and institution selection are required" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const studentRows = parseStudentExcel(buffer);
    if (studentRows.length === 0) {
      return { success: false, error: "No valid student records found in file" };
    }

    await connectToDatabase();
    const reqHeaders = await headers();
    let importedCount = 0;
    let failedCount = 0;

    for (const row of studentRows) {
      try {
        // Find department and programme by code
        const dept = await Department.findOne({
          institutionId,
          code: row.departmentCode,
        });

        const prog = await Programme.findOne({
          code: row.programmeCode,
        });

        // 1. Create account via Better Auth API
        const randomPassword = `Pass@${Math.floor(100000 + Math.random() * 900000)}`;
        const signUpResult = await auth.api.signUpEmail({
          body: {
            email: row.email,
            password: randomPassword,
            name: row.name,
          },
          headers: reqHeaders,
        });

        if (signUpResult && signUpResult.user) {
          const userId = signUpResult.user.id;
          
          await User.findByIdAndUpdate(userId, {
            role: "student",
            institutionId,
          });

          await Student.create({
            userId,
            matricNumber: row.matricNumber,
            institutionId,
            departmentId: dept?._id,
            programmeId: prog?._id,
            currentLevel: row.currentLevel || 100,
          });

          importedCount++;
        }
      } catch (err) {
        console.error(`Error importing student ${row.email}:`, err);
        failedCount++;
      }
    }

    // Log Audit Trail
    await AuditLog.create({
      action: "BULK_IMPORT_STUDENTS",
      status: "SUCCESS",
      details: `Bulk imported ${importedCount} students. Failed: ${failedCount}`,
    });

    return {
      success: true,
      importedCount,
      failedCount,
      totalCount: studentRows.length,
    };
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return { success: false, error: error.message || "Failed to process bulk import" };
  }
}
