"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { registerSchema, RegisterInput } from "@/validators/auth";
import { Student } from "@/models/Student";
import { Lecturer } from "@/models/Lecturer";
import { AuditLog } from "@/models/AuditLog";
import { User } from "@/models/User";
import { headers } from "next/headers";

export async function registerUser(input: RegisterInput) {
  try {
    // 1. Validate Input
    const validatedData = registerSchema.parse(input);

    await connectToDatabase();

    // 2. Check if Matric Number or Staff ID already exists to prevent duplicate profiles
    if (validatedData.role === "student" && validatedData.matricNumber) {
      const existingStudent = await Student.findOne({ matricNumber: validatedData.matricNumber });
      if (existingStudent) {
        return { success: false, error: "Matriculation number is already registered" };
      }
    }

    if (validatedData.role === "lecturer" && validatedData.staffId) {
      const existingLecturer = await Lecturer.findOne({ staffId: validatedData.staffId });
      if (existingLecturer) {
        return { success: false, error: "Staff ID is already registered" };
      }
    }

    // 3. Register user using Better Auth API
    // Note: We need to pass the headers context to Better Auth API calls
    const reqHeaders = await headers();
    
    let signUpResult;
    try {
      signUpResult = await auth.api.signUpEmail({
        body: {
          email: validatedData.email.toLowerCase(),
          password: validatedData.password,
          name: validatedData.name,
        },
        headers: reqHeaders,
      });
    } catch (authError: any) {
      console.error("Better Auth signUpEmail error:", authError);
      return { success: false, error: authError.message || "Registration failed during account creation" };
    }

    if (!signUpResult || !signUpResult.user) {
      return { success: false, error: "Failed to create user account" };
    }

    const userId = signUpResult.user.id;

    // 4. Update the User role and institutionId in the user collection
    // Since Better Auth might restrict role updating on sign-up from the client, 
    // we explicitly update it directly via Mongoose.
    await User.findByIdAndUpdate(userId, {
      role: validatedData.role,
      institutionId: validatedData.institutionId,
    });

    // 5. Create Profile (Student or Lecturer)
    try {
      // Convert the string ID from Better Auth into a Mongoose ObjectId to satisfy TypeScript
      const mongooseUserId = new (require("mongoose").Types.ObjectId)(userId);
      
      if (validatedData.role === "student") {
        await Student.create({
          userId: mongooseUserId,
          matricNumber: validatedData.matricNumber,
          institutionId: validatedData.institutionId,
          departmentId: validatedData.departmentId,
          programmeId: validatedData.programmeId,
          currentLevel: validatedData.currentLevel,
        });
      } else if (validatedData.role === "lecturer") {
        await Lecturer.create({
          userId: mongooseUserId,
          staffId: validatedData.staffId,
          institutionId: validatedData.institutionId,
          departmentId: validatedData.departmentId,
        });
      }
    } catch (profileError) {
      // Rollback Better Auth user creation if profile creation fails
      console.error("Profile creation failed, rolling back user:", profileError);
      await User.findByIdAndDelete(userId);
      // Better Auth doesn't have a direct delete user API but we can delete from the DB
      return { success: false, error: "Failed to complete profile creation. Please try again." };
    }

    // 6. Log Audit Trail
    const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = reqHeaders.get("user-agent") || "unknown";

    await AuditLog.create({
      userId: mongooseUserId,
      action: "REGISTER",
      status: "SUCCESS",
      details: `User registered successfully as ${validatedData.role}`,
      ipAddress: ip,
      userAgent,
    });

    return { success: true, user: signUpResult.user };
  } catch (error: any) {
    console.error("Registration action error:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
