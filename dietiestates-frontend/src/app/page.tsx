import { Suspense } from "react";
import Barraricerca from "@/components/Barraricerca";
import Link from "next/link";
export default function Home() {
  return (
    <div className="sfondoHome min-h-screen bg-white text-black py-24 px-4">
      <main className="max-w-6xl mx-auto text-center">
        <h1 className="text-red-600 text-5xl font-black mb-5 drop-shadow-lg">
          Benvenuto in DietiEstates!
        </h1>
        <p className="text-gray-700 mb-8">
          La tua piattaforma per trovare e gestire gli immobili con un design pulito e professionale.
        </p>
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<div className="h-16 bg-gray-100 rounded-xl animate-pulse" />}>
            <Barraricerca />
          </Suspense>
        </div>
        <div className="mt-6">
          <Link href="/immobili" className="inline-flex items-center px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors">
            Visualizza tutti gli immobili
          </Link>
        </div>
      </main>
    </div>
  );
}