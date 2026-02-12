import { SITE_CONFIG } from "@/config/site";
import { PoemFeed } from "@/components/poem/PoemFeed";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl poem-title mb-3">
          {SITE_CONFIG.name}
        </h1>
        <p className="text-charcoal-light font-[family-name:var(--font-body)] text-lg">
          {SITE_CONFIG.tagline}
        </p>
      </header>

      {/* Feed */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <PoemFeed />
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-charcoal-light/50">
        <p>{SITE_CONFIG.name} &mdash; {SITE_CONFIG.tagline}</p>
      </footer>
    </main>
  );
}
