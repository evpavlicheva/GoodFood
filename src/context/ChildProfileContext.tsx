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
   * active profile, switch to the next saved profile (if any) so the user
   * stays on the current screen; only falls back to /setup if no profiles
   * remain.
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

  const removeProfile = useCallback(
    (name: string) => {
      removeSavedProfile(name);
      const remaining = getSavedProfiles();
      setSavedProfiles(remaining);

      const isActive = profile && profile.name.trim().toLowerCase() === name.trim().toLowerCase();
      if (!isActive) return;

      if (remaining.length > 0) {
        // Removed the active profile but others remain — switch to the next
        // one in the list so the user stays on the current screen instead
        // of being bounced to /setup.
        setChildProfile(remaining[0]);
        setProfileState(remaining[0]);
      } else {
        // No profiles left on this device — fall back to /setup.
        clearChildProfile();
        setProfileState(null);
      }
    },
    [profile]
  );

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
