"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { User, Mail, Shield } from "lucide-react";

export default function AccountSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const metadata = user.user_metadata || {};
  const displayName = metadata.full_name || metadata.name || user.email;
  const avatarUrl = metadata.avatar_url || metadata.picture;

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Profile Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Profile Information
          </h2>

          <div className="space-y-4">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4 mb-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-cyan-400/50"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {displayName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-lg font-medium text-white">{displayName}</p>
                <p className="text-sm text-white/50">Signed in with Google</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white">
                {user.email}
              </div>
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Account Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Account ID
              </label>
              <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white/50 font-mono text-sm">
                {user.id}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Account Created
              </label>
              <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                Last Sign In
              </label>
              <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white">
                {user.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
