import { NextRequest, NextResponse } from "next/server";
import { generateSampleExcel } from "@/utils/excel";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") as "student" | "lecturer") || "student";

    const buffer = generateSampleExcel(type);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}_import_template.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 });
  }
}
