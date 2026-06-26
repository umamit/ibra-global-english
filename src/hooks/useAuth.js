import { useState, useEffect } from "react";
import {
  createAuthClient,
  getCurrentUser,
  getUserRole,
} from "@/utils/supabase/adminAuth";

async function fetchUser() {
  const client = await createAuthClient();
  const { data: { user } = {} } = await client.auth.getUser();
  if (!user) return null;
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { id: user.id, email: user.email, role: profile?.role };
}

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    fetchUser().then(setUser);
  }, []);
  return user;
}

export function useIsAdmin() {
  const user = useCurrentUser();
  return user?.role === "admin";
}

export function useIsAdminOrTutor() {
  const user = useCurrentUser();
  return user?.role === "admin" || user?.role === "tutor";
}