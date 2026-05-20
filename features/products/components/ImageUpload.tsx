"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/shared/lib/supabase/client";
import { cn } from "@/shared/lib/utils";

const BUCKET = "product-images";
const MAX_SIZE_MB = 5;
const ACCEPTED_MIME: Record<string, string[]> = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/avif": [],
};

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
}

type UploadState = "idle" | "uploading" | "success" | "error";

function fileExt(file: File) {
  return file.name.split(".").pop() ?? "jpg";
}

async function uploadToSupabase(file: File): Promise<string> {
  const supabase = createClient();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt(file)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

export function ImageUpload({ value, onChange, error: fieldError }: ImageUploadProps) {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (uploadState === "uploading") return;
      setUploadError(null);
      setUploadState("uploading");
      setProgress(0);

      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 12, 85));
      }, 120);

      try {
        const url = await uploadToSupabase(file);
        clearInterval(interval);
        setProgress(100);
        setUploadState("success");
        onChange(url);
        timerRef.current = setTimeout(() => setUploadState("idle"), 1800);
      } catch (err) {
        clearInterval(interval);
        setProgress(0);
        setUploadState("error");
        setUploadError(err instanceof Error ? err.message : "Upload failed.");
        timerRef.current = setTimeout(() => setUploadState("idle"), 3000);
      }
    },
    [onChange, uploadState],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: ACCEPTED_MIME,
    maxSize: MAX_SIZE_MB * 1024 * 1024,
    multiple: false,
    disabled: uploadState === "uploading",
    onDropAccepted: ([file]) => handleFile(file),
    onDropRejected: ([rejection]) => {
      const reason = rejection.errors[0];
      if (reason?.code === "file-too-large") {
        setUploadError(`File must be under ${MAX_SIZE_MB} MB.`);
      } else if (reason?.code === "file-invalid-type") {
        setUploadError("Only JPG, PNG, WebP, or AVIF images are accepted.");
      } else {
        setUploadError("Invalid file.");
      }
      setUploadState("error");
      timerRef.current = setTimeout(() => {
        setUploadState("idle");
        setUploadError(null);
      }, 3000);
    },
  });

  const removeImage = () => {
    onChange(null);
    setUploadState("idle");
    setUploadError(null);
    setProgress(0);
  };

  const hasImage = !!value;
  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";
  const isError = uploadState === "error" || !!fieldError;
  const errorMsg = uploadError ?? fieldError;

  return (
    <div className="flex flex-col gap-2">
      {hasImage ? (
        /* ── Preview state ── */
        <div className="group relative h-44 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Product preview"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Hidden input for replace */}
          <input
            ref={replaceInputRef}
            type="file"
            accept={Object.keys(ACCEPTED_MIME).join(",")}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />

          <div className="absolute bottom-0 left-0 right-0 flex translate-y-1 items-center justify-between px-3 py-2.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => replaceInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <Upload className="h-3 w-3" />
              Replace
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="flex items-center gap-1.5 rounded-lg bg-destructive/80 px-2.5 py-1.5 text-[11.5px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-destructive"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>

          {isSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/40 backdrop-blur-[2px]">
              <div className="flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-(--color-status-converted)" />
                <span className="text-[12px] font-semibold text-foreground">Uploaded</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          {...getRootProps()}
          className={cn(
            "relative h-44 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            isDragActive && !isDragReject
              ? "scale-[1.01] border-accent bg-accent-subtle shadow-md"
              : isDragReject
                ? "border-destructive bg-error-subtle"
                : isError
                  ? "border-destructive bg-error-subtle"
                  : "border-border bg-card hover:border-accent hover:bg-accent-subtle",
            isUploading && "cursor-not-allowed border-accent bg-accent-subtle",
          )}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            /* ── Uploading state ── */
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6">
              <div className="relative h-10 w-10">
                <svg className="h-10 w-10 -rotate-90" viewBox="0 0 40 40">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="var(--color-border)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 100.5} 100.5`}
                    className="transition-all duration-150"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-accent">
                  {progress}%
                </span>
              </div>
              <div className="space-y-0.5 text-center">
                <p className="text-[12.5px] font-semibold text-foreground">Uploading…</p>
                <p className="text-[11px] text-muted-foreground">Please wait</p>
              </div>
              <div className="h-0.5 w-32 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            /* ── Idle / drag state ── */
            <div
              className={cn(
                "flex h-full flex-col items-center justify-center gap-3 px-6 transition-transform duration-200",
                isDragActive && "scale-95",
              )}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-200",
                  isDragActive && !isDragReject
                    ? "border-accent bg-accent text-primary-foreground shadow-md"
                    : isDragReject || isError
                      ? "border-destructive/30 bg-error-subtle text-destructive"
                      : "border-border bg-surface-raised text-muted-foreground",
                )}
              >
                {isDragReject || isError ? (
                  <AlertCircle className="h-5 w-5" />
                ) : isDragActive ? (
                  <Upload className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>

              <div className="space-y-1 text-center">
                <p className="text-[12.5px] font-semibold text-foreground">
                  {isDragReject
                    ? "File not accepted"
                    : isDragActive
                      ? "Drop to upload"
                      : "Upload product image"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Drag & drop or{" "}
                  <span className="font-medium text-accent underline underline-offset-2">
                    browse
                  </span>
                </p>
                <p className="text-[10.5px] text-muted-foreground">
                  JPG, PNG, WebP · max {MAX_SIZE_MB} MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {errorMsg && !isUploading && (
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />
          <p className="text-[11.5px] text-destructive">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
