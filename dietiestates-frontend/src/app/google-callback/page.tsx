"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      setTimeout(() => router.push("/"), 700);
    }
  }, [searchParams, router]);

  const token = searchParams.get("token");
  const message = token ?
    "Login eseguito con Google. Reindirizzamento in corso..." :
    "Errore durante il login con Google. Token mancante.";

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
