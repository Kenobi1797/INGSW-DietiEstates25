'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/Services/authservice';
import { useUser } from "@/Context/Context";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginForm() {
  const router = useRouter();
  const { setAuthUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      sessionStorage.setItem('token', data.token);
      setAuthUser(data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!API_URL) { setError('Indirizzo API non configurato'); return; }
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">DietiEstates</h1>
        <p className="text-gray-500 text-sm mt-1">Accedi al tuo account</p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-xl py-2.5 px-4 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <img src="/GoogleLogo.svg" alt="Google" width={18} height={18} />
        Continua con Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">oppure</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-red-400 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Non hai un account?{' '}
        <Link href="/signup" className="text-red-600 font-medium hover:underline">
          Registrati
        </Link>
      </p>
    </div>
  );
}
