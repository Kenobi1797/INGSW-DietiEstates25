"use client";

import Image from "next/image";

type LogoProps = {
  color?: string; // colore del testo
  position?: "left" | "center"; // posizione orizzontale del logo
};

export default function Logo({ color = "black", position = "left" }: LogoProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: position === "center" ? "center" : "flex-start",
        gap: "0.5rem",
      }}
    >
      <Image src="/logo.svg" alt="Logo del sito" width={40} height={40} />
      <span style={{ fontWeight: "bold", color }}>DietiEstate</span>
    </div>
  );
}
