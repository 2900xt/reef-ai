"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Home, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface DocSection {
  id: string;
  title: string;
  tool: string;
}

interface DocsSidebarProps {
  sections: DocSection[];
  activeSection: string | null;
  onSectionClick: (id: string) => void;
}

export default function DocsSidebar({ sections, activeSection, onSectionClick }: DocsSidebarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const getUserInitials = () => {
    if (!user) return "";
    const metadata = user.user_metadata;
    if (metadata?.full_name) {
      const names = metadata.full_name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (metadata?.name) {
      const names = metadata.name.split(" ");
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

  // Group sections by tool
  const sectionsByTool = sections.reduce(
    (acc, section) => {
      if (!acc[section.tool]) {
        acc[section.tool] = [];
      }
      acc[section.tool].push(section);
      return acc;
    },
    {} as Record<string, DocSection[]>
  );

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-white/10 flex flex-col">
      {/* Header with Logo */}
      <div className="px-7 py-4 flex items-center gap-2">
        <Image src="/logo.png" alt="Moby Labs Logo" width={20} height={20} />
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Moby Labs
          </span>
          <span className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-cyan-500 bg-clip-text text-transparent">
            Docs
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 pb-2">
        <Link
          href="/"
          className="group flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-white/5 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Home className="w-3.5 h-3.5 text-white/70" />
          </div>
          <span className="text-sm text-white/70 group-hover:text-white/90">Home</span>
        </Link>
      </div>

      {/* Sections Navigation */}
      <div className="flex-1 overflow-y-auto px-3">
        {Object.entries(sectionsByTool).map(([tool, toolSections]) => (
          <div key={tool} className="mb-4">
            <div className="text-xs font-medium text-white/40 px-3 py-2 uppercase tracking-wider">
              {tool}
            </div>
            <div className="space-y-0.5">
              {toolSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionClick(section.id)}
                    className={`relative block w-full text-left px-3 py-2 rounded-md transition-all group ${
                      isActive ? "bg-cyan-500/15 border border-cyan-500/30" : "hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full" />
                    )}
                    <div className="flex items-center gap-2">
                      <FileText
                        className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-white/40"}`}
                      />
                      <p
                        className={`text-sm truncate transition-colors ${
                          isActive
                            ? "text-cyan-200 font-medium"
                            : "text-white/70 group-hover:text-white"
                        }`}
                      >
                        {section.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Section */}
      <div className="px-3 py-3 border-t border-white/10">
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-semibold flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm text-white/90 truncate">
                  {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-xl border border-white/10 py-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
