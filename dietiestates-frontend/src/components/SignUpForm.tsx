'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BaseButton from './BaseButton';
import { register } from '@/Services/authservice';
import Link from 'next/link';


export interface SignUpData {
  nome: string;
  cognome: string;
  email: string;
  password: string;
}

export default function SignUpForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<SignUpData>({
       nome: "",
       cognome: "",
       email: "",
       password: "",
    });

     const handleGoogleLogin = () => {
           alert('Registrazione con Google (da implementare)');
        };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setFormData((prev) => ({
            ...prev,
            [name]: value,
          }));
      };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  setLoading(true);

  try {
    await register(formData); 
  
    alert('Registrazione completata!');
    router.push('/login'); 
    
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Errore durante la registrazione';
    alert(message);
  } finally {
    setLoading(false); 
  }
  };
    return (
   <div>
     <div className='form'>
      <h2 className='divider'>DietiEstates</h2>
      <p className='divider'>Registrazione</p>
       {/* Google login da implementare*/}
            <BaseButton action={handleGoogleLogin} className='btn-default'>
               <img src="/GoogleLogo.svg" alt="Google" width={20} height={20} />
               <span>Continua con Google</span>
            </BaseButton> 
      <div />   
        <p className='divider'>oppure</p>
      <form className='form' onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="cognome"
          placeholder="Cognome"
          value={formData.cognome}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <p onClick={() => setShowPassword(!showPassword)}
                     className="text-blue-500 text-sm whitespace-nowrap cursor-pointer">
                      {showPassword ? 'Nascondi' : 'Mostra'}
             </p>
        </div>

        <BaseButton
          type="submit"
          className='btn-primary btn-default-pos'
          loading={loading}
          disabled={loading}
        >
          Registrati
        </BaseButton>
      </form>
        
    </div>
    <p className='divider'>
             Sei già registrato?{' '}
             <Link href="/Login" className="text-blue-500 underline">
              clicca qui
            </Link>
          </p>
    </div>
    )
}
