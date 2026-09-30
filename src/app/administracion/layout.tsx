import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminSidebar } from "@/features/admin/admin-sidebar";
import { siteConfig } from "@/lib/site-config";

export default async function AdministracionLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <AdminSidebar
        brandName={siteConfig.companyName}
        userEmail={session.user.email ?? ""}
        signOutAction={handleSignOut}
      />
      <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[90rem]">{children}</div>
      </main>
    </div>
  );
}
