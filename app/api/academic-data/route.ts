import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Institution } from "@/models/Institution";
import { Department } from "@/models/Department";
import { Programme } from "@/models/Programme";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "institutions") {
      const institutions = await Institution.find({ status: "active" }).select("name code");
      return NextResponse.json(institutions);
    }

    if (type === "departments") {
      const institutionId = searchParams.get("institutionId");
      if (!institutionId) {
        return NextResponse.json({ error: "institutionId is required" }, { status: 400 });
      }
      const departments = await Department.find({ institutionId }).select("name code");
      return NextResponse.json(departments);
    }

    if (type === "programmes") {
      const departmentId = searchParams.get("departmentId");
      if (!departmentId) {
        return NextResponse.json({ error: "departmentId is required" }, { status: 400 });
      }
      const programmes = await Programme.find({ departmentId }).select("name code durationYears");
      return NextResponse.json(programmes);
    }

    return NextResponse.json({ error: "Invalid or missing type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("Academic data fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch academic data" }, { status: 500 });
  }
}
