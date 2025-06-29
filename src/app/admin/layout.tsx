import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-64 bg-white shadow-lg">
        <AdminSidebar />
      </div>
      <div className="flex-1">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
} 