"use client";

import { AlertTriangle } from "lucide-react";

import { formatBytes } from "@/lib/utils";
import { STORAGE_MAX_BYTES } from "@/lib/constants";

interface StorageWarningProps {
  sizeBytes: number;
}

export function StorageWarning({ sizeBytes }: StorageWarningProps) {
  const percentage = Math.min(
    100,
    Math.round((sizeBytes / STORAGE_MAX_BYTES) * 100)
  );

  return (
    <div
      className="mt-4 flex w-full max-w-2xl items-start gap-3 rounded-lg
        border border-amber-500/20 bg-amber-500/5 px-4 py-3"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
      <div className="text-xs leading-relaxed text-amber-200/80">
        <span className="font-medium text-amber-200">Storage {percentage}% full</span>
        {" "}— Using {formatBytes(sizeBytes)} of ~{formatBytes(STORAGE_MAX_BYTES)}.
        Consider clearing images or old content to free space.
      </div>
    </div>
  );
}
