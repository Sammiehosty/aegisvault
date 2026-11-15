"use client";

import { createContext, useContext, type ReactNode } from "react";

const AppNameContext = createContext("AegisVault");

export function AppBrandProvider({ appName, children }: { appName: string; children: ReactNode }) {
  return <AppNameContext.Provider value={appName}>{children}</AppNameContext.Provider>;
}

export function useAppName() {
  return useContext(AppNameContext);
}
