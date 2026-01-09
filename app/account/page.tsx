"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Building,
  Shield,
  Key,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Plus,
  AlertCircle,
  Save,
} from "lucide-react";

export default function AccountSettings() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Profile form state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    company: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signup");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      setProfileForm({
        firstName: metadata.firstName || "",
        lastName: metadata.lastName || "",
        company: metadata.company || "",
      });
    }
  }, [user]);

  const handleProfileSave = async () => {
    setProfileSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setProfileSaving(false);
    setProfileSaved(true);
    setIsEditingProfile(false);
    setTimeout(() => setProfileSaved(false), 3000);
  };

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

  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-12 px-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        {/* Success Message */}
        {profileSaved && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-emerald-400 font-medium">Profile updated successfully!</p>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-400" />
              Profile Information
            </h2>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 rounded-lg transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      firstName: metadata.firstName || "",
                      lastName: metadata.lastName || "",
                      company: metadata.company || "",
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="px-4 py-2 text-sm font-medium bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {profileSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  First Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="John"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white">
                    {metadata.firstName || "Not set"}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Last Name
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                    placeholder="Doe"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white">
                    {metadata.lastName || "Not set"}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white/50">
                {user.email}
                <span className="text-xs text-white/30 ml-2">(cannot be changed)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1 flex items-center gap-1">
                <Building className="w-4 h-4" />
                Company / Organization
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileForm.company}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, company: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/20 rounded-lg text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
                  placeholder="Acme Corporation"
                />
              ) : (
                <div className="px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white">
                  {metadata.company || "Not set"}
                </div>
              )}
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
