"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { FileText, Calendar, Users, ExternalLink, Loader2, ArrowUp, Paperclip, X } from "lucide-react";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isParsingFile, setIsParsingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsingFile(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse document");
      }

      // Store extracted text separately, don't populate the textarea
      setExtractedText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse document");
      setSelectedFile(null);
      setExtractedText("");
    } finally {
      setIsParsingFile(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setExtractedText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clear the bottom file input too if it exists
    const bottomInput = document.getElementById("bottom-file-input") as HTMLInputElement;
    if (bottomInput) {
      bottomInput.value = "";
    }
  };

  const handleSearch = async () => {
    // If there's an uploaded file, require either a question or just use the extracted text
    // If no file, require search query
    if (!extractedText && !searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      // Combine user's question with extracted text from file
      // If user asked a question, prepend it to the document text
      // If no question, just use the extracted text
      let queryText = extractedText;
      if (searchQuery.trim() && extractedText) {
        queryText = `${searchQuery.trim()}\n\nDocument content:\n${extractedText}`;
      } else if (searchQuery.trim()) {
        queryText = searchQuery.trim();
      }

      const response = await fetch("/api/papers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abstract: queryText,
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
        {/* Results area - scrollable, or centered content when no search */}
        <div className="flex-1 overflow-y-auto">
          {!hasSearched ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-white mb-2">What paper are you looking for?</h1>
                <p className="text-white/50 text-sm">Paste an abstract or upload a PDF to find similar research papers</p>
              </div>

              {/* Centered search input */}
              <div className="w-full max-w-2xl">
                {/* File indicator */}
                {selectedFile && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-cyan-300 truncate flex-1">{selectedFile.name}</span>
                    <button
                      onClick={clearFile}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={selectedFile ? "Ask a question about this document (optional)..." : "Paste an abstract to search..."}
                    rows={3}
                    disabled={isParsingFile}
                    className="w-full pl-4 pr-24 py-4 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors disabled:opacity-50"
                    style={{ minHeight: "100px", maxHeight: "200px" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "100px";
                      target.style.height = Math.min(target.scrollHeight, 200) + "px";
                    }}
                  />

                  {/* Action buttons */}
                  <div className="absolute right-2 bottom-2 flex items-center gap-2">
                    {/* File upload button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isParsingFile || isSearching}
                      className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-50 rounded-lg transition-colors"
                      title="Upload PDF or document"
                    >
                      {isParsingFile ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Paperclip className="w-5 h-5" />
                      )}
                    </button>

                    {/* Search button */}
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || isParsingFile || (!searchQuery.trim() && !extractedText)}
                      className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      {isSearching ? (
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                      ) : (
                        <ArrowUp className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-white/30 text-xs mt-3 text-center">
                  Supports PDF files up to 10MB
                </p>
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

        {/* Search input - fixed at bottom (only shown after first search) */}
        {hasSearched && (
          <div className="border-t border-white/5 bg-slate-950/80 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto px-4 py-3">
              {/* File indicator */}
              {selectedFile && (
                <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-300 truncate flex-1">{selectedFile.name}</span>
                  <button
                    onClick={clearFile}
                    className="p-0.5 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-white/60" />
                  </button>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedFile ? "Ask a question about this document (optional)..." : "Paste an abstract to search..."}
                  rows={1}
                  disabled={isParsingFile}
                  className="w-full pl-4 pr-20 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors disabled:opacity-50"
                  style={{ minHeight: "48px", maxHeight: "120px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "48px";
                    target.style.height = Math.min(target.scrollHeight, 120) + "px";
                  }}
                />

                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="bottom-file-input"
                  />
                  <button
                    onClick={() => document.getElementById("bottom-file-input")?.click()}
                    disabled={isParsingFile || isSearching}
                    className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5 disabled:opacity-50 rounded-lg transition-colors"
                    title="Upload PDF or document"
                  >
                    {isParsingFile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={handleSearch}
                    disabled={isSearching || isParsingFile || (!searchQuery.trim() && !extractedText)}
                    className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
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
        )}
      </div>
    </div>
  );
}
