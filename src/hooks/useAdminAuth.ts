"use client";

import { useCallback, useEffect, useState } from "react";
import { ADMIN_PIN, isAdminAuthenticated, setAdminAuthenticated } from "@/lib/adminAuth";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
  }, []);

  const login = useCallback((pin: string): boolean => {
    const ok = pin.trim() === ADMIN_PIN;
    if (ok) {
      setAdminAuthenticated(true);
      setIsAuthenticated(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setAdminAuthenticated(false);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    isLoading: isAuthenticated === undefined,
    login,
    logout,
  };
}
