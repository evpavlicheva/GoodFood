"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "goodfood:feature:coins";

interface FeatureFlagsContextValue {
  coinsEnabled: boolean;
  setCoinsEnabled: (val: boolean) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue>({
  coinsEnabled: true,
  setCoinsEnabled: () => {},
});

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [coinsEnabled, setCoinsEnabledState] = useState(true);

  // Read from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setCoinsEnabledState(stored === "true");
    } catch {
      // ignore
    }
  }, []);

  function setCoinsEnabled(val: boolean) {
    setCoinsEnabledState(val);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(val));
    } catch {
      // ignore
    }
  }

  return (
    <FeatureFlagsContext.Provider value={{ coinsEnabled, setCoinsEnabled }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}
