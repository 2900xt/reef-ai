// Tester script for the build-plan API
// Run with: npx ts-node scripts/test-build-plan.ts
//
// This script:
// 1. Calls /api/reef/papers/new to search for relevant papers
// 2. Calls /api/reef/search/[id] to get matching arXiv paper IDs
// 3. Calls /extract-claims to get paper analyses
// 4. Calls /gen-angles to generate research angles
// 5. Calls /build-plan to generate a full research plan from the top angle

(async () => {
  const BASE_URL = "http://localhost:3000/api";
  const REEF_PAPERS_NEW_URL = `${BASE_URL}/reef/papers/new`;
  const REEF_SEARCH_URL = `${BASE_URL}/reef/search`;
  const EXTRACT_CLAIMS_URL = `${BASE_URL}/pearl/extract-claims`;
  const GEN_ANGLES_URL = `${BASE_URL}/pearl/gen-angles`;
  const BUILD_PLAN_URL = `${BASE_URL}/pearl/build-plan`;

  // Replace with a valid userId from your database
  const USER_ID = "2b76f673-7b00-4205-9520-b665b6f66be2";

  // Example research idea
  const RESEARCH_IDEA = `
I'm interested in exploring how large language models can be used for automated code review.
Specifically, I want to understand how LLMs can detect subtle bugs, security vulnerabilities,
and code quality issues that traditional static analysis tools might miss. I'm also curious
about how these models handle context from large codebases and maintain consistency in their feedback.
`.trim();

  // Optional draft plan notes
  const DRAFT_PLAN = `
I'm thinking of focusing on security vulnerability detection specifically.
Would like to benchmark against existing tools like Semgrep and CodeQL.
Interested in few-shot prompting approaches.
`.trim();

  interface PaperAnalysis {
    arxiv_id: string | null;
    claims: string[];
    methods: string[];
    limitations: string[];
    conclusion: string;
  }

  interface ResearchAngle {
    title: string;
    description: string;
    novelty: number;
    practicality: number;
    impact: number;
    overallScore: number;
    reasoning: string;
    briefPlan: string[];
    relatedLimitations: string[];
  }

  console.log("=== BUILD-PLAN TESTER ===\n");
  console.log("Research Idea:");
  console.log(`  "${RESEARCH_IDEA.slice(0, 100)}..."\n`);

  // Step 1: Search for relevant papers
  console.log("=== Step 1: Search for relevant papers ===\n");

  let arxivIds: string[] = [];

  try {
    const newSearchResponse = await fetch(REEF_PAPERS_NEW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        abstract: RESEARCH_IDEA,
      }),
    });

    console.log("Create search status:", newSearchResponse.status);

    const newSearchData = await newSearchResponse.json();

    if (!newSearchResponse.ok) {
      console.error("Create search error:", newSearchData.error);
      return;
    }

    const searchId = newSearchData.searchId;
    console.log(`Created search with ID: ${searchId}\n`);

    const searchResultsResponse = await fetch(`${REEF_SEARCH_URL}/${searchId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: USER_ID }),
    });

    const searchResultsData = await searchResultsResponse.json();

    if (!searchResultsResponse.ok) {
      console.error("Fetch search results error:", searchResultsData.error);
      return;
    }

    arxivIds = searchResultsData.papers
      .slice(0, 5)
      .map((paper: { arxiv_id: string }) => paper.arxiv_id);

    console.log(`Found ${searchResultsData.papers.length} relevant papers`);
    console.log(`Using top ${arxivIds.length} papers: ${arxivIds.join(", ")}\n`);
  } catch (error) {
    console.error("Search request failed:", error);
    return;
  }

  // Step 2: Extract claims
  console.log("=== Step 2: Extract claims from papers ===\n");

  let papers: PaperAnalysis[] = [];

  try {
    const extractResponse = await fetch(EXTRACT_CLAIMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        arxiv_ids: arxivIds,
        userId: USER_ID,
      }),
    });

    console.log("Extract-claims status:", extractResponse.status);

    const extractData = await extractResponse.json();

    if (!extractResponse.ok) {
      console.error("Extract-claims error:", extractData.error);
      return;
    }

    papers = extractData.papers;
    console.log(`Extracted claims from ${papers.length} papers\n`);
  } catch (error) {
    console.error("Extract-claims request failed:", error);
    return;
  }

  // Step 3: Generate angles
  console.log("=== Step 3: Generate research angles ===\n");

  let selectedAngle: ResearchAngle | null = null;

  try {
    const anglesResponse = await fetch(GEN_ANGLES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        researchIdea: RESEARCH_IDEA,
        papers: papers,
      }),
    });

    console.log("Gen-angles status:", anglesResponse.status);

    const anglesData = await anglesResponse.json();

    if (!anglesResponse.ok) {
      console.error("Gen-angles error:", anglesData.error);
      return;
    }

    // Select the top angle
    selectedAngle = anglesData.angles[0];
    console.log(`Generated ${anglesData.angles.length} angles`);
    console.log(`Selected top angle: "${selectedAngle?.title}"\n`);
    console.log(`  Score: ${selectedAngle?.overallScore.toFixed(2)}/10`);
    console.log(`  Description: ${selectedAngle?.description.slice(0, 150)}...\n`);
  } catch (error) {
    console.error("Gen-angles request failed:", error);
    return;
  }

  if (!selectedAngle) {
    console.error("No angle selected");
    return;
  }

  // Step 4: Build the full plan
  console.log("=== Step 4: Build full research plan ===\n");
  console.log("This may take a while as it fetches and analyzes similar papers...\n");

  try {
    const startTime = Date.now();

    const buildPlanResponse = await fetch(BUILD_PLAN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        selectedAngle: selectedAngle,
        userIdea: RESEARCH_IDEA,
        draftPlan: DRAFT_PLAN,
      }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Build-plan status: ${buildPlanResponse.status} (took ${elapsed}s)\n`);

    const planData = await buildPlanResponse.json();

    if (!buildPlanResponse.ok) {
      console.error("Build-plan error:", planData.error);
      return;
    }

    const { plan, inspirationSources, basedOnAngle } = planData;

    // Print the full research plan
    console.log("=== GENERATED RESEARCH PLAN ===\n");
    console.log(`Based on angle: "${basedOnAngle}"\n`);
    console.log(`Inspiration sources: ${inspirationSources.length} papers analyzed\n`);

    console.log("--- TITLE ---");
    console.log(plan.title);

    console.log("\n--- ABSTRACT ---");
    console.log(plan.abstract);

    if (plan.introduction) {
      console.log("\n--- INTRODUCTION ---");
      console.log("\nBackground:");
      console.log(plan.introduction.background);
      console.log("\nProblem Statement:");
      console.log(plan.introduction.problemStatement);
      console.log("\nResearch Questions:");
      plan.introduction.researchQuestions.forEach((rq: string, i: number) => {
        console.log(`  RQ${i + 1}: ${rq}`);
      });
      console.log("\nObjectives:");
      plan.introduction.objectives.forEach((obj: string, i: number) => {
        console.log(`  ${i + 1}. ${obj}`);
      });
    }

    if (plan.methodology) {
      console.log("\n--- METHODOLOGY ---");
      console.log("\nOverview:");
      console.log(plan.methodology.overview);

      console.log("\nPhases:");
      plan.methodology.phases.forEach((phase: any, i: number) => {
        console.log(`\n  Phase ${i + 1}: ${phase.name}`);
        console.log(`  Description: ${phase.description}`);
        console.log("  Steps:");
        phase.steps.forEach((step: string, j: number) => {
          console.log(`    ${j + 1}. ${step}`);
        });
        console.log(`  Expected Outputs: ${phase.expectedOutputs.join(", ")}`);
        if (phase.tools) {
          console.log(`  Tools: ${phase.tools.join(", ")}`);
        }
      });

      if (plan.methodology.dataCollection) {
        console.log("\nData Collection:");
        console.log(plan.methodology.dataCollection);
      }
      if (plan.methodology.analysisApproach) {
        console.log("\nAnalysis Approach:");
        console.log(plan.methodology.analysisApproach);
      }
    }

    if (plan.expectedContributions?.length > 0) {
      console.log("\n--- EXPECTED CONTRIBUTIONS ---");
      plan.expectedContributions.forEach((contrib: string, i: number) => {
        console.log(`  ${i + 1}. ${contrib}`);
      });
    }

    if (plan.timeline?.length > 0) {
      console.log("\n--- TIMELINE ---");
      plan.timeline.forEach((t: any) => {
        console.log(`  ${t.phase} (${t.duration}):`);
        t.milestones.forEach((m: string) => console.log(`    - ${m}`));
      });
    }

    if (plan.potentialChallenges?.length > 0) {
      console.log("\n--- POTENTIAL CHALLENGES ---");
      plan.potentialChallenges.forEach((c: any, i: number) => {
        console.log(`  ${i + 1}. ${c.challenge}`);
        console.log(`     Mitigation: ${c.mitigation}`);
      });
    }

    if (inspirationSources?.length > 0) {
      console.log("\n--- METHODOLOGY INSPIRATIONS ---");
      inspirationSources.forEach((source: any) => {
        console.log(`\n  From ${source.arxiv_id}:`);
        console.log(`  Methods: ${source.methods.slice(0, 3).join(", ")}${source.methods.length > 3 ? "..." : ""}`);
        console.log(`  Relevance: ${source.relevance}`);
      });
    }

    console.log("\n=== END OF PLAN ===\n");

    // Save the plan to a JSON file for use with critique-plan
    const fs = await import("fs");
    const outputPath = "./scripts/last-generated-plan.json";
    fs.writeFileSync(outputPath, JSON.stringify(planData, null, 2));
    console.log(`Plan saved to ${outputPath} for use with test-critique-plan.ts`);

  } catch (error) {
    console.error("Build-plan request failed:", error);
  }
})();
