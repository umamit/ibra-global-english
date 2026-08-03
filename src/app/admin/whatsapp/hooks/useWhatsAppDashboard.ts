"use client";

import { useState, useEffect, useCallback } from "react";

export interface DeviceStatus {
  connected: boolean;
  reason?: string;
  device?: { device?: string; name?: string };
}

export interface LogItem {
  timestamp: string;
  type: string;
  phone: string;
  status: string;
  message?: string;
  raw?: string;
}

export interface Stats {
  total: number;
  today: number;
  sent: number;
  simulated: number;
  failed: number;
}

export interface Contact {
  name: string;
  phone: string;
  source: string;
}

export function useWhatsAppDashboard() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [deviceLoading, setDeviceLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, sent: 0, simulated: 0, failed: 0 });
  const [logsLoading, setLogsLoading] = useState<boolean>(true);
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentContacts, setRecentContacts] = useState<string[]>([]);
  const [showContactPicker, setShowContactPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchDeviceStatus = useCallback(async () => {
    setDeviceLoading(true);
    try {
      const res = await fetch("/api/whatsapp-simulator?action=device");
      const data = await res.json();
      setDeviceStatus(data);
    } catch {
      setDeviceStatus({ connected: false, reason: "Gagal terhubung ke server." });
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/whatsapp-simulator");
      const data = await res.json();
      setLogs(data.logs || []);
      if (data.stats) setStats(data.stats);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp-simulator?action=contacts");
      const data = await res.json();
      if (data.contacts) setContacts(data.contacts);
    } catch (err) {
      console.error("Gagal mengambil kontak:", err);
    }
  }, []);

  const handleSelectContact = (num: string) => {
    const cleanNum = num.trim().replace(/[^0-9]/g, "");
    if (!cleanNum) return;
    let currentPhones = phone.split(",").map((p) => p.trim()).filter(Boolean);
    if (currentPhones.includes(cleanNum)) {
      currentPhones = currentPhones.filter((p) => p !== cleanNum);
    } else {
      currentPhones.push(cleanNum);
    }
    setPhone(currentPhones.join(", "));
  };

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) return;
    setSending(true); setSendResult(null);
    try {
      const res = await fetch("/api/whatsapp-simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), message: message.trim(), type: "manual" }),
      });
      const data = await res.json();
      setSendResult(data);
      if (data.success) {
        const cleanNumbers = phone.split(",").map((n) => n.trim().replace(/[^0-9]/g, "")).filter((n) => n.length >= 9);
        let updatedRecent = [...recentContacts];
        cleanNumbers.forEach((num) => {
          updatedRecent = updatedRecent.includes(num) ? [num, ...updatedRecent.filter((n) => n !== num)] : [num, ...updatedRecent];
        });
        updatedRecent = updatedRecent.slice(0, 15);
        setRecentContacts(updatedRecent);
        localStorage.setItem("recent_manual_wa_numbers", JSON.stringify(updatedRecent));
        setPhone(""); setMessage("");
        fetchLogs();
      }
    } catch (err: any) {
      setSendResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const term = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.phone.includes(term);
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      fetchDeviceStatus(); fetchLogs(); fetchContacts();
      const stored = JSON.parse(localStorage.getItem("recent_manual_wa_numbers") || "[]");
      setRecentContacts(stored);
    };
    load();
    return () => { cancelled = true; };
  }, [fetchDeviceStatus, fetchLogs, fetchContacts]);

  return {
    deviceStatus, deviceLoading, logs, stats, logsLoading,
    phone, setPhone, message, setMessage, sending, sendResult,
    contacts, recentContacts, showContactPicker, setShowContactPicker,
    searchQuery, setSearchQuery, filteredContacts,
    fetchDeviceStatus, fetchLogs, fetchContacts,
    handleSelectContact, handleSendManual,
  };
}
