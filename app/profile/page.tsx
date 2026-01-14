"use client";

import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Mail, Plus, Coins, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  credits_remaining: number;
  created_at: string | null;
  updated_at: string | null;
  whitelisted: boolean;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Check for success/cancel query params
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (params.get('success') && sessionId) {
      // Verify the session and add credits
      verifyAndAddCredits(sessionId);
    } else if (params.get('canceled')) {
      setError('Payment was cancelled');
      window.history.replaceState({}, '', '/profile');
    }
  }, []);

  const verifyAndAddCredits = async (sessionId: string) => {
    try {
      const response = await fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`Payment successful! ${data.added} credits have been added.`);
        // Refresh profile to show updated credits
        fetchProfile();
      } else {
        // Payment might have already been processed by webhook
        setSuccess('Payment successful! Your credits have been added.');
        fetchProfile();
      }
    } catch (err) {
      console.error('Verification error:', err);
      // Still show success since payment went through
      setSuccess('Payment successful! Your credits should be updated shortly.');
      fetchProfile();
    } finally {
      // Clear the query params
      window.history.replaceState({}, '', '/profile');
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        throw error;
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const getCreditsColor = (credits: number) => {
    if (credits > 50) return "text-green-400";
    if (credits > 20) return "text-yellow-400";
    return "text-red-400";
  };

  const handleBuyCredits = async (packageType: 'SMALL' | 'MEDIUM' | 'LARGE') => {
    try {
      setCheckoutLoading(true);
      setError(null);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout using the URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) return null;

  const metadata = user.user_metadata || {};
  const avatarUrl = metadata.avatar_url || metadata.picture;

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Credits Card */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Coins className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-white/60">Credits Remaining</p>
                <p className={`text-2xl font-bold ${getCreditsColor(profile?.credits_remaining || 0)}`}>
                  {profile?.credits_remaining ?? 0}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPricing(!showPricing)}
              disabled={checkoutLoading}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 text-sm font-medium rounded-lg transition-colors"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Buy Credits
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-white/40 mt-3">Each search uses 1 credit.</p>
        </div>

        {/* Pricing Options */}
        {showPricing && (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 mb-5">
            <h2 className="text-lg font-semibold text-white mb-4">Choose a Package</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Small Package */}
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Starter</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-cyan-400">$5</span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    <span className="text-2xl font-bold text-white">10</span> credits
                  </p>
                  <p className="text-white/40 text-xs mb-4">Perfect for trying out</p>
                  <button
                    onClick={() => handleBuyCredits('SMALL')}
                    disabled={checkoutLoading}
                    className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 text-cyan-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>

              {/* Medium Package */}
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-2 border-cyan-500/40 rounded-lg p-4 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-cyan-400">$20</span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    <span className="text-2xl font-bold text-white">50</span> credits
                  </p>
                  <p className="text-white/40 text-xs mb-4">Best value - $0.40/credit</p>
                  <button
                    onClick={() => handleBuyCredits('MEDIUM')}
                    disabled={checkoutLoading}
                    className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>

              {/* Large Package */}
              <div className="bg-slate-800/50 border border-white/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-cyan-400">$35</span>
                  </div>
                  <p className="text-white/60 text-sm mb-4">
                    <span className="text-2xl font-bold text-white">100</span> credits
                  </p>
                  <p className="text-white/40 text-xs mb-4">For power users - $0.35/credit</p>
                  <button
                    onClick={() => handleBuyCredits('LARGE')}
                    disabled={checkoutLoading}
                    className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 text-cyan-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Select
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5 mb-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Profile Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-5">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-14 h-14 rounded-full border-2 border-cyan-400/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                {(profile?.full_name || user.email)?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-white/50">Signed in with Google</p>
            </div>
          </div>

          {/* Full Name (read-only) */}
          {profile?.full_name && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-1.5">
                Full Name
              </label>
              <div className="px-3 py-2 bg-slate-800/30 border border-white/5 rounded-lg text-white/50 text-sm">
                {profile.full_name}
              </div>
            </div>
          )}

          {/* Email (read-only) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <div className="px-3 py-2 bg-slate-800/30 border border-white/5 rounded-lg text-white/50 text-sm">
              {user.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
