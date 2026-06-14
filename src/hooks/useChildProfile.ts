"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ChildProfile,
  clearChildProfile,
  getChildProfile,
  setChildProfile,
} from "@/lib/childProfile";

/**
 * Reads/writes the child's profile (name + chosen mascot).
 *
 * `profile` is `undefined` while loading from localStorage on mount, and
 * `null` once loaded if no profile has been saved yet.
 */
export function useChildProfile() {
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

  return {
    profile,
    isLoading: profile === undefined,
    setProfile,
    clearProfile,
  };
}
