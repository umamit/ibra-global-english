"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";

export const useFinanceModal = (fetchData, selectedMonth, sppPrices, showToast) => {
  const supabase = createClient();
  const fileInputRef = useRef(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStudent, setSelectedStudent] = useState(null);
  const [modalAmount, setModalAmount] = useState(300000);
  const [modalStatus, setModalStatus] = useState("belum_bayar");
  const [modalMethod, setModalMethod] = useState("Transfer Bank");
  const [modalReceiptUrl, setModalReceiptUrl] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);

  const handleUploadReceipt = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${modalStudent.id}_${selectedMonth}_${Date.now()}.${fileExt}`;
      const filePath = `${selectedMonth}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("spp-receipts")
        .upload(filePath, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("spp-receipts")
        .getPublicUrl(filePath);

      setModalReceiptUrl(data.publicUrl);
      showToast("Bukti pembayaran berhasil diunggah.");
    } catch (err) {
      console.error("Upload error:", err);
      showToast("Gagal mengunggah bukti pembayaran. Detail: " + (err.message || err), "error");
    }
  };

  const handleOpenEditModal = (student) => {
    const pay = getStudentPayment(student.id, [], [], selectedMonth, sppPrices);
    const program = student?.program || "Kids Program";
    const baseAmount = sppPrices[program] || 300000;

    setSelectedStudent(student);
    setModalAmount(pay.amount || baseAmount);
    setModalStatus(pay.status || "belum_bayar");
    setModalMethod(pay.payment_method || "Transfer Bank");
    setModalReceiptUrl(pay.receipt_url || "");
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!modalStudent) return;

    setSavingPayment(true);
    try {
      const parsedAmount = parseInt(modalAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        showToast("Nominal pembayaran tidak valid.", "error");
        setSavingPayment(false);
        return;
      }
      const payload = {
        student_id: modalStudent.id,
        month: selectedMonth,
        amount: parsedAmount,
        status: modalStatus,
        payment_method: modalMethod,
        receipt_url: modalReceiptUrl || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("tuition_payments")
        .upsert(payload, { onConflict: "student_id,month" });

      if (error) throw error;

      posthog.capture("admin_payment_recorded", {
        status: modalStatus,
        payment_method: modalMethod,
        month: selectedMonth,
        program: modalStudent?.program,
      });
      showToast("Status pembayaran SPP berhasil disimpan!");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Gagal menyimpan pembayaran:", err);
      showToast("Gagal menyimpan data pembayaran SPP.", "error");
    } finally {
      setSavingPayment(false);
    }
  };

  const handleQuickConfirmLunas = async (studentId) => {
    try {
      const pay = getStudentPayment(studentId, [], [], selectedMonth, sppPrices);
      const payload = {
        student_id: studentId,
        month: selectedMonth,
        amount: pay.amount,
        status: "lunas",
        payment_method: pay.payment_method || "Transfer Bank",
        receipt_url: pay.receipt_url || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("tuition_payments")
        .upsert(payload, { onConflict: "student_id,month" });

      if (error) throw error;

      posthog.capture("admin_payment_quick_confirmed", {
        month: selectedMonth,
        payment_method: payload.payment_method,
      });
      showToast("Pembayaran dikonfirmasi LUNAS!");
      fetchData();
    } catch (err) {
      console.error("Gagal melakukan konfirmasi cepat:", err);
      showToast("Gagal mengonfirmasi lunas.", "error");
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,
    modalStudent,
    modalAmount,
    setModalAmount,
    modalStatus,
    setModalStatus,
    modalMethod,
    setModalMethod,
    modalReceiptUrl,
    setModalReceiptUrl,
    savingPayment,
    fileInputRef,
    handleUploadReceipt,
    handleOpenEditModal,
    handleSavePayment,
    handleQuickConfirmLunas
  };
};

// Import getStudentPayment here to avoid circular dependency
import { getStudentPayment } from "../financeHelpers";