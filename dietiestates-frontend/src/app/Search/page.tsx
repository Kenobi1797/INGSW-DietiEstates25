"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/search');
  }, [router]);

  return <p>Reindirizzamento a ricerca...</p>;
}
