import Link from "next/link";
import { getLocale } from "@/lib/i18n/server";

/**
 * Branded 404 — the default stark-white Next.js page broke the spell.
 * Dark, quiet, and it points the lost traveler back to a real road.
 */
export default async function NotFound() {
  const locale = await getLocale();
  const es = locale === "es";
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 text-center">
      <div>
        <p className="eyebrow mb-4 text-[var(--foreground-subtle)]">404</p>
        <h1 className="display text-3xl md:text-4xl leading-tight mb-4">
          {es ? "Este camino no lleva a ningún lado." : "This road leads nowhere."}
        </h1>
        <p className="text-[var(--foreground-muted)] leading-relaxed mb-8 max-w-md mx-auto">
          {es
            ? "La página que buscas no existe o se ha movido. Abramos otro camino."
            : "The page you're looking for doesn't exist or has moved. Let's open another road."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard" className="btn-primary inline-flex justify-center">
            {es ? "Tu práctica" : "Your practice"}
          </Link>
          <Link href="/" className="btn-ghost inline-flex justify-center">
            {es ? "Inicio" : "Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
