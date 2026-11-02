"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { firebaseConfigured, getFirebaseAuth } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  // Without a Firebase config nobody can sign in, so there is nothing to wait for.
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onAuthStateChanged(getFirebaseAuth(), (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { user, loading, configured: firebaseConfigured };
}

/** Only allow same-site relative paths as a post-login destination. */
export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/predict/";
}

/** For signed-in-only pages: sends signed-out visitors to the landing page, then back here. */
export function useRequireUser() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || user) return;
    const here = window.location.pathname.slice((process.env.NEXT_PUBLIC_BASE_PATH ?? "").length);
    router.replace(`/?next=${encodeURIComponent(here + window.location.search)}`);
  }, [loading, user, router]);

  return { user, loading };
}
