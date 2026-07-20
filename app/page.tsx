import Link from "next/link";
import {
  QrCodeIcon,
  ShieldCheckIcon,
  MapPinIcon,
  UsersIcon,
  BookOpenIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  ScanIcon,
  BarChart3Icon,
  FingerprintIcon,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: QrCodeIcon,
      title: "Dynamic Rotating QR Codes",
      description: "HMAC-SHA256 signed QR codes that rotate every 30 seconds, making screenshot sharing impossible.",
      color: "text-primary bg-primary/10",
    },
    {
      icon: MapPinIcon,
      title: "Geofence Verification",
      description: "Haversine formula validates students are within 100m of the classroom before accepting check-ins.",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      icon: FingerprintIcon,
      title: "Device Fingerprinting",
      description: "Canvas and hardware signature verification ensures one student, one device, one scan.",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      icon: ShieldCheckIcon,
      title: "Anti-Proxy Protection",
      description: "Duplicate scan rejection, IP logging, and digital signature verification block all proxy attempts.",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      icon: BarChart3Icon,
      title: "Real-Time Analytics",
      description: "Live attendance dashboards with trend charts, exam eligibility tracking, and export reports.",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      icon: UsersIcon,
      title: "Multi-Role Architecture",
      description: "Dedicated portals for Admins, Lecturers, and Students with role-based access control.",
      color: "text-cyan-500 bg-cyan-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <QrCodeIcon className="size-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              QR<span className="text-primary">Attend</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center h-10 px-5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center h-10 px-5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20">
            <ShieldCheckIcon className="size-3.5" />
            Enterprise-Grade Security · Anti-Proxy Protection
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
            Secure QR Code{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              Attendance
            </span>{" "}
            System
          </h1>

          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Cryptographically signed, geofence-verified, and fingerprint-validated attendance tracking
            for universities, colleges, and institutions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all"
            >
              <ScanIcon className="size-5" />
              Create Account
              <ArrowRightIcon className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl text-base font-medium border border-border hover:bg-muted transition-colors"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            {["HMAC-SHA256 Signed", "30s QR Rotation", "GPS Geofencing", "Duplicate Blocked", "Audit Logged"].map(
              (badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5">
                  <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                  {badge}
                </span>
              )
            )}
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Built for Security. Designed for Scale.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Every layer is engineered to prevent proxy attendance, ensure data integrity, and deliver real-time insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}>
                  <Icon className="size-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role Portals CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              role: "Admin Portal",
              description: "Manage institutions, departments, courses, and import student rosters.",
              href: "/login",
              icon: ShieldCheckIcon,
              gradient: "from-primary to-primary/80",
            },
            {
              role: "Lecturer Portal",
              description: "Create lecture sessions, display dynamic QR codes, and track attendance live.",
              href: "/login",
              icon: BookOpenIcon,
              gradient: "from-emerald-500 to-emerald-600",
            },
            {
              role: "Student Portal",
              description: "Scan QR codes, view attendance progress, and track exam eligibility.",
              href: "/login",
              icon: ScanIcon,
              gradient: "from-purple-500 to-purple-600",
            },
          ].map((portal) => {
            const Icon = portal.icon;
            return (
              <Link
                key={portal.role}
                href={portal.href}
                className={`p-8 rounded-2xl bg-gradient-to-br ${portal.gradient} text-white shadow-lg hover:scale-[1.02] transition-all group`}
              >
                <Icon className="size-8 mb-4 opacity-90" />
                <h3 className="font-bold text-xl mb-2">{portal.role}</h3>
                <p className="text-sm text-white/80 leading-relaxed">{portal.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold opacity-90 group-hover:opacity-100">
                  Access Portal <ArrowRightIcon className="size-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <QrCodeIcon className="size-4 text-primary" />
            <span className="font-semibold text-foreground">QRAttend</span>
            <span>· Enterprise Attendance Management System</span>
          </div>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
