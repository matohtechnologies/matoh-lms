# EarthyAcademy - Modern Production LMS Platform

Platform Learning Management System (LMS) modern dan minimalis yang terinspirasi oleh Dicoding dengan identitas visual bertema Earthy warm tones, dirancang siap untuk tahap produksi (*production-ready*).

---

## ✨ Fitur Utama

- **Katalog Kelas Komprehensif (`/courses`)**:
  - Filter kategori, tingkat kesulitan (Pemula, Menengah, Mahir), dan pengurutan (Terpopuler, Terbaru, Rating, Harga).
  - Pencarian real-time dengan URL params sinkronisasi.
- **Halaman Detail Kelas Interaktif (`/courses/[slug]`)**:
  - Kurikulum silabus multi-seksi dengan penanda preview gratis & lock materi.
  - Kartu harga sticky responsif dengan kalkulasi diskon otomatis.
  - Profil instruktur dan ulasan bintang dari siswa.
- **Integrasi Pembayaran Midtrans Snap (`/checkout/[courseId]`)**:
  - Dukungan kelas gratis (langsung terdaftar) dan kelas berbayar.
  - Alur pembayaran Midtrans Snap SDK terenkripsi.
- **Ruang Belajar Siswa (`/learn/[courseId]`)**:
  - Video player, daftar kurikulum checklist materi, toggle materi selesai, dan navigasi antarmateri.
- **Autentikasi & Otorisasi Lengkap**:
  - Role-based access control (User / Pelajar, Instruktur, Admin).
  - NextAuth.js v5 dengan Credentials (email/password terenkripsi bcrypt) dan Google OAuth.
- **Dashboard Siswa (`/dashboard`)**:
  - Kelas saya, statistik progres belajar, riwayat transaksi, dan sertifikat kelulusan.
- **Admin Panel (`/admin`)**:
  - Manajemen kelas, analitik pendapatan, dan daftar pengguna.
- **Dukungan Multi-bahasa (i18n)**:
  - Bahasa Indonesia (ID) & English (EN) menggunakan `next-intl`.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, custom Warm Earthy theme palette (Amber/Terracotta/Stone), Plus Jakarta Sans typography
- **ORM & Database**: Prisma ORM v5 (PostgreSQL ready + graceful in-memory demo fallback)
- **Icons**: Lucide React + custom inline SVG icons
- **Payment Gateway**: Midtrans Snap Gateway
- **Auth**: NextAuth.js v5 (JWT session strategy, bcrypt hashing)
- **Form & Validasi**: React Hook Form, Zod

---

## 🚀 Memulai (Quick Start)

### 1. Prasyarat
- Node.js >= 18.x
- PostgreSQL (opsional untuk dev, aplikasi otomatis memuat demo data jika DB belum aktif)

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan variabel berikut:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/lms_platform?schema=public"
AUTH_SECRET="dev-secret-key-change-in-production"
AUTH_URL="http://localhost:3000"
MIDTRANS_SERVER_KEY="SB-Mid-server-xxxxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
MIDTRANS_IS_PRODUCTION="false"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-xxxxx"
```

### 4. Database Setup (Bila menggunakan PostgreSQL)
```bash
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 👤 Akun Bawaan (Default Seed Credentials)

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@earthyacademy.com` | `Admin@123456` |
| **Instruktur** | `ahmad@earthyacademy.com` | `Instructor@123` |
| **Pelajar** | `user@earthyacademy.com` | `User@123456` |

---

## 📦 Build untuk Production

```bash
npm run build
npm run start
```
Aplikasi sudah terverifikasi bebas dari error TypeScript (`npx tsc --noEmit`) dan siap di-deploy ke Vercel, Railway, Coolify, atau server VPS.
