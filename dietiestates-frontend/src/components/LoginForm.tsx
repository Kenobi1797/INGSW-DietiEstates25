'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from './BaseButton';
import Logo from './Logo';
import Link from 'next/link';
import { login } from '@/Services/authservice';
import { useUser } from "@/Context/Context";

export default function LoginForm() {
  const router = useRouter();
  const { setAuthUser } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('token', data.token);
      setAuthUser(data.user);       
      router.push('/');
    } catch (error: any) {
      alert(error.message || 'Credenziali non valide');
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
