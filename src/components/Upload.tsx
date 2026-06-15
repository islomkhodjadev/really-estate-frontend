import { useRef, useState } from "react";
import { uploadFile, imgUrl } from "../api/client";
import { UploadCloud, X, FileText, RefreshCw, Check } from "../components/icons";

/**
 * Lumen — premium, accessible file-upload primitives.
 *
 * These replace ugly native `<input type="file">` elements with styled,
 * keyboard-accessible dropzones. The native input is hidden behind a
 * `<label>` so the whole surface is clickable and screen-reader friendly.
 *
 * All three components are controlled: they hold no link state of their own
 * and report results via `onChange`. While a request is in flight a
 * `RefreshCw` spinner (animate-spin) is shown.
 */

const DROPZONE =
  "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 " +
  "rounded-2xl border border-dashed border-ink/15 bg-bg px-6 py-8 text-center " +
  "transition-all duration-200 hover:border-brand-400 hover:bg-brand-50/40 " +
  "focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100";

/** Single image upload — dropzone, spinner while busy, preview + remove when set. */
export function ImageUpload({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (link: string) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const link = await uploadFile(file);
      if (link) onChange(link);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="field">
      {label && <label className="text-xs font-medium text-muted">{label}</label>}

      {value ? (
        <div className="group relative overflow-hidden rounded-2xl ring-1 ring-ink/[0.08] shadow-card">
          <img
            src={imgUrl(value)}
            alt={label || "Uploaded image"}
            className="h-48 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/70 p-0 text-white shadow-soft backdrop-blur-sm transition hover:bg-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className={DROPZONE}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only absolute inset-0 h-0 w-0 opacity-0"
            disabled={busy}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {busy ? (
            <>
              <RefreshCw className="h-7 w-7 animate-spin text-brand-600" />
              <span className="text-sm font-medium text-muted">Uploading…</span>
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                <UploadCloud className="h-6 w-6" />
              </span>
              <span className="text-sm font-semibold text-ink">Click to upload</span>
              <span className="text-xs text-muted">PNG, JPG or WEBP</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}

/** Multiple image upload — appends uploaded links and renders a thumbnail grid. */
export function MultiImageUpload({
  value,
  onChange,
  label,
}: {
  value: string[];
  onChange: (links: string[]) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const links: string[] = [];
      for (const file of Array.from(files)) {
        const link = await uploadFile(file);
        if (link) links.push(link);
      }
      if (links.length) onChange([...value, ...links]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div className="field">
      {label && <label className="text-xs font-medium text-muted">{label}</label>}

      <label className={DROPZONE}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only absolute inset-0 h-0 w-0 opacity-0"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {busy ? (
          <>
            <RefreshCw className="h-7 w-7 animate-spin text-brand-600" />
            <span className="text-sm font-medium text-muted">Uploading…</span>
          </>
        ) : (
          <>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
              <UploadCloud className="h-6 w-6" />
            </span>
            <span className="text-sm font-semibold text-ink">Click to upload</span>
            <span className="text-xs text-muted">Add one or more images</span>
          </>
        )}
      </label>

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((link, idx) => (
            <div
              key={`${link}-${idx}`}
              className="group relative aspect-square overflow-hidden rounded-2xl ring-1 ring-ink/[0.08] shadow-card"
            >
              <img
                src={imgUrl(link)}
                alt={`Image ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                aria-label={`Remove image ${idx + 1}`}
                className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 p-0 text-white shadow-soft backdrop-blur-sm transition hover:bg-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Generic file upload (contracts, docs) — styled button with filename + check when set. */
export function FileUpload({
  value,
  onChange,
  label,
  accept,
}: {
  value: string;
  onChange: (link: string) => void;
  label?: string;
  accept?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const link = await uploadFile(file);
      if (link) {
        setName(file.name);
        onChange(link);
      }
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const fileName = name || (value ? value.split("/").pop() || value : "");

  return (
    <div className="field">
      {label && <label className="text-xs font-medium text-muted">{label}</label>}

      <label
        className={
          "group inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed " +
          "px-4 py-3 text-sm font-medium transition-all duration-200 " +
          "focus-within:ring-2 focus-within:ring-brand-100 " +
          (value
            ? "border-emerald-200 bg-emerald-50/60 text-ink hover:border-emerald-300"
            : "border-ink/15 bg-bg text-ink hover:border-brand-400 hover:bg-brand-50/40")
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only absolute h-0 w-0 opacity-0"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span
          className={
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors " +
            (value
              ? "bg-emerald-100 text-emerald-600"
              : "bg-brand-50 text-brand-600 group-hover:bg-brand-100")
          }
        >
          {busy ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : value ? (
            <FileText className="h-4 w-4" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
        </span>

        <span className="flex min-w-0 flex-col">
          <span className="truncate text-ink">
            {busy ? "Uploading…" : value ? fileName : "Upload file"}
          </span>
          {value && !busy && (
            <span className="text-xs text-muted">Click to replace</span>
          )}
        </span>

        {value && !busy && (
          <Check className="ml-auto h-5 w-5 shrink-0 text-emerald-600" />
        )}
      </label>
    </div>
  );
}
