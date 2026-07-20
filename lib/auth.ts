import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { createAuthMiddleware, APIError } from "better-auth/api";

import { connectToDatabase } from "./mongodb";
import { User } from "../models/User";
import { AuditLog } from "../models/AuditLog";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/dummy";
const client = new MongoClient(MONGODB_URI);
const db = client.db();

const getBaseURL = () => {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
    usePlural: false,
  }),
  secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_development_only_please_change_in_production",
  emailAndPassword: {
    enabled: true,
    autoSignIn: false, // Require manual sign in (allows verification checks)
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
      institutionId: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
      failedLoginAttempts: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
      lockoutUntil: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as any;
        if (!body || !body.email) return;

        await connectToDatabase();
        const user = await User.findOne({ email: body.email.toLowerCase() });

        if (user) {
          if (user.status === "locked") {
            if (user.lockoutUntil && user.lockoutUntil > new Date()) {
              const diffMs = user.lockoutUntil.getTime() - Date.now();
              const diffMin = Math.ceil(diffMs / 60000);
              throw new APIError("UNAUTHORIZED", {
                message: `Account is temporarily locked. Try again in ${diffMin} minute(s).`,
              });
            } else {
              // Lock period expired, unlock automatically
              user.status = "active";
              user.failedLoginAttempts = 0;
              user.lockoutUntil = undefined;
              await user.save();
            }
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as any;
        if (!body || !body.email) return;

        await connectToDatabase();
        
        const ip = (ctx.headers as any)?.get("x-forwarded-for") || "127.0.0.1";
        const userAgent = (ctx.headers as any)?.get("user-agent") || "unknown";
        const user = await User.findOne({ email: body.email.toLowerCase() });

        if (!user) return;

        // Check if there was an error in the response
        const response = ctx.context.returned as any;
        const hasError = response && (response.status >= 400 || response.body?.error || response.body?.code);

        if (hasError) {
          // Increment failed attempts
          user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
          
          if (user.failedLoginAttempts >= 5) {
            user.status = "locked";
            user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lockout
          }
          await user.save();

          // Log Audit Trail for failure
          await AuditLog.create({
            userId: user._id,
            action: "LOGIN",
            status: "FAILURE",
            details: `Failed login attempt. Count: ${user.failedLoginAttempts}. Status: ${user.status}`,
            ipAddress: ip,
            userAgent,
          });
        } else {
          // Reset failed attempts on success
          user.failedLoginAttempts = 0;
          user.status = "active";
          user.lockoutUntil = undefined;
          await user.save();

          // Log Audit Trail for success
          await AuditLog.create({
            userId: user._id,
            action: "LOGIN",
            status: "SUCCESS",
            details: "User logged in successfully",
            ipAddress: ip,
            userAgent,
          });
        }
      }
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session age every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes caching
    },
  },
  trustedOrigins: [
    getBaseURL(),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    process.env.NEXT_PUBLIC_APP_URL || ""
  ].filter(Boolean),
  baseURL: getBaseURL(),
});
