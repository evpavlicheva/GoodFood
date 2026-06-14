"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Mascot from "@/components/mascot/Mascot";
import ChildNav from "@/components/layout/ChildNav";
import { useChildProfile } from "@/hooks/useChildProfile";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Shared layout for all "child" screens. Shows a persistent top nav bar
 * (so kids can always jump to Home/Menu/Cart/Orders or hop into Parent
 * Mode) and keeps the chosen mascot gently floating in the corner —
 * except on the setup screen, where the mascot is already the star of
 * the show and there's no profile yet to navigate with.
 *
 * The child profile (name + mascot) lives in this browser's localStorage,
 * so a fresh device/browser won't have one yet. If someone lands directly
 * on e.g. /menu or /cart without a profile, redirect to /setup first —
 * otherwise the nav bar stays hidden (no way to reach the cart) and orders
 * would be placed under the generic "Friend" name instead of the child's
 * real name.
 */
export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, isLoading } = useChildProfile();
  const showChrome = pathname !== "/setup" && !!profile;

  useEffect(() => {
    if (!isLoading && !profile && pathname !== "/setup") {
      router.replace("/setup");
    }
  }, [isLoading, profile, pathname, router]);

  if (pathname !== "/setup" && (isLoading || !profile)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Mascot emotion="thinking" message={t("common.loading")} size="lg" />
      </main>
    );
  }

  return (
    <div className="relative">
      {showChrome && <ChildNav />}
      {children}

      {showChrome && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
          <Mascot mascotId={profile!.mascotId} emotion="idle" message={null} size="sm" />
        </div>
      )}
    </div>
  );
}
