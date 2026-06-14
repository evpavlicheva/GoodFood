"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  type ChildProfile,
  clearChildProfile,
  getChildProfile,
  setChildProfile,
} from "@/lib/childProfile";

interface ChildProfileContextValue {
  profile: ChildProfile | null | undefined;
  isLoading: boolean;
  setProfile: (next: ChildProfile) => void;
  clearProfile: () => void;
}

const ChildProfileContext = createContext<ChildProfileContextValue | null>(null);

/**
 * Shared child profile (name + mascot), backed by localStorage.
 *
 * This used to be a plain hook with its own `useState`, so every page that
 * called it held its own independent copy of the profile. Saving the
 * profile on /setup updated that page's copy but not the one held by the
 * shared (child) layout, which kept thinking no profile existed and bounced
 * the user straight back to /setup — an infinite loop. A single provider at
 * the app root keeps every page in sync.
 */
export function ChildProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ChildProfile | null | undefined>(undefined);

  useEffect(() => {
    setProfileState(getChildProfile());
  }, []);

  const setProfile = useCallback((next: ChildProfile) => {
    setChildProfile(next);
    setProfileState(next);
  }, []);

  const clearProfile = useCallback(() => {
    clearChildProfile();
    setProfileState(null);
  }, []);

  return (
    <ChildProfileContext.Provider
      value={{ profile, isLoading: profile === undefined, setProfile, clearProfile }}
    >
      {children}
    </ChildProfileContext.Provider>
  );
}

export function useChildProfile() {
  const ctx = useContext(ChildProfileContext);
  if (!ctx) throw new Error("useChildProfile must be used within a ChildProfileProvider");
  return ctx;
}
