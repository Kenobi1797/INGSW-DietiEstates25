"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
      <Image src="/logo.svg" alt="DietiEstates logo" width={36} height={36} priority />
      <span className="logo-text logo-text-dieti" style={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
        Dieti<span className="logo-text-accent">Estates</span>
      </span>
    </Link>
  );
}
