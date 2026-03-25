"use client";
import LoginForm from "@/components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
