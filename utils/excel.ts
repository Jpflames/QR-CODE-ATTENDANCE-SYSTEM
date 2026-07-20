import * as XLSX from "xlsx";

export interface BulkStudentRow {
  name: string;
  email: string;
  matricNumber: string;
  currentLevel: number;
  departmentCode: string;
  programmeCode: string;
}

export interface BulkLecturerRow {
  name: string;
  email: string;
  staffId: string;
  departmentCode: string;
}

/**
 * Parses an uploaded Excel buffer containing student records
 */
export function parseStudentExcel(buffer: Buffer): BulkStudentRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

  return rawData.map((row) => ({
    name: String(row["Name"] || row["Full Name"] || "").trim(),
    email: String(row["Email"] || row["Email Address"] || "").trim().toLowerCase(),
    matricNumber: String(row["Matric Number"] || row["MatricNumber"] || row["Student ID"] || "").trim(),
    currentLevel: parseInt(row["Level"] || row["Current Level"] || "100", 10),
    departmentCode: String(row["Department Code"] || row["Department"] || "").trim().toUpperCase(),
    programmeCode: String(row["Programme Code"] || row["Programme"] || "").trim().toUpperCase(),
  })).filter(item => item.name && item.email && item.matricNumber);
}

/**
 * Parses an uploaded Excel buffer containing lecturer records
 */
export function parseLecturerExcel(buffer: Buffer): BulkLecturerRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawData: any[] = XLSX.utils.sheet_to_json(worksheet);

  return rawData.map((row) => ({
    name: String(row["Name"] || row["Full Name"] || "").trim(),
    email: String(row["Email"] || row["Email Address"] || "").trim().toLowerCase(),
    staffId: String(row["Staff ID"] || row["StaffID"] || "").trim(),
    departmentCode: String(row["Department Code"] || row["Department"] || "").trim().toUpperCase(),
  })).filter(item => item.name && item.email && item.staffId);
}

/**
 * Generates a sample XLSX workbook buffer for downloading templates
 */
export function generateSampleExcel(type: "student" | "lecturer"): Buffer {
  const wb = XLSX.utils.book_new();

  if (type === "student") {
    const sampleData = [
      {
        "Full Name": "Alice Smith",
        "Email Address": "alice.smith@university.edu",
        "Matric Number": "AGU/CSC/2026/001",
        "Current Level": 100,
        "Department Code": "CSC",
        "Programme Code": "BSC-CSC",
      },
      {
        "Full Name": "Bob Jones",
        "Email Address": "bob.jones@university.edu",
        "Matric Number": "AGU/CSC/2026/002",
        "Current Level": 200,
        "Department Code": "CSC",
        "Programme Code": "BSC-CSC",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Students Template");
  } else {
    const sampleData = [
      {
        "Full Name": "Dr. Alan Turing",
        "Email Address": "alan.turing@university.edu",
        "Staff ID": "AGU/L/101",
        "Department Code": "CSC",
      },
      {
        "Full Name": "Prof. Ada Lovelace",
        "Email Address": "ada.lovelace@university.edu",
        "Staff ID": "AGU/L/102",
        "Department Code": "CSC",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, "Lecturers Template");
  }

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
