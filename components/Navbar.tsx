"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setDropdownOpen(false);
    router.push("/auth/login");
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user) return "";
    const metadata = user.user_metadata;
    // For Google OAuth, use full_name or name
    if (metadata?.full_name) {
      const names = metadata.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (metadata?.name) {
      const names = metadata.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
      style={{ fontFamily: 'var(--font-ubuntu)' }}
    >
      <div className="max-w-7xl mx-auto px-2 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <Image src="/logo.png" alt="Moby Labs Logo" width={24} height={24} />
          <span className="text-m font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Moby Labs
          </span>
          <span className="text-m font-bold bg-gradient-to-r from-cyan-600 to-cyan-600 bg-clip-text text-transparent">
            Reef
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`font-semibold transition-all duration-300 hover:scale-105 text-sm ${
              pathname === "/"
                ? "text-cyan-300 border-b-2 border-cyan-400"
                : "text-white/70 hover:text-white"
            }`}
          >
            Dashboard
          </Link>

          {/* Profile Badge */}
          {!loading && user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                {getUserInitials()}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-white/10 py-1 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">
                      {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
                    </p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sign In button for unauthenticated users */}
          {!loading && !user && (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-1.5">
          <div className="space-y-1">
            <div className="w-5 h-0.5 bg-white" />
            <div className="w-5 h-0.5 bg-white" />
            <div className="w-5 h-0.5 bg-white" />
          </div>
        </button>
      </div>
    </nav>
  );
}
