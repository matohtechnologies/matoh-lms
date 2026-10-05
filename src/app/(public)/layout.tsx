import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameEn: true,
        slug: true,
        icon: true,
        _count: {
          select: {
            courses: { where: { published: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }).catch(() => []),
  ]);

  return (
    <div className="min-h-screen flex flex-col print:min-h-0 print:block">
      <div className="print:hidden">
        <Navbar user={session?.user} categories={categories} />
      </div>
      <main className="flex-1 print:flex-none print:p-0 print:m-0">{children}</main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
