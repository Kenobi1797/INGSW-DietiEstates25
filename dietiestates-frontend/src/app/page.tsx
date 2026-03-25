import Barraricerca from "@/components/Barraricerca";
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
          <Barraricerca />
        </div>
      </main>
    </div>
  );
}