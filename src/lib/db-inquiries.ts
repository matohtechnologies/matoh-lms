import { prisma } from "@/lib/prisma";

let tableEnsured = false;

export async function ensureInquiriesTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "contact_inquiries" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "category" TEXT NOT NULL,
        "institution" TEXT,
        "message" TEXT NOT NULL,
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "repliedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "contact_inquiries_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "contact_inquiries_isRead_idx" ON "contact_inquiries"("isRead");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "contact_inquiries_createdAt_idx" ON "contact_inquiries"("createdAt");
    `);
    tableEnsured = true;
  } catch (err) {
    console.error("[ensureInquiriesTable] Error ensuring contact_inquiries table:", err);
  }
}
