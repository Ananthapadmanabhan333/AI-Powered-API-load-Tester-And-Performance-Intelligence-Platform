from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator
from .chaos_agent import run_chaos_evaluation

# Define the state object for the multi-agent SRE workflow
class SREWorkflowState(TypedDict):
    target_service: str
    target_rps: int
    current_rps: int
    topology: dict
    bottlenecks: List[str]
    chaos_results: dict
    optimization_plan: str

def load_generator_node(state: SREWorkflowState):
    """
    Simulates the ramp-up of the Go/Rust load generators.
    """
    print(f"🌊 [LOAD AGENT] Ramping up traffic to {state['target_service']}... Current: {state['current_rps']} RPS")
    # Simulate reaching max traffic
    state["current_rps"] = state["target_rps"]
    return state

def observability_node(state: SREWorkflowState):
    """
    Simulates polling Prometheus/Tempo for anomalies.
    """
    print("🔭 [OBSERVABILITY AGENT] Analyzing telemetry streams...")
    if state["current_rps"] > 10000:
        state["bottlenecks"].append("High CPU contention on primary DB replica")
    return state

def rca_node(state: SREWorkflowState):
    """
    Root Cause Analysis using LLMs on telemetry data.
    """
    print(f"🕵️ [RCA AGENT] Investigating bottlenecks: {state['bottlenecks']}")
    if state["bottlenecks"]:
        state["optimization_plan"] = "1. Add Redis read-through cache. 2. Scale DB replicas to 3. 3. Adjust HPA targetCPU to 60%."
    return state

def chaos_node(state: SREWorkflowState):
    """
    Injects chaos based on the current load state.
    """
    result = run_chaos_evaluation(state)
    state["chaos_results"] = result
    return state

def create_sre_graph():
    """
    Builds the LangGraph orchestration.
    """
    workflow = StateGraph(SREWorkflowState)

    workflow.add_node("load_gen", load_generator_node)
    workflow.add_node("observability", observability_node)
    workflow.add_node("chaos", chaos_node)
    workflow.add_node("rca", rca_node)

    # Edge definitions
    workflow.set_entry_point("load_gen")
    workflow.add_edge("load_gen", "observability")
    workflow.add_edge("observability", "chaos")
    workflow.add_edge("chaos", "rca")
    workflow.add_edge("rca", END)

    return workflow.compile()

def run_sre_workflow(payload: dict):
    """
    Entry point for the FastAPI endpoint.
    """
    graph = create_sre_graph()
    
    initial_state = {
        "target_service": payload.get("target_url", "api.production.internal"),
        "target_rps": payload.get("max_rpm", 20000) // 60, # Convert RPM to RPS
        "current_rps": 0,
        "topology": {"db": "postgres", "cache": "redis", "api": "fastapi"},
        "bottlenecks": [],
        "chaos_results": {},
        "optimization_plan": ""
    }
    
    print("🤖 [SUPERVISOR] Initiating Autonomous SRE Workflow...")
    
    # Run the graph
    for output in graph.stream(initial_state):
        # In a real system, stream these state updates via WebSockets
        print(f"Transition: {list(output.keys())[0]}")
        
    print("✅ [SUPERVISOR] Workflow complete.")
    
