import { Job } from "bullmq";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { acquirePoem, generatePoemArt, analyzePoem, compareAnalyses } from "./phases";
import { AnalysisJobData, AnalysisJobResult } from "./queue";

export interface AgentConfig {
  analysisJobId: string;
  job: Job<AnalysisJobData>;
  db: PrismaClient;
}

export class PoetryAnalysisAgent {
  private config: AgentConfig;
  private totalCost: number = 0;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async execute(): Promise<AnalysisJobResult> {
    const { db, job } = this.config;
    const { poemId, params } = job.data;

    // Phase 1: Acquire poem (0-10%)
    await this.updateProgress(5, "ACQUIRING", "Acquiring poem");
    const acquired = await acquirePoem(db, {
      acquisitionMode: params.acquisitionMode,
      topic: params.topic,
      language: params.language,
      sourceModel: params.sourceModel,
      poemId: poemId || undefined,
    });
    this.totalCost += acquired.cost;
    await this.log("acquire", "acquire_poem", { mode: params.acquisitionMode }, {
      poemId: acquired.poemId,
      title: acquired.title,
    });

    // Phase 2: Generate art (10-30%)
    await this.updateProgress(15, "GENERATING_ART", "Generating artwork");
    let artGenerated = false;
    try {
      await generatePoemArt(db, {
        poemId: acquired.poemId,
        title: acquired.title,
        content: acquired.content,
        themes: acquired.themes,
        artStyle: params.artStyle,
      });
      artGenerated = true;
      await this.log("art", "generate_art", { style: params.artStyle }, { success: true });
    } catch (error) {
      console.error("Art generation failed:", error);
      await this.log("art", "generate_art", { style: params.artStyle }, {
        success: false,
        error: error instanceof Error ? error.message : "Unknown",
      });
    }
    await this.updateProgress(30, "GENERATING_ART", "Artwork complete");

    // Phase 3: Analyze with all 3 AIs (30-70%)
    await this.updateProgress(35, "ANALYZING", "Analyzing poem with three AI models");

    // Load the poem to get full details
    const poem = await db.poem.findUnique({ where: { id: acquired.poemId } });
    if (!poem) throw new Error("Poem not found after acquisition");

    const analysisContent = poem.language === "HE"
      ? (poem.contentHe || poem.content)
      : poem.content;

    const analysisResult = await analyzePoem(db, {
      poemId: acquired.poemId,
      title: poem.language === "HE" ? (poem.titleHe || poem.title) : poem.title,
      author: poem.language === "HE" ? (poem.authorHe || poem.author) : poem.author,
      content: analysisContent,
      themes: poem.themes as string[],
      language: poem.language as "EN" | "HE",
    });
    this.totalCost += analysisResult.totalCost;
    await this.log("analyze", "analyze_poem", {}, {
      completed: analysisResult.completed,
      failed: analysisResult.failed,
    });
    await this.updateProgress(70, "ANALYZING", "Analysis complete");

    // Phase 4: Compare analyses (70-90%)
    let comparisonGenerated = false;
    if (analysisResult.completed >= 2) {
      await this.updateProgress(75, "COMPARING", "Comparing AI perspectives");
      try {
        const compareResult = await compareAnalyses(db, {
          poemId: acquired.poemId,
          title: poem.title,
          language: poem.language as "EN" | "HE",
        });
        this.totalCost += compareResult.cost;
        comparisonGenerated = true;
        await this.log("compare", "compare_analyses", {}, {
          comparisonId: compareResult.comparisonId,
        });
      } catch (error) {
        console.error("Comparison failed:", error);
        await this.log("compare", "compare_analyses", {}, {
          error: error instanceof Error ? error.message : "Unknown",
        });
      }
    }
    await this.updateProgress(90, "COMPARING", "Comparison complete");

    // Phase 5: Create PoemFeature as DRAFT (90-100%)
    await this.updateProgress(95, "REVIEW", "Creating feature draft");

    const baseSlug = slugify(poem.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    await db.poemFeature.create({
      data: {
        poemId: acquired.poemId,
        slug,
        status: "DRAFT",
      },
    });

    await this.updateProgress(100, "COMPLETED", "Pipeline complete");

    return {
      poemId: acquired.poemId,
      analysesCompleted: analysisResult.completed,
      artGenerated,
      comparisonGenerated,
      totalCost: this.totalCost,
    };
  }

  private async updateProgress(
    progress: number,
    phase: string,
    message: string
  ) {
    await this.config.db.analysisJob.update({
      where: { id: this.config.analysisJobId },
      data: { progress, currentPhase: phase, totalCost: this.totalCost },
    });

    await this.config.job.updateProgress({ progress, phase, message });
  }

  private async log(
    phase: string,
    action: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>
  ) {
    await this.config.db.jobLog.create({
      data: {
        jobId: this.config.analysisJobId,
        phase,
        action,
        input: input as object,
        output: output as object,
      },
    });
  }
}
