"use client";

import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Mail, CreditCard, Key, Plus, Copy, RefreshCw, Loader2, Check, Coins } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  credits_remaining: number;
  created_at: string | null;
  updated_at: string | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState("");
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
        if (error.code === "PGRST116") {
          // Profile doesn't exist, create one
          const newProfile = {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
            credits_remaining: 100,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from("profiles")
            .insert(newProfile)
            .select()
            .single();

          if (createError) throw createError;
          setProfile(createdProfile);
          setFullName(createdProfile.full_name || "");
        } else {
          throw error;
        }
      } else {
        setProfile(data);
        setFullName(data.full_name || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, full_name: fullName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
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
          <p className="text-xs text-white/40 mt-3">Each search uses 1 credit. Credits reset monthly.</p>
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
                {(fullName || user.email)?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-white/50">Signed in with Google</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
              placeholder="Enter your name"
            />
          </div>

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

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving || fullName === profile?.full_name}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : null}
            {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
          </button>
        </div>

        {/* API Key Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            API Keys
          </h2>

          <p className="text-sm text-white/50 mb-4">
            Generate API keys to access the search API programmatically.
          </p>

          <div className="bg-slate-800/30 border border-white/5 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/40">No API keys generated</span>
            </div>
            <p className="text-xs text-white/30">
              Your API keys will appear here once generated.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white/70 text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate New Key
            </button>
            <button
              disabled
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white/70 text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>

          <p className="text-xs text-white/30 mt-3">
            Coming soon: API access for programmatic paper searches.
          </p>
        </div>
      </div>
    </div>
  );
}
