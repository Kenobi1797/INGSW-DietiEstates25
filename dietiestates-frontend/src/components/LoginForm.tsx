'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from './BaseButton';
import Link from 'next/link';
import { login } from '@/Services/authservice';
import { useUser } from "@/Context/Context";

export default function LoginForm() {
  const router = useRouter();
  const { setAuthUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      setAuthUser(data.user);       
      router.push('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Credenziali non valide';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Login con Google (da implementare)');
  };

  return (
    <div>
      <div className='form'>
      <h2 className='divider'>DietiEstates</h2>
      <p className='divider'>Accedi</p>

      {/* Google login */}
      <BaseButton action={handleGoogleLogin} className='btn-default'>
         <img src="/GoogleLogo.svg" alt="Google" width={20} height={20} />
         <span>Continua con Google</span>
      </BaseButton>
    </div>
    <p className='divider'>oppure</p>
      <form className= 'form'onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          className='btn-primary btn-default-pos'
          loading={loading}
          disabled={loading}
        >
          Accedi
        </BaseButton>
      </form>
      <p className='divider'>
             Non sei registrato?{' '}
             <Link href="/SignUp" className="text-blue-500 underline">
              clicca qui
            </Link>
          </p>

    </div>
  );
}
