"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { QrCodeIcon, Loader2Icon, EyeIcon, EyeOffIcon, KeyIcon } from "lucide-react";

import { resetPasswordSchema, ResetPasswordInput } from "@/validators/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Invalid password reset request. Missing token.");
      return;
    }

    setIsLoading(true);
    try {
      const resetFn = authClient.resetPassword || (authClient as any).resetPassword;
      if (!resetFn) {
        throw new Error("Reset password function not found on authentication client.");
      }

      await resetFn({
        newPassword: data.password,
        token: token,
      }, {
        onSuccess: () => {
          toast.success("Password reset successfully! Please log in with your new password.");
          router.push("/login");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to reset password. The link may have expired.");
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <KeyIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">Invalid Reset Request</h3>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing a secure token. Please request a new link.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full mt-2 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 text-sm font-medium transition-all"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={errors.password ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            {...register("password")}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive pr-10" : "pr-10"}
            {...register("confirmPassword")}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-destructive font-medium mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full mt-2 h-11" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2Icon className="mr-2 size-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Save New Password"
        )}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-muted/50 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <QrCodeIcon className="size-8" />
          </div>
          <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            QRAttend
          </span>
        </div>

        <Card className="border-muted/60 shadow-xl backdrop-blur-md bg-card/90">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Reset your password
            </CardTitle>
            <CardDescription className="text-center">
              Please enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Wrap form inside Suspense because it uses useSearchParams */}
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2Icon className="size-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground mt-2">Loading security details...</span>
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground font-medium"
            >
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
