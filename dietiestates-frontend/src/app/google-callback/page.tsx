"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/Context/Context";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuthUser } = useUser();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;

    sessionStorage.setItem("token", token);

    // Recupera i dati utente e aggiorna il context prima di reindirizzare
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAuthUser(data);
        router.push("/dashboard");
      })
      .catch(() => router.push("/dashboard"));
  }, [searchParams, router, setAuthUser]);

  const token = searchParams.get("token");
  const message = token
    ? "Login eseguito con Google. Reindirizzamento in corso..."
    : "Errore durante il login con Google. Token mancante.";

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-3">Login Google</h1>
      <p className="text-gray-700">{message}</p>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-6">
        <p className="text-gray-500">Verifica autenticazione...</p>
      </main>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
