"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FileSpreadsheetIcon,
  DownloadIcon,
  UploadIcon,
  Loader2Icon,
  CheckCircle2Icon,
  AlertCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { bulkImportStudents } from "@/app/actions/academic";

interface InstitutionItem {
  _id: string;
  name: string;
  code: string;
}

export default function BulkImportPage() {
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function loadInstitutions() {
      try {
        const res = await fetch("/api/academic-data?type=institutions");
        if (res.ok) {
          const data = await res.json();
          setInstitutions(data);
          if (data.length > 0) setSelectedInstitutionId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load institutions", err);
      }
    }
    loadInstitutions();
  }, []);

  const handleDownloadTemplate = (type: "student" | "lecturer") => {
    window.open(`/api/admin/template?type=${type}`, "_blank");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmitImport = async () => {
    if (!file || !selectedInstitutionId) {
      toast.error("Please select an institution and attach an Excel file");
      return;
    }

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("institutionId", selectedInstitutionId);

    try {
      const res = await bulkImportStudents(formData);
      setIsLoading(false);
      if (res.success) {
        toast.success(`Successfully imported ${res.importedCount} student records!`);
        setResult(res);
        setFile(null);
      } else {
        toast.error(res.error || "Bulk import failed");
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || "An unexpected error occurred during import");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Excel Bulk Roster Import</h2>
        <p className="text-sm text-muted-foreground">
          Import student or lecturer accounts in bulk from Excel worksheets.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Download Templates */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">1. Download Templates</CardTitle>
            <CardDescription>Get pre-formatted Excel template files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleDownloadTemplate("student")}
            >
              <DownloadIcon className="size-4 text-primary" />
              Student Template (.xlsx)
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleDownloadTemplate("lecturer")}
            >
              <DownloadIcon className="size-4 text-emerald-500" />
              Lecturer Template (.xlsx)
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Upload File Form */}
        <Card className="md:col-span-2 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">2. Upload & Process Worksheet</CardTitle>
            <CardDescription>Select target institution and file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Institution</Label>
              <Select
                value={selectedInstitutionId}
                onValueChange={(v: string | null) => setSelectedInstitutionId(v || "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => (
                    <SelectItem key={inst._id} value={inst._id}>
                      {inst.name} ({inst.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Attach Worksheet (.xlsx)</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center text-center bg-card hover:bg-muted/30 transition-colors">
                <FileSpreadsheetIcon className="size-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  {file ? file.name : "Drag and drop your Excel file here or click to browse"}
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="mt-4 text-xs cursor-pointer"
                />
              </div>
            </div>

            <Button
              onClick={handleSubmitImport}
              disabled={isLoading || !file}
              className="w-full h-11 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Processing Roster Records...
                </>
              ) : (
                <>
                  <UploadIcon className="size-4" />
                  Process Bulk Import
                </>
              )}
            </Button>

            {/* Results Notice */}
            {result && (
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 space-y-2 mt-4">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2Icon className="size-5" />
                  Import Processing Complete
                </div>
                <div className="text-xs space-y-1">
                  <p>Successfully Created: {result.importedCount} records</p>
                  {result.failedCount > 0 && (
                    <p className="text-amber-500">Skipped/Failed: {result.failedCount} records</p>
                  )}
                  <p>Total Records Processed: {result.totalCount}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
