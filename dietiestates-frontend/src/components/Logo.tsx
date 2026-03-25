"use client";

import Image from "next/image";
import Link from "next/link";
/*
type LogoProps = {
  color?: string; // colore del testo
  position?: "left" | "center"; // posizione orizzontale del logo
};
*/
export default function Logo() {
  return (
    <Link href="/" className="logo">
      <Image src="/logo.svg" alt="Logo del sito" width={40} height={40} />
      <span className="logo-text">DietiEstate</span>
    </Link>
  );
}
