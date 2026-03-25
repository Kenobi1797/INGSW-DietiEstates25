
import { SignUpData } from "@/components/SignUpForm";
const API_URL = process.env.NEXT_PUBLIC_API_URL 

export async function register(userData: SignUpData) {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL non configurata');
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const raw = await response.text();
  let data: { error?: string; [key: string]: unknown } | null = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if(!response.ok){
    const message = data?.error || (raw && !raw.startsWith('<') ? raw : 'Errore di registrazione');
    throw new Error(message);
  }

  return data;
}

export async function login(email: string, password: string) {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL non configurata');
  }

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const raw = await response.text();
  let data: { error?: string; [key: string]: unknown } | null = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.error || (raw && !raw.startsWith('<') ? raw : 'Errore di login');
    throw new Error(message);
  }

  return data;
}