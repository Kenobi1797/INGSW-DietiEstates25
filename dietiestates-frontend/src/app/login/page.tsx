"use client";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
