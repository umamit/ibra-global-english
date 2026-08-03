"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { TestimonialForm, TestimonialItemCard } from "./TestimonialComponents";

interface TestimonialItem { id: string; author: string; role: string; rating: number; text: string; is_active?: boolean; status?: "pending" | "approved" | "rejected"; created_at?: string; }
interface TestimonialManagerProps { showToast: (msg: string, type?: "success" | "error") => void; triggerRevalidation: () => Promise<void>; }

export default function TestimonialManager({ showToast, triggerRevalidation }: TestimonialManagerProps) {
  const supabase = createClient();
  const [testimonialsList, setTestimonials] = useState<TestimonialItem[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState<boolean>(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "active">("all");

  const [author, setAuthor] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [testimonialText, setTestimonialText] = useState<string>("");
  const [savingTestimonial, setSavingTestimonial] = useState<boolean>(false);

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    try {
      const { data, error } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) { console.error(err); } finally { setTestimonialsLoading(false); }
  };

  useEffect(() => { fetchTestimonials(); }, []);

  const resetForm = () => { setEditingTestimonialId(null); setAuthor(""); setRole(""); setRating(5); setTestimonialText(""); };

  const startEdit = (item: TestimonialItem) => {
    setEditingTestimonialId(item.id); setAuthor(item.author); setRole(item.role); setRating(item.rating); setTestimonialText(item.text);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !role.trim() || !testimonialText.trim()) return showToast("Semua bidang wajib diisi.", "error");
    setSavingTestimonial(true);
    try {
      if (editingTestimonialId) {
        const { error } = await supabase.from("testimonials").update({ author: author.trim(), role: role.trim(), rating: Number(rating), text: testimonialText.trim() }).eq("id", editingTestimonialId);
        if (error) throw error;
        showToast("Testimonial berhasil disunting.");
      } else {
        const { error } = await supabase.from("testimonials").insert([{ author: author.trim(), role: role.trim(), rating: Number(rating), text: testimonialText.trim(), is_active: true, status: "approved" }]);
        if (error) throw error;
        showToast("Testimonial berhasil ditambahkan.");
      }
      resetForm(); fetchTestimonials(); triggerRevalidation();
    } catch (err: any) { showToast(err.message, "error"); } finally { setSavingTestimonial(false); }
  };

  const handleToggleStatus = async (id: string, newActiveState: boolean) => {
    try {
      const { error } = await supabase.from("testimonials").update({ is_active: newActiveState }).eq("id", id);
      if (error) throw error;
      showToast("Status testimoni diperbarui."); fetchTestimonials(); triggerRevalidation();
    } catch (err: any) { showToast(err.message, "error"); }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Hapus testimoni ini?")) return;
    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
      showToast("Testimoni dihapus."); fetchTestimonials(); triggerRevalidation();
    } catch (err: any) { showToast(err.message, "error"); }
  };

  const filtered = testimonialsList.filter((item) => filterTab === "all" ? true : filterTab === "pending" ? item.status === "pending" : item.is_active);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <TestimonialForm author={author} setAuthor={setAuthor} role={role} setRole={setRole} rating={rating} setRating={setRating} testimonialText={testimonialText} setTestimonialText={setTestimonialText} handleSaveTestimonial={handleSaveTestimonial} editingTestimonialId={editingTestimonialId} resetForm={resetForm} savingTestimonial={savingTestimonial} />

      <div className="portal-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Daftar Testimoni Pelanggan</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => setFilterTab("all")} className="btn-portal-outline" style={{ opacity: filterTab === "all" ? 1 : 0.6 }}>Semua</button>
            <button onClick={() => setFilterTab("active")} className="btn-portal-outline" style={{ opacity: filterTab === "active" ? 1 : 0.6 }}>Aktif</button>
          </div>
        </div>

        {testimonialsLoading ? <p>Memuat...</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filtered.map((item) => (
              <TestimonialItemCard key={item.id} item={item} startEdit={startEdit} handleToggleStatus={handleToggleStatus} handleDeleteTestimonial={handleDeleteTestimonial} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
