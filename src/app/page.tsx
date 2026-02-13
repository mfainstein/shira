import { PoemFeed } from "@/components/poem/PoemFeed";
import { TypewriterTagline } from "@/components/ui/TypewriterTagline";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="text-center py-16 px-4">
        <h1 className="text-5xl md:text-6xl poem-title mb-6 ink-title">shira</h1>
        <TypewriterTagline />
      </header>

      {/* Feed */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <PoemFeed />
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-charcoal-light/50">
        <p>shira.ink</p>
      </footer>
    </main>
  );
}
