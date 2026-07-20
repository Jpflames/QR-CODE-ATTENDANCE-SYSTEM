"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { QrCodeIcon, Loader2Icon, MailIcon, ArrowLeftIcon } from "lucide-react";

import { forgotPasswordSchema, ForgotPasswordInput } from "@/validators/auth";
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

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      // Better Auth forgetPassword API call
      // In newer versions, this maps to requestPasswordReset or forgetPassword
      const clientAny = authClient as any;
      const resetFn = clientAny.forgetPassword || clientAny.requestPasswordReset;
      
      if (!resetFn) {
        throw new Error("Reset password function not found on authentication client.");
      }

      await resetFn({
        email: data.email.toLowerCase(),
        redirectTo: `${window.location.origin}/reset-password`,
      }, {
        onSuccess: () => {
          setIsSent(true);
          toast.success("Password reset email sent! Check your inbox.");
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message || "Failed to process request");
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
      setIsLoading(false);
    }
  };

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
              Forgot password?
            </CardTitle>
            <CardDescription className="text-center">
              No worries, we&apos;ll send you instructions to reset it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSent ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@institution.edu"
                    className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-medium mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full mt-2 h-11" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MailIcon className="size-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We sent a password reset link to your email address.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 font-medium"
            >
              <ArrowLeftIcon className="size-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
