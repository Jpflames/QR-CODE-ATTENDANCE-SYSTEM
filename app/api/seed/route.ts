import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Institution } from "@/models/Institution";
import { Department } from "@/models/Department";
import { Programme } from "@/models/Programme";
import { Role } from "@/models/Role";

export async function GET() {
  // Only allow seeding in development for safety, or check for a local dev environment
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  try {
    await connectToDatabase();

    // 1. Seed Roles
    const rolesData = [
      { name: "super_admin", displayName: "Super Admin", description: "System-wide Administrator", permissions: ["all"] },
      { name: "institution_admin", displayName: "Institution Admin", description: "Administrator for a specific institution", permissions: ["manage_institution", "manage_users", "view_reports"] },
      { name: "lecturer", displayName: "Lecturer", description: "Academic staff member", permissions: ["create_session", "generate_qr", "view_attendance", "export_reports"] },
      { name: "student", displayName: "Student", description: "Learner registered at the institution", permissions: ["scan_qr", "view_own_attendance"] },
    ];

    for (const r of rolesData) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }

    // 2. Seed Default Institution
    let institution = await Institution.findOne({ code: "AGU" });
    if (!institution) {
      institution = await Institution.create({
        name: "Antigravity University",
        code: "AGU",
        type: "university",
        address: "DeepMind Tech Park, London",
        status: "active",
      });
    }

    // 3. Seed Departments
    const cscDeptData = {
      name: "Computer Science",
      code: "CSC",
      institutionId: institution._id.toString(),
    };
    let cscDept = await Department.findOne({ institutionId: institution._id.toString(), code: "CSC" });
    if (!cscDept) {
      cscDept = await Department.create(cscDeptData);
    }

    const eeeDeptData = {
      name: "Electrical Engineering",
      code: "EEE",
      institutionId: institution._id.toString(),
    };
    let eeeDept = await Department.findOne({ institutionId: institution._id.toString(), code: "EEE" });
    if (!eeeDept) {
      eeeDept = await Department.create(eeeDeptData);
    }

    // 4. Seed Programmes
    const cscProgData = {
      name: "B.Sc. Computer Science",
      code: "BSC-CSC",
      departmentId: cscDept._id.toString(),
      durationYears: 4,
    };
    let cscProg = await Programme.findOne({ departmentId: cscDept._id.toString(), code: "BSC-CSC" });
    if (!cscProg) {
      cscProg = await Programme.create(cscProgData);
    }

    const eeeProgData = {
      name: "B.Eng. Electrical Engineering",
      code: "BENG-EEE",
      departmentId: eeeDept._id.toString(),
      durationYears: 5,
    };
    let eeeProg = await Programme.findOne({ departmentId: eeeDept._id.toString(), code: "BENG-EEE" });
    if (!eeeProg) {
      eeeProg = await Programme.create(eeeProgData);
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      institution: { id: institution._id, name: institution.name },
      departments: [cscDept.name, eeeDept.name],
      programmes: [cscProg.name, eeeProg.name],
    });
  } catch (error: any) {
    console.error("Seeding error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed database" }, { status: 500 });
  }
}
