"use client";

import { useEffect } from "react";
import { useDynamicIsland } from "../context/DynamicIslandContext";

interface RealtimeToastProps {
  newRegToast: string;
  setNewRegToast: (v: string) => void;
  newTestToast: string;
  setNewTestToast: (v: string) => void;
}

export default function AdminRealtimeToasts({
  newRegToast,
  setNewRegToast,
  newTestToast,
  setNewTestToast,
}: RealtimeToastProps) {
  const island = useDynamicIsland();

  useEffect(() => {
    if (newRegToast) {
      island.show({
        title: "Pendaftaran Siswa Baru!",
        message: newRegToast,
        type: "info",
        duration: 5000,
      });
      setNewRegToast("");
    }
  }, [newRegToast, island, setNewRegToast]);

  useEffect(() => {
    if (newTestToast) {
      island.show({
        title: "Tes Penempatan Baru!",
        message: newTestToast,
        type: "info",
        duration: 5000,
      });
      setNewTestToast("");
    }
  }, [newTestToast, island, setNewTestToast]);

  return null;
}
