"use client";

import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Mail, Plus, Coins } from "lucide-react";

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
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-cyan-400 text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buy Credits
            </button>
          </div>
          <p className="text-xs text-white/40 mt-3">Each search uses 1 credit.</p>
        </div>

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
