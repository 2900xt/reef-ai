"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Calendar, Users, ExternalLink, Loader2 } from "lucide-react";

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

interface SearchRecord {
  id: string;
  title: string;
  embedding: number[];
  created_at: string;
}

export default function SearchResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchId = params?.id as string;
  const [searchRecord, setSearchRecord] = useState<SearchRecord | null>(null);
  const [results, setResults] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && searchId) {
      fetchSearchResults();
    }
  }, [user, searchId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSearchResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search/${searchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch search results');
      }

      const data = await response.json();

      setSearchRecord(data.search);
      setResults(data.papers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Search results error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative flex flex-col h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Search Title */}
          {searchRecord && (
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white mb-2">
                {searchRecord.title}
              </h1>
              <p className="text-sm text-white/40">
                {new Date(searchRecord.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
              <span className="ml-2 text-white/60">Loading results...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 text-sm">No papers found.</p>
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
      </div>
    </div>
  );
}
