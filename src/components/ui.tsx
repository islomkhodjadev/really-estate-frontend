import { ReactNode } from "react";

/**
 * Lumen — Editorial Proptech UI primitives.
 * Dependency-free presentational helpers shared across pages.
 */

/** A page section with an editorial eyebrow + display title and content below. */
export function Section({
  title,
  eyebrow,
  children,
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="section animate-fade-up">
      {(eyebrow || title) && (
        <header className="mb-6">
          {eyebrow && (
            <div className="eyebrow mb-3">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                aria-hidden="true"
              />
              {eyebrow}
            </div>
          )}
          {title && <h2 className="section-title">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  );
}

/** A single big tabular stat with a muted label. */
export function Stat({ n, label }: { n: ReactNode; label: ReactNode }) {
  return (
    <div className="stat">
      <div className="n">{n}</div>
      <div className="muted mt-0.5">{label}</div>
    </div>
  );
}

/** Indigo loading spinner. */
export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-muted" role="status">
      <span
        className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600"
        aria-hidden="true"
      />
      <span className="text-sm font-medium">{label}…</span>
    </div>
  );
}

/** Centered empty / zero-result placeholder. */
export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-surface px-6 py-16 text-center ring-1 ring-ink/[0.05] shadow-card">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {hint && <p className="muted mt-1 max-w-sm">{hint}</p>}
    </div>
  );
}
