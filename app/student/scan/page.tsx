"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import {
  CameraIcon,
  CheckCircle2Icon,
  AlertOctagonIcon,
  MapPinIcon,
  Loader2Icon,
  RotateCcwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDeviceFingerprint } from "@/utils/fingerprint";

export default function StudentScanPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [location, setLocation] = useState<{ lat?: number; lon?: number }>({});
  const [locationError, setLocationError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = "qr-reader-viewport";

  // Request client GPS location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation access denied or unavailable:", err.message);
          setLocationError("GPS Location disabled. Enable location for geofence validation.");
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  const startScanner = async () => {
    setIsScanning(true);
    setScanResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      }

      await scannerRef.current.start(
        { facingMode: "environment" }, // Prefer rear camera on mobile
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Pause scanning while processing result
          if (scannerRef.current?.isScanning) {
            await scannerRef.current.stop();
          }
          setIsScanning(false);
          await processScanPayload(decodedText);
        },
        () => {
          // Ignore frame decode errors
        }
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      toast.error("Failed to start camera scanner. Please grant camera permissions.");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const processScanPayload = async (payloadText: string) => {
    if (!userId) {
      toast.error("Authentication required to record attendance");
      return;
    }

    setIsProcessing(true);
    try {
      const fingerprint = await getDeviceFingerprint();

      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: payloadText,
          studentUserId: userId,
          deviceFingerprint: fingerprint,
          latitude: location.lat,
          longitude: location.lon,
        }),
      });

      const json = await res.json();
      setIsProcessing(false);

      if (res.ok && json.success) {
        toast.success(json.message);
        setScanResult({ success: true, message: json.message });
      } else {
        toast.error(json.error || "Attendance check-in failed");
        setScanResult({ success: false, message: json.error || "Attendance check-in failed" });
      }
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err.message || "An unexpected error occurred during scan processing");
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">QR Attendance Scanner</h2>
        <p className="text-sm text-muted-foreground">
          Point your device camera at the secure lecture QR code on display.
        </p>
      </div>

      {/* Camera Scanner Container */}
      <Card className="border-border shadow-md overflow-hidden">
        <CardHeader className="bg-card border-b border-border py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CameraIcon className="size-5 text-primary" />
            <CardTitle className="text-base">Camera Viewport</CardTitle>
          </div>
          {location.lat && (
            <span className="text-xs text-emerald-500 font-medium inline-flex items-center gap-1">
              <MapPinIcon className="size-3" /> GPS Active
            </span>
          )}
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[320px]">
          {/* Scanning Box Viewport */}
          <div
            id={readerElementId}
            className={`w-full max-w-sm rounded-2xl overflow-hidden bg-black/90 aspect-square border-2 border-dashed border-primary/40 ${
              !isScanning ? "hidden" : "block"
            }`}
          />

          {!isScanning && !isProcessing && !scanResult && (
            <div className="text-center space-y-4 py-8">
              <div className="mx-auto size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CameraIcon className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-base">Ready to Scan</p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Click the button below to activate your camera and scan the dynamic attendance QR code.
                </p>
              </div>
              <Button onClick={startScanner} className="gap-2 h-11 px-6 shadow-md shadow-primary/20">
                <CameraIcon className="size-4" />
                Activate Camera
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2Icon className="size-10 animate-spin text-primary" />
              <p className="font-semibold text-sm">Verifying Signature & Recording Attendance...</p>
            </div>
          )}

          {scanResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 text-center space-y-4"
            >
              <div
                className={`mx-auto size-16 rounded-full flex items-center justify-center ${
                  scanResult.success
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {scanResult.success ? (
                  <CheckCircle2Icon className="size-10" />
                ) : (
                  <AlertOctagonIcon className="size-10" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg">
                  {scanResult.success ? "Check-in Successful!" : "Verification Failed"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {scanResult.message}
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" onClick={startScanner} className="gap-2">
                  <RotateCcwIcon className="size-4" />
                  Scan Again
                </Button>
                <Button onClick={() => router.push("/student/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </motion.div>
          )}

          {isScanning && (
            <Button variant="destructive" onClick={stopScanner} className="mt-4">
              Cancel Scanning
            </Button>
          )}

          {locationError && (
            <p className="text-xs text-amber-500 mt-4 text-center">{locationError}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
