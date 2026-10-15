import { redirect } from "next/navigation";
import { VerifyIndexClient } from "./verify-index-client";

interface VerifyIndexPageProps {
  searchParams: Promise<{ code?: string }>;
}

export const metadata = {
  title: "Pusat Verifikasi Sertifikat Resmi | PT. Matoh Technologies Indonesia",
  description:
    "Layanan resmi validasi dan verifikasi keaslian sertifikat digital serta transkrip akademik lulusan PT. Matoh Technologies Indonesia.",
};

export default async function VerifyIndexPage({ searchParams }: VerifyIndexPageProps) {
  const { code } = await searchParams;

  // If code query param is present, redirect directly to the specific verification page
  if (code && code.trim()) {
    redirect(`/verify/${encodeURIComponent(code.trim().toUpperCase())}`);
  }

  return <VerifyIndexClient />;
}
