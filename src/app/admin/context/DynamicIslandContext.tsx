"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";

export type DynamicIslandType = "success" | "error" | "loading" | "info";

export interface DynamicIslandData {
  title: string;
  message?: string;
  type?: DynamicIslandType;
  duration?: number;
}

interface DynamicIslandContextValue {
  show: (data: DynamicIslandData) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  loading: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: () => void;
  current: DynamicIslandData | null;
  visible: boolean;
}

const DynamicIslandContext = createContext<DynamicIslandContextValue | undefined>(undefined);

export function DynamicIslandProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = useState<DynamicIslandData | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => setCurrent(null), 300);
  }, []);

  const show = useCallback((data: DynamicIslandData) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(data);
    setVisible(true);

    if (data.type !== "loading") {
      const duration = data.duration ?? 3500;
      timerRef.current = setTimeout(() => {
        dismiss();
      }, duration);
    }
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => {
    show({ title, message, type: "success" });
  }, [show]);

  const error = useCallback((title: string, message?: string) => {
    show({ title, message, type: "error" });
  }, [show]);

  const loading = useCallback((title: string, message?: string) => {
    show({ title, message, type: "loading" });
  }, [show]);

  const info = useCallback((title: string, message?: string) => {
    show({ title, message, type: "info" });
  }, [show]);

  return (
    <DynamicIslandContext.Provider
      value={{
        show,
        success,
        error,
        loading,
        info,
        dismiss,
        current,
        visible,
      }}
    >
      {children}
    </DynamicIslandContext.Provider>
  );
}

export function useDynamicIsland() {
  const context = useContext(DynamicIslandContext);
  if (!context) {
    throw new Error("useDynamicIsland must be used within a DynamicIslandProvider");
  }
  return context;
}
