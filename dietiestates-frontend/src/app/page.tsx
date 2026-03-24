import Barraricerca from "@/components/Barraricerca";
export default function Home() {
  return (
     <div className="sfondoHome relative">

      <main>
        <h1 className="text-white text-5xl font-bold">
          Benvenuto in DietiEstate!</h1>
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
            <Barraricerca ></Barraricerca>
          </div>
          
      </main>
        </div>
  );
}