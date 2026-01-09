"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn(formData.email, formData.password);

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    // Redirect to dashboard or home page after successful login
    router.push("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative">
      {/* Background effects matching hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-4 pt-32 pb-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-medium mb-4 shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
            Welcome Back
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              Login to Your Account
            </span>
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-6 md:p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="/forgot-password" className="text-cyan-400 text-sm hover:underline">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Signup Link */}
            <div className="text-center text-white/60 text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-cyan-400 font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs">
            By logging in, you agree to our{" "}
            <Link href="/terms" className="text-cyan-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
