"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLanguage } from "@/context/LanguageContext";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAdminAuth();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isLoginPage) {
      router.replace("/login");
    }
    if (isAuthenticated && isLoginPage) {
      router.replace("/menu-manager");
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cloud">
        <p className="font-heading text-lg font-bold text-eel-light">{t("common.loading")}</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cloud">
      <AdminNav />
      {children}
    </div>
  );
}
