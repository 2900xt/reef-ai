"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Activity,
  Zap,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to signup
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signup");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.user_metadata?.firstName || "Developer";

  return (
    <div className="min-h-screen bg-slate-950 pt-16">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {firstName}
          </h1>
          <p className="text-white/60">
            Reef: An AI-powered research assistant.
          </p>
        </div>
      </div>
    </div>
  );
}
