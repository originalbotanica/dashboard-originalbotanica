import Link from "next/link";

/**
 * Marketing homepage (logged out).
 *
 * This is a SCAFFOLD — final marketing copy and visual treatment come in
 * Phase 4 once we know the name and have the rituals library populated.
 * For now this page just renders enough structure to make the project
 * deployable and to verify fonts / tokens / nav are wired correctly.
 */
export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-3xl mx-auto">
        <p className="sublabel mb-6">Original Botanica</p>
        <h1 className="display text-5xl md:text-6xl mb-6">
          Your spiritual home, online.
        </h1>
        <p className="text-lg text-[var(--foreground-muted)] leading-relaxed mb-10 max-w-2xl">
          Daily tarot. Personal astrology. Your virtual altar. A flame
          for those who came before. A library of rituals from sixty‑six
          years of practice in the Bronx.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/signup" className="btn-primary">
            Start 7-day free trial
          </Link>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </div>
        <p className="eyebrow mt-12 text-[var(--foreground-subtle)]">
          The Bronx, since 1959
        </p>
      </section>
    </main>
  );
}
