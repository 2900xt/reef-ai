"""LangGraph workflow — wires all nodes into the Pearl research pipeline."""

from __future__ import annotations

from langgraph.graph import StateGraph, START, END

from state import PearlState
from nodes import (
    search_papers,
    extract_claims,
    generate_angles,
    generate_abstract,
    build_plan,
    critique_plan,
)


def build_graph() -> StateGraph:
    """Construct and return the compiled Pearl research graph.

    Pipeline:
      START
        -> search_papers       (embed idea, vector search for related papers)
        -> extract_claims      (fetch PDFs, 2-pass claim extraction)
        -> generate_angles     (synthesize 5 angles, keep top 3)
        -> generate_abstract   (create proposal abstract for top angle)
        -> build_plan          (search for methodology papers, build full plan)
        -> critique_plan       (peer-review style critique)
        -> END
    """
    graph = StateGraph(PearlState)

    # Add nodes
    graph.add_node("search_papers", search_papers)
    graph.add_node("extract_claims", extract_claims)
    graph.add_node("generate_angles", generate_angles)
    graph.add_node("generate_abstract", generate_abstract)
    graph.add_node("build_plan", build_plan)
    graph.add_node("critique_plan", critique_plan)

    # Linear pipeline edges
    graph.add_edge(START, "search_papers")
    graph.add_edge("search_papers", "extract_claims")
    graph.add_edge("extract_claims", "generate_angles")
    graph.add_edge("generate_angles", "generate_abstract")
    graph.add_edge("generate_abstract", "build_plan")
    graph.add_edge("build_plan", "critique_plan")
    graph.add_edge("critique_plan", END)

    return graph.compile()


# Singleton compiled graph
pearl_graph = build_graph()
