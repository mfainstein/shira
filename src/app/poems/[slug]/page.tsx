import { notFound } from "next/navigation";
import db from "@/lib/db";
import { PoemDisplay } from "@/components/poem/PoemDisplay";
import { PoemArt } from "@/components/poem/PoemArt";
import { AnalysisTabs } from "@/components/analysis/AnalysisTabs";
import { ComparisonView } from "@/components/analysis/ComparisonView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PoemPage({ params }: PageProps) {
  const { slug } = await params;

  const feature = await db.poemFeature.findUnique({
    where: { slug },
    include: {
      poem: {
        include: {
          analyses: {
            where: { status: "COMPLETED" },
            select: {
              id: true,
              model: true,
              literaryAnalysis: true,
              thematicAnalysis: true,
              emotionalAnalysis: true,
              culturalAnalysis: true,
              hebrewAnalysis: true,
            },
          },
          art: {
            select: { id: true, style: true, drawCommands: true },
            take: 1,
          },
          comparison: {
            select: {
              comparisonContent: true,
              agreements: true,
              disagreements: true,
              insights: true,
            },
          },
        },
      },
    },
  });

  if (!feature || feature.status !== "PUBLISHED") {
    notFound();
  }

  const { poem } = feature;
  const art = poem.art[0];

  return (
    <main className="min-h-screen">
      {/* Back link */}
      <nav className="max-w-4xl mx-auto px-4 pt-8">
        <a
          href="/"
          className="text-sm text-charcoal-light hover:text-sepia transition-colors font-[family-name:var(--font-ui)]"
        >
          &larr; Back to all poems
        </a>
      </nav>

      {/* 1. Artwork */}
      {art && (
        <section className="max-w-4xl mx-auto px-4 pt-8 pb-4">
          <PoemArt
            slug={slug}
            drawCommands={art.drawCommands as Record<string, unknown> | null}
            style={art.style}
            title={poem.title}
          />
        </section>
      )}

      {/* 2. Poem text */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <PoemDisplay
          title={poem.title}
          titleHe={poem.titleHe}
          author={poem.author}
          authorHe={poem.authorHe}
          content={poem.content}
          contentHe={poem.contentHe}
          language={poem.language}
          vocabulary={poem.vocabulary as Record<string, string> | null}
        />
      </section>

      {/* 3. Ornamental divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="divider-ornament">&#10045;</div>
      </div>

      {/* 4. Analysis tabs */}
      {poem.analyses.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <AnalysisTabs
            analyses={poem.analyses}
            language={poem.language}
          />
        </section>
      )}

      {/* 5. Comparison */}
      {poem.comparison && (
        <section className="max-w-4xl mx-auto px-4 py-12 border-t border-border-light">
          <ComparisonView
            comparisonContent={poem.comparison.comparisonContent}
            agreements={poem.comparison.agreements as string[]}
            disagreements={poem.comparison.disagreements as string[]}
            insights={
              poem.comparison.insights as {
                model: string;
                insight: string;
              }[]
            }
            language={poem.language}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-charcoal-light/50">
        <p>shir.ai &mdash; Three Minds, One Poem</p>
      </footer>
    </main>
  );
}
