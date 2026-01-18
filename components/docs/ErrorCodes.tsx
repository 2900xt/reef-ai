"use client";

interface ErrorCode {
  code: number;
  description: string;
}

interface ErrorCodesProps {
  errors: ErrorCode[];
}

export default function ErrorCodes({ errors }: ErrorCodesProps) {
  return (
    <div className="bg-slate-900/60 border border-white/5 rounded p-3">
      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">
        Error Codes
      </p>
      <div className="space-y-1.5 text-xs">
        {errors.map((error) => (
          <div key={error.code} className="flex gap-3">
            <code className="text-rose-400 w-8">{error.code}</code>
            <span className="text-white/50">{error.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
