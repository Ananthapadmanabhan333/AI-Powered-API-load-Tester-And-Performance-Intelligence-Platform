from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from pydantic import BaseModel

class ChaosOrchestrator:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o", temperature=0.2)
        
    def analyze_blast_radius(self, target_service: str, infrastructure_graph: dict) -> str:
        """
        AI evaluates the potential catastrophic impact of injecting a failure.
        """
        prompt = f"""
        You are an expert Chaos Engineering Architect. 
        Target Service to attack: {target_service}
        Infrastructure Topology: {infrastructure_graph}
        
        Analyze the blast radius. If we inject a 500ms network delay into this service, 
        will it cause a cascading failure to the billing database? 
        Output a risk score (1-10) and an explanation.
        """
        response = self.llm.invoke(prompt)
        return response.content

    def inject_kubernetes_fault(self, fault_type: str, namespace: str, target: str):
        """
        Executes actual Chaos Mesh / LitmusChaos API calls.
        (Abstracted for safety)
        """
        # E.g., apply a NetworkChaos CRD
        print(f"💀 [CHAOS AGENT] Injecting {fault_type} into {namespace}/{target}")
        return {"status": "injected", "fault": fault_type, "target": target}

def run_chaos_evaluation(context: dict):
    agent = ChaosOrchestrator()
    analysis = agent.analyze_blast_radius(context["target_service"], context["topology"])
    
    if "Risk Score: 10" in analysis:
        print("🛡️ [CHAOS AGENT] Action aborted. Blast radius too high.")
        return {"action": "aborted", "reason": analysis}
        
    result = agent.inject_kubernetes_fault("NetworkDelay-500ms", "production", context["target_service"])
    return {"analysis": analysis, "injection_result": result}
