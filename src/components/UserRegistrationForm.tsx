"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserCreateInput, UserCreateInputSchema } from "@/schemas/user";

/**
 * Komponen Form Pendaftaran User yang terhubung dengan skema Zod.
 * Ini adalah contoh bagaimana tipe data dan validasi digunakan secara bersamaan.
 */
export default function UserRegistrationForm() {
  // Fungsi untuk mengirim data ke API. Ini akan digunakan oleh useMutation.
  const createUser = async (newUser: UserCreateInput) => {
    const response = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal membuat user baru.');
    }

    return response.json();
  };

  // Menggunakan useMutation untuk menangani state (loading, error, success) dari API call
  const { mutate, isPending, isSuccess, error: mutationError, data: successData } = useMutation({
    mutationFn: createUser,
  });

  // State untuk data form, tipenya dihubungkan dengan UserCreateInput
  const [formData, setFormData] = useState<Partial<UserCreateInput>>({
    email: "",
    name: "",
  });

  // State untuk menampung error validasi dari Zod
  const [errors, setErrors] = useState<Record<string, string[] | undefined> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(null); // Reset error validasi setiap kali submit

    // 1. Validasi input menggunakan skema Zod
    const validationResult = UserCreateInputSchema.safeParse(formData);

    // 2. Jika validasi gagal, tampilkan error
    if (!validationResult.success) {
      // `flatten()` mengubah error menjadi objek yang mudah dibaca
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      console.error("Validation errors:", fieldErrors);
      return;
    }

    // 3. Jika validasi berhasil, panggil mutasi dari TanStack Query
    mutate(validationResult.data as UserCreateInput);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '2rem auto' }}>
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" value={formData.email || ""} onChange={handleChange} style={{ width: '100%', padding: '8px', border: errors?.email ? '1px solid red' : '1px solid #ccc' }} />
        {errors?.email && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email[0]}</p>}
      </div>
      <div>
        <label htmlFor="name">Nama (Opsional)</label>
        <input type="text" id="name" name="name" value={formData.name || ""} onChange={handleChange} style={{ width: '100%', padding: '8px', border: errors?.name ? '1px solid red' : '1px solid #ccc' }} />
        {errors?.name && <p style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name[0]}</p>}
      </div>
      <button type="submit" disabled={isPending} style={{ padding: '10px', background: '#216c7e', color: 'white', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.6 : 1 }}>
        {isPending ? 'Mendaftar...' : 'Daftar'}
      </button>

      {isSuccess && (
        <div style={{ padding: '10px', background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }}>
          User berhasil dibuat dengan ID: {successData?.user?.id}
        </div>
      )}

      {mutationError && (
        <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
          <strong>Error:</strong> {mutationError.message}
        </div>
      )}
    </form>
  );
}