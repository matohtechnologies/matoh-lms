import { redirect } from "next/navigation";

interface VerifyIndexPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function VerifyIndexPage({ searchParams }: VerifyIndexPageProps) {
  const { code } = await searchParams;

  if (code && code.trim()) {
    redirect(`/verify/${encodeURIComponent(code.trim().toUpperCase())}`);
  }

  redirect("/courses#verifikasi");
}
