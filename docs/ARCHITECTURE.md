# Enterprise QR Code Attendance Management System - System Architecture & Security Manual

## 1. Overview & Core Philosophy
The Enterprise QR Code Attendance Management System is a production-grade, secure, multi-tenant academic and institutional attendance platform. It is engineered to withstand proxy attendance attempts, tampered QR codes, out-of-bounds check-ins, and credential brute-force attacks.

---

## 2. Technology Stack

### Frontend & Application Layer
- **Framework**: Next.js 15+ (App Router)
- **Runtime**: React 19 Engine
- **Language**: TypeScript (Strict Mode)
- **Styling & UI Components**: Tailwind CSS v4, `shadcn/ui`, Framer Motion animations
- **Camera Scanning**: `html5-qrcode`
- **Charts & Visualizations**: Recharts
- **Iconography**: Lucide Icons

### Database Layer
- **Database Engine**: MongoDB Atlas
- **ODM**: Mongoose 8+
- **Connection**: Serverless cached connection pooling with index optimization.

### Authentication & Authorization
- **Auth Provider**: Better Auth (MongoDB Adapter)
- **Lockout Policy**: Progressive Account Lockout (5 consecutive failed attempts locks account for 15 minutes)
- **Role Hierarchy**: `super_admin` > `institution_admin` > `lecturer` > `student`

---

## 3. Anti-Proxy QR Security Engine

```
+------------------+         HMAC-SHA256         +----------------------+
| Lecturer Screen  | --------------------------> | Student Device Scan  |
| Rotates QRs 30s  |                             | GPS + Fingerprint    |
+------------------+                             +----------------------+
         |                                                  |
         +------------------- Verification -----------------+
                                     |
                                     v
                        1. Signature Check (HMAC)
                        2. Hash Check (SHA256)
                        3. Expiration Check (30s)
                        4. Geofence Bounds (Haversine <= 100m)
                        5. Duplicate Scan Check (Unique Index)
```

1. **HMAC SHA-256 Signing**: Every 30 seconds, the lecturer's session generates a cryptographically signed payload using `JWT_SECRET`.
2. **SHA-256 Hash Verification**: Any alteration to the QR payload invalidates the SHA-256 checksum.
3. **Short Expiration Window**: QR codes expire within 30 seconds to prevent students from sharing screenshot photos with absent peers.
4. **Haversine Geofencing**: Computes physical distance between student GPS coordinates and classroom GPS coordinates; check-ins exceeding 100 meters are rejected.
5. **Hardware Fingerprinting**: Captures client canvas & device signature to block proxy devices.
6. **Compound Database Constraints**: MongoDB unique compound index `(sessionId, studentId)` guarantees zero duplicate check-ins.

---

## 4. Deployment Instructions

### Local Development
```bash
npm install
npm run dev
```

### Seeding Initial Data
Navigate to `GET http://localhost:3000/api/seed` in your browser or Postman to initialize roles, default institution (Antigravity University), and departments.

### Production Docker Deployment
```bash
docker-compose up -d --build
```
