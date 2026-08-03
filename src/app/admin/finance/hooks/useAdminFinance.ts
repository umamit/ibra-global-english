import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Student, Payment } from "@/types";

export interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error";
}

export function useAdminFinance() {
  const supabase = createClient();

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [loading, setLoading] = useState<boolean>(false);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [programFilter, setProgramFilter] = useState<string>("All");
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [printDateStr, setPrintDateStr] = useState<string>("");

  const [waModalOpen, setWaModalOpen] = useState<boolean>(false);
  const [waStudent, setWaStudent] = useState<Student | null>(null);
  const [waPayment, setWaPayment] = useState<any | null>(null);

  const [annualModalOpen, setAnnualModalOpen] = useState<boolean>(false);
  const [annualStudent, setAnnualStudent] = useState<Student | null>(null);

  const [sppPrices, setSppPrices] = useState<Record<string, number>>({
    "Kids Program": 300000,
    "Teens Program": 300000,
    "Fun Calistung": 350000,
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const handleOpenAnnualCardModal = (student: Student) => {
    setAnnualStudent(student);
    setAnnualModalOpen(true);
  };

  const handleOpenWaBillingModal = (student: Student, pay: any) => {
    setWaStudent(student);
    setWaPayment(pay);
    setWaModalOpen(true);
  };

  const fetchData = async (): Promise<void> => {
    if (!selectedMonth) return;
    setLoading(true);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select(`
          id,
          name,
          program,
          parent_id,
          created_at,
          profiles:parent_id (
            full_name
          )
        `)
        .order("name", { ascending: true });

      if (studentsError) throw studentsError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("tuition_payments")
        .select("*")
        .eq("month", selectedMonth);

      if (paymentsError) throw paymentsError;

      const { data: allPaymentsData, error: allPaymentsError } = await supabase
        .from("tuition_payments")
        .select("*")
        .order("month", { ascending: true });

      if (allPaymentsError) throw allPaymentsError;

      const formattedStudents = (studentsData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        program: s.program,
        parent_id: s.parent_id,
        created_at: s.created_at,
        profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles,
      }));

      setStudents(formattedStudents);
      setPayments(paymentsData || []);
      setAllPayments(allPaymentsData || []);
    } catch (err) {
      console.error("Gagal mengambil data keuangan:", err);
      showToast("Gagal memuat beberapa data dari database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchSppPrices(): Promise<void> {
      try {
        const { data } = await supabase.from("landing_settings").select("*");
        if (data && data.length > 0) {
          const settings: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            settings[item.key] = item.value;
          });
          setSppPrices({
            "Kids Program": parseInt(settings.payment_spp_kids || "300000"),
            "Teens Program": parseInt(settings.payment_spp_teens || "300000"),
            "Fun Calistung": parseInt(settings.payment_spp_calistung || "350000"),
          });
        }
      } catch (err) {
        console.error("Gagal memuat nominal SPP program:", err);
      }
    }
    fetchSppPrices();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setPrintDateStr(new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }));
    }, 0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    const channel = supabase
      .channel("realtime-finance")
      .on("postgres_changes", { event: "*", schema: "public", table: "tuition_payments" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => fetchData())
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [selectedMonth]);

  const printFinanceReport = () => {
    document.body.classList.add("print-finance");
    window.print();
    const cleanup = () => {
      document.body.classList.remove("print-finance");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
  };

  return {
    students, payments, allPayments, activeTab, setActiveTab, loading, selectedMonth,
    setSelectedMonth, searchQuery, setSearchQuery, programFilter, setProgramFilter,
    toast, printDateStr, waModalOpen, setWaModalOpen, waStudent, waPayment, annualModalOpen,
    setAnnualModalOpen, annualStudent, sppPrices, currentPage, setCurrentPage, pageSize,
    setPageSize, showToast, handleOpenAnnualCardModal, handleOpenWaBillingModal, fetchData,
    printFinanceReport,
  };
}
