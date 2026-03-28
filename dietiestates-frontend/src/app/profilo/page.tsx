'use client';

import React, { useState } from 'react';
import { useUser } from '@/Context/Context';

export default function ProfiloPage() {
  const { authuser } = useUser();

  const [oldPassword, setOldPassword]     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState('');
  const [error, setError]                 = useState('');

  if (!authuser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Devi essere loggato per accedere a questa sezione.</p>
      </div>
    );
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (newPassword.length < 6) {
      setError('La nuova password deve avere almeno 6 caratteri.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Le due password non coincidono.');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante il cambio password');

      setSuccess('Password aggiornata con successo.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const ruoloLabel: Record<string, string> = {
    AmministratoreAgenzia: 'Amministratore Agenzia',
    Supporto: 'Supporto',
    Agente: 'Agente',
    Cliente: 'Cliente',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-lg mx-auto">

        {/* Intestazione */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Il mio profilo</h1>
          <p className="text-gray-500 text-sm mt-1">Gestisci le impostazioni del tuo account.</p>
        </div>

        {/* Card info utente */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Dati account</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Nome</span>
              <span className="text-sm font-semibold text-gray-900">{authuser.nome}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Ruolo</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                {ruoloLabel[authuser.ruolo] ?? authuser.ruolo}
              </span>
            </div>
            {authuser.idAgenzia && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">ID Agenzia</span>
                <span className="text-sm font-semibold text-gray-900">#{authuser.idAgenzia}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card cambio password — visibile solo all'AmministratoreAgenzia e non per utenti OAuth */}
        {!authuser.isOAuth && authuser.ruolo === 'AmministratoreAgenzia' && <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Cambia password</h2>

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="profilo-oldPassword" className="block text-sm font-medium text-gray-700 mb-1">Password attuale</label>
              <input
                id="profilo-oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Inserisci la password attuale"
              />
            </div>
            <div>
              <label htmlFor="profilo-newPassword" className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
              <input
                id="profilo-newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Almeno 6 caratteri"
              />
            </div>
            <div>
              <label htmlFor="profilo-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Conferma nuova password</label>
              <input
                id="profilo-confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ripeti la nuova password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Aggiornamento...' : 'Aggiorna password'}
            </button>
          </form>
        </div>}

      </div>
    </div>
  );
}
