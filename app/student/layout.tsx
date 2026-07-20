"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  HistoryIcon,
  QrCodeIcon,
  UserIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  ScanIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDeviceFingerprint } from "@/utils/fingerprint";
import { updateStudentFingerprint } from "@/app/actions/student";

const navItems = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboardIcon },
  { name: "Course Registration", href: "/student/courses", icon: BookOpenIcon },
  { name: "Scan QR Code", href: "/student/scan", icon: ScanIcon },
  { name: "Attendance History", href: "/student/history", icon: HistoryIcon },
  { name: "My Profile", href: "/student/profile", icon: UserIcon },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session?.user;

  // Initialize and sync client device fingerprint on mount
  useEffect(() => {
    if (user?.id) {
      getDeviceFingerprint().then((fp) => {
        updateStudentFingerprint(user.id, fp);
      });
    }
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r bg-card border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
              <QrCodeIcon className="size-5" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              QRAttend <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-mono">Student</span>
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground lg:hidden"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="size-9 border border-border">
              <AvatarImage src={user?.image || undefined} alt={user?.name || "Student"} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-sm font-semibold truncate">{user?.name || "Student"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive shrink-0"
            title="Log out"
          >
            <LogOutIcon className="size-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg border border-border lg:hidden hover:bg-muted"
            >
              <MenuIcon className="size-5" />
            </button>
            <h1 className="font-semibold text-lg hidden sm:block">Student Attendance Portal</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick QR Scanner Action */}
            <Link
              href="/student/scan"
              className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-4 text-xs font-semibold shadow-md shadow-primary/20 transition-all"
            >
              <ScanIcon className="size-4" />
              Scan Attendance QR
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full size-9"
            >
              <SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-muted/20">{children}</main>
      </div>
    </div>
  );
}
