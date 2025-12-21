'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from './BaseButton';

export default function LoginForm() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert('Login via mail');
    }, 10000);
  };

  const handleGoogleLogin = () => {
    alert('Login con Google (da implementare)');
  };

  return (
    <div>
      <h2>Accedi</h2>

      {/* Google login */}
      <BaseButton
        action={handleGoogleLogin}
        className="loginButton"
      >
        Continua con Google
      </BaseButton>

      <p>oppure</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Email o username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <BaseButton
          type="submit"
          className="loginButton"
          loading={loading}
          disabled={loading}
        >
          Accedi
        </BaseButton>
      </form>
    </div>
  );
}
