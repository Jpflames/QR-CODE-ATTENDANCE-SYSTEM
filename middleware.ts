import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter for development/single-instance production
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 100; // 100 requests
const WINDOW_MS = 60 * 1000; // 1 minute window

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > LIMIT;
}

export async function middleware(req: NextRequest) {
  // Try to safely access the NextRequest ip property which is sometimes present on extended requests
  const ip = req.headers.get("x-forwarded-for") || (req as NextRequest & { ip?: string }).ip || "127.0.0.1";
  
  // 1. Rate Limiting (apply to API routes)
  if (req.nextUrl.pathname.startsWith("/api") && !req.nextUrl.pathname.startsWith("/api/auth/get-session")) {
    if (isRateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // 2. Fetch Better Auth Session using the API endpoint
  interface SessionData {
    user?: {
      role?: string;
      [key: string]: unknown;
    };
  }
  let session: SessionData | null = null;
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    // Note: We perform a standard fetch to the local API
    const sessionRes = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: cookieHeader,
      },
      next: { revalidate: 0 }, // Do not cache session checks
    });

    if (sessionRes.ok) {
      session = await sessionRes.json() as SessionData;
    }
  } catch (error) {
    console.error("Middleware session verification error:", error);
  }

  const { pathname } = req.nextUrl;
  const user = session?.user;

  // 3. Authorization and Route Protection
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password");
  const isStudentRoute = pathname.startsWith("/student");
  const isLecturerRoute = pathname.startsWith("/lecturer");
  const isAdminRoute = pathname.startsWith("/admin");

  // Redirect unauthenticated users
  if ((isStudentRoute || isLecturerRoute || isAdminRoute) && !user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users trying to access auth pages (login/register)
  if (isAuthRoute && user) {
    if (user.role === "super_admin" || user.role === "institution_admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    } else if (user.role === "lecturer") {
      return NextResponse.redirect(new URL("/lecturer/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }
  }

  // Role Checks
  if (isStudentRoute && user?.role !== "student") {
    return NextResponse.redirect(new URL(getRedirectUrl(user?.role), req.url));
  }

  if (isLecturerRoute && user?.role !== "lecturer") {
    return NextResponse.redirect(new URL(getRedirectUrl(user?.role), req.url));
  }

  if (isAdminRoute && user?.role !== "super_admin" && user?.role !== "institution_admin") {
    return NextResponse.redirect(new URL(getRedirectUrl(user?.role), req.url));
  }

  // 4. Apply Security Headers (Helmet headers equivalent)
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Set permissions policy to allow camera (essential for QR code scanning) and geolocation
  response.headers.set("Permissions-Policy", "camera=(self), geolocation=(self)");
  
  // Clean Content-Security-Policy (Allow local operations and standard external integrations)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com; media-src 'self' blob:; connect-src 'self' https://api.cloudinary.com; frame-src 'self';"
  );

  return response;
}

function getRedirectUrl(role?: string): string {
  if (role === "super_admin" || role === "institution_admin") return "/admin/dashboard";
  if (role === "lecturer") return "/lecturer/dashboard";
  return "/student/dashboard";
}

export const config = {
  // Apply middleware to all paths except static files, public images, and auth api handler itself
  matcher: [
    "/((?!_next/static|_next/image|api/auth|api/seed|favicon.ico|public/).*)",
  ],
};
