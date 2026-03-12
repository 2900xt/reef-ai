"""State definitions for the Pearl research agent."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Pydantic models (mirror the TypeScript types from components/pearl/types.ts)
# ---------------------------------------------------------------------------


class PaperResult(BaseModel):
    arxiv_id: str
    title: str
    abstract: str
    authors: str | None = None
    publish_date: str | None = None
    similarity: float | None = None


class PaperAnalysis(BaseModel):
    arxiv_id: str | None = None
    claims: list[str] = []
    methods: list[str] = []
    limitations: list[str] = []
    conclusion: str = ""


class ResearchAngle(BaseModel):
    title: str
    description: str
    novelty: float
    practicality: float
    impact: float
    overall_score: float = 0.0
    reasoning: str = ""
    brief_plan: list[str] = []
    related_limitations: list[str] = []


class GeneratedAbstract(BaseModel):
    title: str
    abstract: str
    keywords: list[str] = []
    contributions: list[str] = []


class MethodologyInspiration(BaseModel):
    arxiv_id: str
    methods: list[str] = []
    relevance: str = ""


class ResearchPlanIntro(BaseModel):
    background: str = ""
    problem_statement: str = ""
    research_questions: list[str] = []
    objectives: list[str] = []


class MethodologyPhase(BaseModel):
    name: str
    description: str = ""
    steps: list[str] = []
    expected_outputs: list[str] = []
    tools: list[str] = []


class Methodology(BaseModel):
    overview: str = ""
    phases: list[MethodologyPhase] = []
    data_collection: str | None = None
    analysis_approach: str | None = None


class TimelineEntry(BaseModel):
    phase: str
    duration: str
    milestones: list[str] = []


class Challenge(BaseModel):
    challenge: str
    mitigation: str


class ResearchPlan(BaseModel):
    title: str = ""
    abstract: str = ""
    introduction: ResearchPlanIntro = ResearchPlanIntro()
    methodology: Methodology = Methodology()
    expected_contributions: list[str] = []
    timeline: list[TimelineEntry] = []
    potential_challenges: list[Challenge] = []
    references: list[str] = []


class CritiqueSection(BaseModel):
    section: str
    strengths: list[str] = []
    weaknesses: list[str] = []
    suggestions: list[str] = []
    priority: Literal["high", "medium", "low"] = "medium"


class MethodologicalConcern(BaseModel):
    concern: str
    impact: str
    recommendation: str


class SuggestedImprovement(BaseModel):
    area: str
    current_state: str
    suggested_change: str
    rationale: str


class OverallAssessment(BaseModel):
    summary: str = ""
    score: float = 5.0
    readiness_level: Literal[
        "needs_major_revision", "needs_minor_revision", "ready_for_execution"
    ] = "needs_major_revision"


class PlanCritique(BaseModel):
    overall_assessment: OverallAssessment = OverallAssessment()
    section_critiques: list[CritiqueSection] = []
    methodological_concerns: list[MethodologicalConcern] = []
    missing_elements: list[str] = []
    suggested_improvements: list[SuggestedImprovement] = []
    questions_to_consider: list[str] = []


# ---------------------------------------------------------------------------
# LangGraph state — this is what flows through the graph
# ---------------------------------------------------------------------------


@dataclass
class PearlState:
    """Mutable state carried through the research pipeline."""

    # Input
    research_idea: str = ""

    # Step 1 — paper search
    papers: list[PaperResult] = field(default_factory=list)

    # Step 2 — claim extraction
    paper_analyses: list[PaperAnalysis] = field(default_factory=list)

    # Step 3 — angle generation
    angles: list[ResearchAngle] = field(default_factory=list)

    # Step 4 — abstract generation (for a selected angle)
    selected_angle_index: int = 0
    generated_abstract: GeneratedAbstract | None = None

    # Step 5 — research plan
    methodology_inspirations: list[MethodologyInspiration] = field(default_factory=list)
    research_plan: ResearchPlan | None = None

    # Step 6 — critique
    critique: PlanCritique | None = None

    # Control
    error: str | None = None
    current_step: str = "idle"
    output_dir: str = ""
