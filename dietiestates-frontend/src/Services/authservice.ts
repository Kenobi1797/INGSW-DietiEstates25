
import { SignUpData } from "@/components/SignUpForm";
const API_URL = process.env.NEXT_PUBLIC_API_URL 

export async function register(userData: SignUpData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if(!response.ok){
    const data = await response.json();
    throw new Error(data.error || 'Errore di registrazione');
  }

  return response.json();
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Errore di login');
  }

  return response.json();
}