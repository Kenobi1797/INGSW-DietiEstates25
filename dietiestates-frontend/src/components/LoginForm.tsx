'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from './BaseButton';
import Logo from './Logo';
import Link from 'next/link';


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
             <Link href="/SignUp/SignUp" className="text-blue-500 underline">
              clicca qui
            </Link>
          </p>

    </div>
  );
}
