"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";

interface RequestField {
  name: string;
  type: string;
  description: string;
}

interface ResponseField {
  name: string;
  type: string;
  nested?: string;
}

export interface ApiEndpointProps {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  urlParams?: { name: string; description: string }[];
  requestBody?: RequestField[];
  response?: ResponseField[];
  example: string;
  defaultExpanded?: boolean;
  expandedSection: string | null;
  onToggle: (id: string) => void;
  copiedEndpoint: string | null;
  onCopy: (text: string, id: string) => void;
}

const methodColors: Record<string, string> = {
  GET: "text-blue-400 bg-blue-500/15",
  POST: "text-emerald-400 bg-emerald-500/15",
  PUT: "text-amber-400 bg-amber-500/15",
  DELETE: "text-rose-400 bg-rose-500/15",
  PATCH: "text-purple-400 bg-purple-500/15",
};

export default function ApiEndpoint({
  id,
  method,
  path,
  description,
  urlParams,
  requestBody,
  response,
  example,
  expandedSection,
  onToggle,
  copiedEndpoint,
  onCopy,
}: ApiEndpointProps) {
  const isExpanded = expandedSection === id;

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded mb-3 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold ${methodColors[method]} px-1.5 py-0.5 rounded`}>
            {method}
          </span>
          <code className="text-xs text-white/80">{path}</code>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-white/5 pt-3">
          <p className="text-xs text-white/50 mb-3">{description}</p>

          {urlParams && urlParams.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1.5">
                URL Parameters
              </p>
              <div className="text-xs text-white/60 space-y-1">
                {urlParams.map((param) => (
                  <div key={param.name}>
                    <code className="text-cyan-400">{param.name}</code> — {param.description}
                  </div>
                ))}
              </div>
            </div>
          )}

          {requestBody && requestBody.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1.5">
                Request Body
              </p>
              <div className="bg-slate-950/50 rounded p-2 text-[11px] font-mono">
                <div className="text-white/60">{"{"}</div>
                {requestBody.map((field, index) => (
                  <div key={field.name} className="pl-3">
                    <span className="text-cyan-400">"{field.name}"</span>
                    <span className="text-white/40">: </span>
                    <span className="text-amber-400">"{field.type}"</span>
                    {index < requestBody.length - 1 && <span className="text-white/30">,</span>}
                    <span className="text-white/30 ml-2">// {field.description}</span>
                  </div>
                ))}
                <div className="text-white/60">{"}"}</div>
              </div>
            </div>
          )}

          {response && response.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1.5">
                Response
              </p>
              <div className="bg-slate-950/50 rounded p-2 text-[11px] font-mono">
                <div className="text-white/60">{"{"}</div>
                {response.map((field, index) => (
                  <div key={field.name} className="pl-3">
                    <span className="text-cyan-400">"{field.name}"</span>
                    <span className="text-white/40">: </span>
                    {field.nested ? (
                      <>
                        <span className="text-white/40">{"{"}</span>
                        <span className="text-white/30"> {field.nested} </span>
                        <span className="text-white/40">{"}"}</span>
                      </>
                    ) : (
                      <span className="text-amber-400">"{field.type}"</span>
                    )}
                    {index < response.length - 1 && <span className="text-white/30">,</span>}
                  </div>
                ))}
                <div className="text-white/60">{"}"}</div>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1.5">
              Example
            </p>
            <div className="relative bg-slate-950/50 rounded p-2">
              <button
                onClick={() => onCopy(example, `${id}-curl`)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded transition-colors"
              >
                {copiedEndpoint === `${id}-curl` ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-white/40" />
                )}
              </button>
              <pre className="text-[11px] font-mono text-white/60 overflow-x-auto pr-8 whitespace-pre-wrap">
                {example}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
