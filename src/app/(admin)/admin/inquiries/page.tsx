import { Metadata } from "next";
import { InquiriesClient } from "./inquiries-client";

export const metadata: Metadata = {
  title: "Pesan Masuk & Konsultasi Calon Siswa | Matoh Admin",
};

export default function AdminInquiriesPage() {
  return <InquiriesClient />;
}
