// Tester script for the critique-plan API
// Run with: npx ts-node scripts/test-critique-plan.ts
//
// This script:
// 1. Loads a plan from last-generated-plan.json (from test-build-plan.ts) or uses a sample plan
// 2. Calls /critique-plan to get constructive criticism and suggestions

(async () => {
  const CRITIQUE_PLAN_URL = "http://localhost:3000/api/pearl/critique-plan";

  // Replace with a valid userId from your database
  const USER_ID = "2b76f673-7b00-4205-9520-b665b6f66be2";

  // Try to load the plan from the last build-plan run, or use a sample
  let plan: any;

  try {
    const fs = await import("fs");
    const savedPlan = fs.readFileSync("./scripts/last-generated-plan.json", "utf-8");
    const planData = JSON.parse(savedPlan);
    plan = planData.plan;
    console.log("Loaded plan from last-generated-plan.json\n");
  } catch {
    console.log("No saved plan found, using sample plan\n");

    // Sample plan for testing
    plan = {
      title: "LLM-Based Automated Code Review for Security Vulnerability Detection",
      abstract: `This research proposes a novel approach to automated code review using large language models
(LLMs) for detecting security vulnerabilities. Unlike traditional static analysis tools that rely on
predefined patterns, our approach leverages the semantic understanding capabilities of LLMs to identify
subtle security issues including injection vulnerabilities, authentication flaws, and data exposure risks.
We propose a multi-stage pipeline combining few-shot prompting with retrieval-augmented generation to
maintain context across large codebases while ensuring consistency in vulnerability assessments.`,
      introduction: {
        background: `Static code analysis has been a cornerstone of software security for decades.
Traditional tools like Semgrep, CodeQL, and SonarQube rely on pattern matching and dataflow analysis
to detect vulnerabilities. However, these tools often struggle with context-dependent vulnerabilities
and produce high false positive rates.`,
        problemStatement: `Current static analysis tools lack semantic understanding, leading to missed
vulnerabilities and excessive false positives. There is a need for approaches that can understand code
context and detect subtle security issues.`,
        researchQuestions: [
          "How effectively can LLMs detect security vulnerabilities compared to traditional static analysis?",
          "What prompting strategies optimize LLM performance for code security analysis?",
          "How can we maintain context and consistency when analyzing large codebases?",
        ],
        objectives: [
          "Develop an LLM-based vulnerability detection pipeline",
          "Benchmark against existing tools on standard datasets",
          "Evaluate few-shot vs fine-tuning approaches",
        ],
      },
      methodology: {
        overview: `We will develop a multi-stage pipeline that combines LLM capabilities with
retrieval-augmented generation for context-aware vulnerability detection.`,
        phases: [
          {
            name: "Dataset Collection",
            description: "Gather vulnerable code samples from multiple sources",
            steps: [
              "Collect samples from CVE databases",
              "Extract examples from security benchmarks",
              "Create synthetic examples for rare vulnerability types",
            ],
            expectedOutputs: ["Labeled dataset of 10,000+ code samples"],
            tools: ["GitHub API", "NVD API"],
          },
          {
            name: "Pipeline Development",
            description: "Build the LLM-based analysis pipeline",
            steps: [
              "Design prompt templates for different vulnerability categories",
              "Implement RAG system for codebase context",
              "Build confidence scoring mechanism",
            ],
            expectedOutputs: ["Working prototype", "API endpoints"],
            tools: ["OpenAI API", "LangChain", "Vector DB"],
          },
        ],
        dataCollection: "Primary data from public CVE databases and security benchmarks",
        analysisApproach: "Quantitative comparison of precision/recall against baselines",
      },
      expectedContributions: [
        "Novel LLM-based approach to vulnerability detection",
        "Comprehensive benchmark comparison with existing tools",
        "Open-source implementation and dataset",
      ],
      timeline: [
        {
          phase: "Dataset Collection",
          duration: "Weeks 1-4",
          milestones: ["Initial dataset ready", "Labeling complete"],
        },
        {
          phase: "Pipeline Development",
          duration: "Weeks 5-10",
          milestones: ["Prototype working", "RAG integrated"],
        },
      ],
      potentialChallenges: [
        {
          challenge: "LLM hallucinations producing false positives",
          mitigation: "Implement confidence thresholds and verification steps",
        },
        {
          challenge: "Context window limitations for large files",
          mitigation: "Use chunking strategies and RAG for relevant context retrieval",
        },
      ],
    };
  }

  // Optional: specify areas to focus the critique on
  const FOCUS_AREAS = [
    "methodology rigor",
    "evaluation approach",
  ];

  console.log("=== CRITIQUE-PLAN TESTER ===\n");
  console.log(`Plan Title: "${plan.title}"\n`);
  console.log(`Focus Areas: ${FOCUS_AREAS.join(", ")}\n`);

  try {
    const startTime = Date.now();

    const response = await fetch(CRITIQUE_PLAN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: USER_ID,
        plan: plan,
        focusAreas: FOCUS_AREAS,
      }),
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`Critique-plan status: ${response.status} (took ${elapsed}s)\n`);

    const data = await response.json();

    if (!response.ok) {
      console.error("Error:", data.error);
      return;
    }

    const { critique, planTitle } = data;

    console.log("=== PLAN CRITIQUE ===\n");
    console.log(`Reviewed: "${planTitle}"\n`);

    // Overall Assessment
    console.log("--- OVERALL ASSESSMENT ---");
    console.log(`Score: ${critique.overallAssessment.score}/10`);
    console.log(`Readiness: ${critique.overallAssessment.readinessLevel.replace(/_/g, " ")}`);
    console.log(`\nSummary: ${critique.overallAssessment.summary}\n`);

    // Section Critiques
    if (critique.sectionCritiques?.length > 0) {
      console.log("--- SECTION-BY-SECTION CRITIQUE ---\n");
      critique.sectionCritiques.forEach((section: any) => {
        console.log(`[${section.priority.toUpperCase()}] ${section.section}`);

        if (section.strengths?.length > 0) {
          console.log("  Strengths:");
          section.strengths.forEach((s: string) => console.log(`    + ${s}`));
        }

        if (section.weaknesses?.length > 0) {
          console.log("  Weaknesses:");
          section.weaknesses.forEach((w: string) => console.log(`    - ${w}`));
        }

        if (section.suggestions?.length > 0) {
          console.log("  Suggestions:");
          section.suggestions.forEach((s: string) => console.log(`    → ${s}`));
        }
        console.log();
      });
    }

    // Methodological Concerns
    if (critique.methodologicalConcerns?.length > 0) {
      console.log("--- METHODOLOGICAL CONCERNS ---\n");
      critique.methodologicalConcerns.forEach((concern: any, i: number) => {
        console.log(`${i + 1}. ${concern.concern}`);
        console.log(`   Impact: ${concern.impact}`);
        console.log(`   Recommendation: ${concern.recommendation}\n`);
      });
    }

    // Missing Elements
    if (critique.missingElements?.length > 0) {
      console.log("--- MISSING ELEMENTS ---\n");
      critique.missingElements.forEach((element: string) => {
        console.log(`  • ${element}`);
      });
      console.log();
    }

    // Suggested Improvements
    if (critique.suggestedImprovements?.length > 0) {
      console.log("--- SUGGESTED IMPROVEMENTS ---\n");
      critique.suggestedImprovements.forEach((improvement: any, i: number) => {
        console.log(`${i + 1}. Area: ${improvement.area}`);
        console.log(`   Current: ${improvement.currentState}`);
        console.log(`   Suggested: ${improvement.suggestedChange}`);
        console.log(`   Rationale: ${improvement.rationale}\n`);
      });
    }

    // Questions to Consider
    if (critique.questionsToConsider?.length > 0) {
      console.log("--- QUESTIONS TO CONSIDER ---\n");
      critique.questionsToConsider.forEach((question: string, i: number) => {
        console.log(`  ${i + 1}. ${question}`);
      });
      console.log();
    }

    console.log("=== END OF CRITIQUE ===\n");

  } catch (error) {
    console.error("Critique-plan request failed:", error);
  }
})();
