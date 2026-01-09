"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    accountType: "individual",
    agreedToTerms: false,
  });

  const [showEnterprisePopup, setShowEnterprisePopup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    // Sign up with Supabase
    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
      }
    );

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Redirect to main page after successful signup
    router.push("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Show popup if non-individual account type is selected
    if (name === "accountType" && value !== "individual") {
      setShowEnterprisePopup(true);
      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
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

      {/* Enterprise/Organization Popup */}
      {showEnterprisePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEnterprisePopup(false)}
          />
          <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <button
              onClick={() => setShowEnterprisePopup(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Enterprise Account
              </h3>
              <p className="text-white/70 mb-6">
                For organizations, research institutions, and shipping companies, we offer custom solutions tailored to your needs. Please contact us for a personalized quote.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="https://mobylabs.org/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] text-center"
                >
                  Request a Quote
                </a>
                <button
                  onClick={() => setShowEnterprisePopup(false)}
                  className="w-full py-3 px-6 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  Stay as Individual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-24 pb-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-cyan-300 text-xs font-medium mb-4 shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
            For Individuals
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
              Join API Waitlist
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

        {/* Signup Form */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl p-5 md:p-6 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                Account Type
              </label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white"
                required
              >
                <option value="individual" className="bg-slate-900">Individual Developer</option>
                <option value="organization" className="bg-slate-900">Organization / Enterprise</option>
                <option value="research" className="bg-slate-900">Research Institution</option>
                <option value="shipping" className="bg-slate-900">Shipping Company</option>
              </select>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                placeholder="john.doe@example.com"
                required
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1">
                Company / Organization <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <p className="text-[10px] text-white/50 mt-0.5">Min 8 characters</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white placeholder-white/40"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="mt-0.5 w-3.5 h-3.5 text-cyan-500 bg-white/10 border-white/20 rounded focus:ring-cyan-400"
                required
              />
              <label className="text-xs text-white/70">
                I agree to the{" "}
                <Link href="/terms" className="text-cyan-400 font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-400 font-semibold hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Features Included */}
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3">
              <h3 className="text-sm font-bold text-white mb-2">What's Included:</h3>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70">Real-time whale detection API</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70">1,000 requests/hour</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70">Custom alert webhooks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70">Dashboard & analytics</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            {/* Login Link */}
            <div className="text-center text-white/60 text-xs">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-cyan-400 font-semibold hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
