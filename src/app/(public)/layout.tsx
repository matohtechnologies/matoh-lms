import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen flex flex-col print:min-h-0 print:block">
      <div className="print:hidden">
        <Navbar user={session?.user} />
      </div>
      <main className="flex-1 print:flex-none print:p-0 print:m-0">{children}</main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
