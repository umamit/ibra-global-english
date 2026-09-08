"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

export interface StudentItem {
  id: string;
  name: string;
  program: string;
  age?: number;
}

export interface SessionNoteItem {
  id: string;
  student_id: string;
  session_date: string;
  meeting_number?: number | null;
  topic_covered: string;
  vocabulary_learned?: string | null;
  comprehension_level: string;
  student_behavior?: string | null;
  individual_feedback: string;
  homework_assigned?: string | null;
  created_by_role: string;
  tutor_name?: string | null;
  created_at: string;
  students?: { name: string; program: string };
}

export function useSessionNotesData() {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [notes, setNotes] = useState<SessionNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStudents = useCallback(async () => {
    const { data } = await supabase.from("students").select("id, name, program, age").order("name");
    if (data) setStudents(data);
  }, [supabase]);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    let url = "/api/session-notes";
    if (selectedStudentId) {
      url += `?student_id=${selectedStudentId}`;
    }
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setNotes(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data catatan:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredStudents = students.filter((s) => {
    const matchProgram = selectedProgram === "all" || s.program.toLowerCase().includes(selectedProgram.toLowerCase());
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProgram && matchSearch;
  });

  return {
    students,
    filteredStudents,
    notes,
    loading,
    submitting,
    setSubmitting,
    selectedStudentId,
    setSelectedStudentId,
    selectedProgram,
    setSelectedProgram,
    searchQuery,
    setSearchQuery,
    fetchNotes,
  };
}
