import { Suspense } from "react";
import Barraricerca from "@/components/Barraricerca";
export default function Home() {
  return (
    <div className="sfondoHome min-h-screen py-24 px-4">
      <main className="max-w-6xl mx-auto text-center">
        <h1 className="text-white text-5xl font-black mb-5 drop-shadow-lg">
          Benvenuto in DietiEstates!
        </h1>
        <p className="text-white/80 mb-8">
          La tua piattaforma per trovare e gestire gli immobili con un design pulito e professionale.
        </p>
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<div className="h-16 bg-gray-100 rounded-xl animate-pulse" />}>
            <Barraricerca />
          </Suspense>
        </div>
      </main>
    </div>
  );
}