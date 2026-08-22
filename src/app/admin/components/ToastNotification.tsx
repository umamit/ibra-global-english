"use client";

import { useEffect } from "react";
import { useDynamicIsland } from "../context/DynamicIslandContext";

interface Toast {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastNotificationProps {
  toast: Toast;
}

export default function ToastNotification({ toast }: ToastNotificationProps) {
  const island = useDynamicIsland();

  useEffect(() => {
    if (toast.show && toast.message) {
      if (toast.type === "success") {
        island.success(toast.message);
      } else if (toast.type === "error") {
        island.error(toast.message);
      } else {
        island.info(toast.message);
      }
    }
  }, [toast.show, toast.message, toast.type, island]);

  return null;
}
