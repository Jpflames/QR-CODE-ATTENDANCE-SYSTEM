"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  QrCodeIcon,
  PlayIcon,
  PauseIcon,
  SquareIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  Loader2Icon,
  CheckCircle2Icon,
  RefreshCwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createLectureSession, updateSessionStatus, getSessionAttendanceLogs } from "@/app/actions/lecturer";

export default function LecturerSessionPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [activeSession, setActiveSession] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("CSC401 - Software Engineering Lecture");
  const [courseId, setCourseId] = useState("66a1b2c3d4e5f67890123456");
  const [duration, setDuration] = useState("60");
  const [geofenceRadius, setGeofenceRadius] = useState("100");
  const [coords, setCoords] = useState<{ lat?: number; lon?: number }>({});

  // Acquire lecturer GPS coordinates for classroom geofencing
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("GPS positioning unvailable:", err.message);
        }
      );
    }
  }, []);

  // Poll for rotated QR code every 25 seconds when session is active
  useEffect(() => {
    if (!activeSession || activeSession.status !== "active") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/lecturer/qr?sessionId=${activeSession.id}&courseId=${courseId}`
        );
        if (res.ok) {
          const json = await res.json();
          setQrDataUrl(json.qrDataUrl);
        }
      } catch (err) {
        console.error("Failed to rotate QR code", err);
      }
    }, 3500000); // Rotate roughly every 1 hour (slightly less to prevent expiry gap)

    return () => clearInterval(interval);
  }, [activeSession, courseId]);

  // Poll attendance logs every 5 seconds
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(async () => {
      const res = await getSessionAttendanceLogs(activeSession.id);
      if (res.success && res.logs) {
        setAttendanceLogs(res.logs);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleStartSession = async () => {
    if (!userId || !title) {
      toast.error("Please enter a session title");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createLectureSession({
        userId,
        courseId,
        title,
        durationMinutes: parseInt(duration, 10),
        latitude: coords.lat,
        longitude: coords.lon,
        geofenceRadius: parseInt(geofenceRadius, 10),
      });

      setIsLoading(false);
      if (res.success && res.session) {
        setActiveSession(res.session);
        setQrDataUrl(res.qrDataUrl);
        toast.success("Lecture session started! Dynamic QR active.");
      } else {
        toast.error(res.error || "Failed to start session");
      }
    } catch (err: any) {
      setIsLoading(false);
      toast.error(err.message || "An unexpected error occurred");
    }
  };

  const handleStatusChange = async (status: "active" | "paused" | "closed") => {
    if (!activeSession) return;
    const res = await updateSessionStatus(activeSession.id, status);
    if (res.success) {
      setActiveSession((prev: any) => ({ ...prev, status }));
      toast.success(`Session status updated to ${status}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Lecture Session & Secure QR</h2>
          <p className="text-sm text-muted-foreground">
            Generate rotating signed QR codes for dynamic, anti-proxy student attendance.
          </p>
        </div>
      </div>

      {!activeSession ? (
        /* Create Session Card */
        <Card className="max-w-xl mx-auto border-border shadow-md">
          <CardHeader>
            <CardTitle>Create New Lecture Session</CardTitle>
            <CardDescription>
              Set up class details, duration, and classroom geofencing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CSC401 - Lecture 5: Design Patterns"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={(v: string | null) => setDuration(v || "60")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="120">2 Hours</SelectItem>
                    <SelectItem value="180">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Geofence Radius</Label>
                <Select value={geofenceRadius} onValueChange={(v: string | null) => setGeofenceRadius(v || "100")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Radius" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 Meters</SelectItem>
                    <SelectItem value="100">100 Meters (Standard)</SelectItem>
                    <SelectItem value="250">250 Meters (Large Hall)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {coords.lat && (
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <MapPinIcon className="size-4 shrink-0" />
                Classroom Location Locked ({coords.lat.toFixed(4)}, {coords.lon?.toFixed(4)})
              </div>
            )}

            <Button onClick={handleStartSession} disabled={isLoading} className="w-full h-11 gap-2 shadow-md shadow-primary/20">
              {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : <PlayIcon className="size-4" />}
              Start Attendance Session & Display QR
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Live QR Presentation & Real-time Log View */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left 2 Cols: High Contrast Live QR */}
          <Card className="lg:col-span-2 border-border shadow-lg flex flex-col justify-between items-center text-center p-6 bg-card">
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="font-bold text-sm truncate">{activeSession.title}</span>
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                    activeSession.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : activeSession.status === "paused"
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {activeSession.status}
                </span>
              </div>

              <div className="py-2 text-xs text-muted-foreground flex items-center justify-center gap-2">
                <RefreshCwIcon className="size-3 animate-spin text-primary" />
                Dynamic QR Token rotates every 1 hour
              </div>
            </div>

            {/* QR Code Presentation Image */}
            <div className="my-4 p-4 rounded-2xl bg-white shadow-xl border border-border border-4 border-primary/20">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Dynamic Secure QR Code"
                  className="size-64 object-contain"
                />
              ) : (
                <div className="size-64 flex items-center justify-center">
                  <Loader2Icon className="size-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* Session Controls */}
            <div className="w-full space-y-3 pt-2">
              <div className="flex gap-2">
                {activeSession.status === "active" ? (
                  <Button
                    variant="outline"
                    className="w-1/2 gap-2"
                    onClick={() => handleStatusChange("paused")}
                  >
                    <PauseIcon className="size-4 text-amber-500" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-1/2 gap-2"
                    onClick={() => handleStatusChange("active")}
                  >
                    <PlayIcon className="size-4 text-emerald-500" />
                    Resume
                  </Button>
                )}

                <Button
                  variant="destructive"
                  className="w-1/2 gap-2"
                  onClick={() => handleStatusChange("closed")}
                >
                  <SquareIcon className="size-4" />
                  Close
                </Button>
              </div>

              <Button
                variant="ghost"
                className="w-full text-xs text-muted-foreground"
                onClick={() => setActiveSession(null)}
              >
                Back to Session Creation
              </Button>
            </div>
          </Card>

          {/* Right 3 Cols: Real-Time Attendance Logs */}
          <Card className="lg:col-span-3 border-border shadow-sm flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Verified Check-ins</CardTitle>
                <CardDescription>Updates in real-time as students scan</CardDescription>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-lg flex items-center gap-2">
                <UsersIcon className="size-5" />
                {attendanceLogs.length} Scans
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric Number</TableHead>
                    <TableHead>Scanned At</TableHead>
                    <TableHead>Distance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        Waiting for student check-ins...
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-semibold text-sm">{log.name}</TableCell>
                        <TableCell className="font-mono text-xs">{log.matricNumber}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(log.scannedAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="text-xs">
                          {log.distanceMeters !== undefined ? `${log.distanceMeters}m` : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
