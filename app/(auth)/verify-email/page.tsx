"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { QrCodeIcon, MailOpenIcon, ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
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
              Verify your email
            </CardTitle>
            <CardDescription className="text-center">
              A verification link has been dispatched to your email.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <MailOpenIcon className="size-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Action required</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Please open your inbox, click the verification link, and then log back in to your dashboard.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link
              href="/login"
              className="w-full h-11 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 gap-2 text-sm font-medium transition-all"
            >
              Continue to login
              <ArrowRightIcon className="size-4" />
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
