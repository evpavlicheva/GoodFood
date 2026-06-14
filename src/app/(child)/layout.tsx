"use client";

import { usePathname } from "next/navigation";
import Mascot from "@/components/mascot/Mascot";
import ChildNav from "@/components/layout/ChildNav";
import { useChildProfile } from "@/hooks/useChildProfile";

/**
 * Shared layout for all "child" screens. Shows a persistent top nav bar
 * (so kids can always jump to Home/Menu/Cart/Orders or hop into Parent
 * Mode) and keeps the chosen mascot gently floating in the corner —
 * except on the setup screen, where the mascot is already the star of
 * the show and there's no profile yet to navigate with.
 */
export default function ChildLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useChildProfile();
  const showChrome = pathname !== "/setup" && !!profile;

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
