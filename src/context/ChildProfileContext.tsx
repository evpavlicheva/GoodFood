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
  getSavedProfiles,
  removeSavedProfile,
  setChildProfile,
} from "@/lib/childProfile";

interface ChildProfileContextValue {
  profile: ChildProfile | null | undefined;
  isLoading: boolean;
  /** Every profile ever set up on this device (most recently used first). */
  savedProfiles: ChildProfile[];
  setProfile: (next: ChildProfile) => void;
  clearProfile: () => void;
  /** Switch the active profile to one of `savedProfiles` without retyping anything. */
  switchProfile: (next: ChildProfile) => void;
  /**
   * Remove a profile from `savedProfiles` (by name). If it's the currently
   * active profile, also clears the active profile so the app falls back to
   * /setup.
   */
  removeProfile: (name: string) => void;
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
 *
 * Also tracks every profile ever set up on this device (`savedProfiles`) so
 * siblings sharing a tablet can switch back to a previous profile instantly
 * via `switchProfile`, without retyping their name/buddy.
 */
export function ChildProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<ChildProfile | null | undefined>(undefined);
  const [savedProfiles, setSavedProfiles] = useState<ChildProfile[]>([]);

  useEffect(() => {
    setProfileState(getChildProfile());
    setSavedProfiles(getSavedProfiles());
  }, []);

  const setProfile = useCallback((next: ChildProfile) => {
    setChildProfile(next);
    setProfileState(next);
    setSavedProfiles(getSavedProfiles());
  }, []);

  const clearProfile = useCallback(() => {
    clearChildProfile();
    setProfileState(null);
  }, []);

  const switchProfile = useCallback((next: ChildProfile) => {
    setChildProfile(next);
    setProfileState(next);
    setSavedProfiles(getSavedProfiles());
  }, []);

  const removeProfile = useCallback((name: string) => {
    removeSavedProfile(name);
    setSavedProfiles(getSavedProfiles());
    setProfileState((current) => {
      if (current && current.name.trim().toLowerCase() === name.trim().toLowerCase()) {
        clearChildProfile();
        return null;
      }
      return current;
    });
  }, []);

  return (
    <ChildProfileContext.Provider
      value={{
        profile,
        isLoading: profile === undefined,
        savedProfiles,
        setProfile,
        clearProfile,
        switchProfile,
        removeProfile,
      }}
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
