"use client";

import { getStudentPayment } from "../financeHelpers";
import { getWitDateString } from "../../utils";
import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import posthog from "posthog-js";

import { Student } from "@/types";

export const useFinanceModal = (
  fetchData: () => void,
  selectedMonth: string,
  sppPrices: Record<string, number>,
  showToast: (msg: string, type?: "success" | "error") => void
) => {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalAmount, setModalAmount] = useState<string | number>(300000);
  const [modalStatus, setModalStatus] = useState<string>("belum_bayar");
  const [modalMethod, setModalMethod] = useState<string>("Transfer Bank");
  const [modalReceiptUrl, setModalReceiptUrl] = useState<string>("");
  const [modalPaymentDate, setModalPaymentDate] = useState<string>("");
  const [savingPayment, setSavingPayment] = useState<boolean>(false);

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${modalStudent!.id}_${selectedMonth}_${Date.now()}.${fileExt}`;
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
      const msg = err instanceof Error ? err.message : String(err);
      showToast("Gagal mengunggah bukti pembayaran. Detail: " + msg, "error");
    }
  };

  const handleOpenEditModal = (student: Student) => {
    const pay = getStudentPayment(student.id, [], [], selectedMonth, sppPrices);
    const program = student?.program || "Kids Program";
    const baseAmount = sppPrices[program] || 300000;

    setSelectedStudent(student);
    setModalAmount(pay.amount || baseAmount);
    setModalStatus(pay.status || "belum_bayar");
    setModalMethod(pay.payment_method || "Transfer Bank");
    setModalReceiptUrl(pay.receipt_url || "");
    setModalPaymentDate(pay.payment_date || (pay.status === "lunas" ? getWitDateString() : ""));
    setIsModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!modalStudent) return;

    setSavingPayment(true);
    try {
      const parsedAmount = parseInt(String(modalAmount));
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
        payment_date: modalPaymentDate || null,
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

  const handleQuickConfirmLunas = async (studentId: string): Promise<void> => {
    try {
      const pay = getStudentPayment(studentId, [], [], selectedMonth, sppPrices);
      const payload = {
        student_id: studentId,
        month: selectedMonth,
        amount: pay.amount,
        status: "lunas",
        payment_method: pay.payment_method || "Transfer Bank",
        receipt_url: pay.receipt_url || null,
        payment_date: pay.payment_date || getWitDateString(),
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
    modalPaymentDate,
    setModalPaymentDate,
    savingPayment,
    fileInputRef,
    handleUploadReceipt,
    handleOpenEditModal,
    handleSavePayment,
    handleQuickConfirmLunas
  };
};
