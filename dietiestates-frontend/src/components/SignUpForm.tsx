'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { register } from '@/Services/authservice';
import Link from 'next/link';
import Image from 'next/image';

export interface SignUpData {
  nome: string;
  cognome: string;
  email: string;
  password: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SignUpData>({
    nome: '',
    cognome: '',
    email: '',
    password: '',
  });

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) { setError('URL API non configurato'); return; }
    if (globalThis.window !== undefined) {
      globalThis.window.location.href = `${apiUrl}/auth/google?mode=signup`;
    }
  };

  useEffect(() => {
    const oauth = searchParams.get('oauth');
    if (oauth === 'not_registered') {
      setError('Nessuna registrazione Google trovata. Registrati prima con Google.');
      return;
    }
    if (oauth === 'failed') {
      setError('Registrazione Google non riuscita. Riprova.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">DietiEstates</h1>
        <p className="text-gray-600 text-sm mt-1">Crea il tuo account</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-3 w-full bg-white text-slate-900 border border-gray-300 rounded-xl py-2.5 px-4 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
          <Image src="/GoogleLogo.svg" alt="Google" width={18} height={18} />{' '}
        Continua con Google
      </button>
      <p className="text-xs text-gray-500 text-center -mt-2">
        Se hai già un account Google collegato, verrai reindirizzato direttamente al login.
      </p>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-xs text-gray-500">oppure</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            value={formData.nome}
            onChange={handleChange}
            className="bg-white text-slate-900 placeholder:text-gray-500 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none"
            required
          />
          <input
            type="text"
            name="cognome"
            placeholder="Cognome"
            value={formData.cognome}
            onChange={handleChange}
            className="bg-white text-slate-900 placeholder:text-gray-500 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none"
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full bg-white text-slate-900 placeholder:text-gray-500 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none"
          required
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password (min. 6 caratteri)"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-white text-slate-900 placeholder:text-gray-500 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none pr-20"
            required
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700">
            {showPassword ? 'Nascondi' : 'Mostra'}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {loading ? 'Registrazione...' : 'Registrati'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Hai già un account?{' '}
        <Link href="/login" className="text-red-600 font-medium hover:underline">
          Accedi
        </Link>
      </p>
    </div>
  );
}

