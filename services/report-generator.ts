import * as XLSX from "xlsx";

export interface AttendanceReportRow {
  studentName: string;
  matricNumber: string;
  department: string;
  courseCode: string;
  courseName: string;
  sessionTitle: string;
  date: string;
  status: string;
  ipAddress: string;
}

/**
 * Generates an Excel (.xlsx) buffer for attendance report
 */
export function generateExcelAttendanceReport(rows: AttendanceReportRow[]): Buffer {
  const wb = XLSX.utils.book_new();

  const formattedData = rows.map((r) => ({
    "Student Name": r.studentName,
    "Matriculation Number": r.matricNumber,
    "Department": r.department,
    "Course Code": r.courseCode,
    "Course Title": r.courseName,
    "Session Title": r.sessionTitle,
    "Date & Time": r.date,
    "Status": r.status,
    "IP Address": r.ipAddress,
  }));

  const ws = XLSX.utils.json_to_sheet(formattedData);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

/**
 * Generates a CSV string for attendance report
 */
export function generateCSVAttendanceReport(rows: AttendanceReportRow[]): string {
  const headers = ["Student Name", "Matric Number", "Department", "Course Code", "Course Title", "Session Title", "Date & Time", "Status", "IP Address"];
  const csvLines = [headers.join(",")];

  for (const r of rows) {
    const line = [
      `"${r.studentName}"`,
      `"${r.matricNumber}"`,
      `"${r.department}"`,
      `"${r.courseCode}"`,
      `"${r.courseName}"`,
      `"${r.sessionTitle}"`,
      `"${r.date}"`,
      `"${r.status}"`,
      `"${r.ipAddress}"`,
    ];
    csvLines.push(line.join(","));
  }

  return csvLines.join("\n");
}
