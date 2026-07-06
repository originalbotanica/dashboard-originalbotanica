import Link from "next/link";

/**
 * Shared shell for the public legal pages (Privacy, Terms, Cancellation).
 * Header with the wordmark, a draft notice, the title, and a readable column.
 * The slim site footer (with the legal links) is supplied by the root layout.
 */
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="display text-lg text-[var(--foreground)]">
            Original Botanica
          </Link>
          <Link href="/" className="nav-link text-[var(--accent)]">
            ← Home
          </Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <p className="eyebrow mb-3 text-[var(--foreground-subtle)]">{updated}</p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-6">{title}</h1>

        <div className="legal-prose space-y-6 text-[var(--foreground-muted)] leading-relaxed">
          {children}
        </div>
      </section>
    </main>
  );
}
