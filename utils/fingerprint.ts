/**
 * Client-side browser & device fingerprinting helper to generate a 
 * consistent, hash-based device identifier for anti-proxy scan validation.
 */
export async function getDeviceFingerprint(): Promise<string> {
  if (typeof window === "undefined") return "server-side";

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "unknown",
    getCanvasFingerprint(),
  ];

  const rawString = components.join("||");
  return await sha256(rawString);
}

/**
 * Generates a canvas-based rendering signature
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("QRAttend-Fingerprint-v1", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("QRAttend-Fingerprint-v1", 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return "canvas-error";
  }
}

/**
 * Utility to compute SHA-256 hash using standard Web Crypto API
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
