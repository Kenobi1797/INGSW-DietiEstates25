"use client";
import SignUpForm from "@/components/SignUpForm";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
