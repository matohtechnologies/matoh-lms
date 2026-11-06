import { redirect } from "next/navigation";
import { getAllPublications } from "@/lib/publications";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const publications = getAllPublications();
  return publications.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/publikasi/${slug}`);
}

