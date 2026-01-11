"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Calendar, Users, ExternalLink, Loader2, ArrowUp } from "lucide-react";

interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string;
  publish_date: string;
  doi: string | null;
  journal_ref: string | null;
  similarity: number;
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Paper[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/papers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abstract: searchQuery,
          matchCount: 10,
          matchThreshold: 0.0,
        }),
      });

      if (!response.ok) throw new Error("Failed to search papers");

      const data = await response.json();
      setResults(data.papers || []);
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 pt-14">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 flex flex-col h-[calc(100vh-56px)]">
        {/* Results area - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {!hasSearched ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-white mb-2">What paper are you looking for?</h1>
                <p className="text-white/50 text-sm">Paste an abstract to find similar research papers</p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                  <span className="ml-2 text-white/60">Searching papers...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">No papers found. Try a different abstract.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-white/40 mb-4">Found {results.length} related papers</p>
                  {results.map((paper, index) => (
                    <div
                      key={paper.id || index}
                      className="bg-slate-900/40 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-cyan-500/10 text-cyan-400 text-xs font-medium rounded-full">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-medium text-white leading-snug">
                              {paper.title || "Untitled Paper"}
                            </h3>
                            {paper.similarity !== undefined && (
                              <span className="flex-shrink-0 text-xs font-medium text-cyan-400">
                                {(paper.similarity * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-white/40">
                            {paper.authors && (
                              <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <Users className="w-3 h-3" />
                                {paper.authors}
                              </span>
                            )}
                            {paper.publish_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(paper.publish_date).getFullYear()}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed">
                            {paper.abstract || "No abstract available."}
                          </p>

                          {paper.doi && (
                            <a
                              href={`https://doi.org/${paper.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              DOI
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search input - fixed at bottom */}
        <div className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="relative">
              <textarea
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste an abstract to search..."
                rows={1}
                className="w-full pl-4 pr-12 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                style={{ minHeight: "48px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "48px";
                  target.style.height = Math.min(target.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 bottom-2 p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowUp className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
