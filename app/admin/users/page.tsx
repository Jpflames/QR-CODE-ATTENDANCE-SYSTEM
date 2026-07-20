"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UsersIcon } from "lucide-react";

export default function UserDirectoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Directory</h2>
          <p className="text-sm text-muted-foreground">
            Manage students, lecturers, and administrative staff accounts.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <CardTitle>Directory Management</CardTitle>
              <CardDescription>This feature is currently under development.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            Coming soon in the next update.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
