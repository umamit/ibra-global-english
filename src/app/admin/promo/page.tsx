"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useDynamicIsland } from "../context/DynamicIslandContext";
import { PromoBannerItem, PromoBannerList } from "./components/PromoBannerList";
import { PromoBannerModal } from "./components/PromoBannerModal";

export default function AdminPromoPage() {
  const [banners, setBanners] = useState<PromoBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PromoBannerItem | null>(null);
  const island = useDynamicIsland();

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      island.success(msg);
    } else {
      island.error(msg);
    }
  };

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promo-banners");
      const json = await res.json();
      setBanners(json.data || []);
    } catch {
      island.error("Gagal Memuat Banner", "Terjadi kesalahan saat mengambil daftar promo.");
    } finally {
      setLoading(false);
    }
  }, [island]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleToggleActive = async (item: PromoBannerItem) => {
    const newVal = !item.is_active;
    // Optimistic UI update
    setBanners((prev) =>
      prev.map((b) => (b.id === item.id ? { ...b, is_active: newVal } : b))
    );

    try {
      const res = await fetch("/api/admin/promo-banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_active: newVal }),
      });
      if (!res.ok) throw new Error();
      showToast(newVal ? "Popup diaktifkan" : "Popup dinonaktifkan", "success");
    } catch {
      // Rollback on error
      setBanners((prev) =>
        prev.map((b) => (b.id === item.id ? { ...b, is_active: !newVal } : b))
      );
      showToast("Gagal mengubah status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus banner/flyer ini?")) return;

    try {
      const res = await fetch(`/api/admin/promo-banners?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setBanners((prev) => prev.filter((b) => b.id !== id));
      showToast("Banner/Flyer berhasil dihapus.", "success");
    } catch {
      showToast("Gagal menghapus item.", "error");
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: PromoBannerItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleSaved = (savedItem: PromoBannerItem) => {
    setBanners((prev) => {
      const exists = prev.some((b) => b.id === savedItem.id);
      if (exists) {
        return prev.map((b) => (b.id === savedItem.id ? savedItem : b));
      }
      return [savedItem, ...prev];
    });
  };

  return (
    <div style={{ padding: "2rem 1.5rem", maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Manajemen Popup Promosi &amp; Flyer</h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--color-gray-500)", fontSize: "0.875rem" }}>
          Unggah flyer poster atau buat banner teks. Jika ada lebih dari 1 item aktif, popup akan berganti otomatis tiap 2 detik di website.
        </p>
      </div>

      {loading ? (
        <div style={{ backgroundColor: "#fff", padding: "3rem", borderRadius: "16px", textAlign: "center", color: "var(--color-gray-400)" }}>
          Memuat data banner...
        </div>
      ) : (
        <PromoBannerList
          banners={banners}
          onToggleActive={handleToggleActive}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddNew={handleAddNew}
        />
      )}

      <PromoBannerModal
        isOpen={modalOpen}
        editingItem={editingItem}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        showToast={showToast}
      />
    </div>
  );
}
