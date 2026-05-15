from fastapi import FastAPI, WebSocket, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import asyncio
import json

app = FastAPI(
    title="Aegis OS Intelligence API",
    description="Control Plane for Autonomous Performance SRE",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections for live telemetry dashboard
active_connections: list[WebSocket] = []

@app.on_event("startup")
async def startup_event():
    # Initialize Kafka consumer here
    print("🚀 Aegis OS Backend starting up... connecting to telemetry streams.")

@app.get("/health")
def health_check():
    return {"status": "operational", "agents": "standby"}

@app.post("/api/v1/orchestration/start")
async def start_autonomous_load_test(payload: dict, background_tasks: BackgroundTasks):
    """
    Triggers the LangGraph multi-agent loop.
    Payload contains target API, expected max RPM, and chaos parameters.
    """
    from .agents.supervisor import run_sre_workflow
    
    background_tasks.add_task(run_sre_workflow, payload)
    return {"status": "started", "execution_id": "uuid-placeholder", "message": "Supervisor SRE Agent dispatched."}

@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """
    Cinematic UI uses this for 60FPS telemetry updates (Latency, CPU, Anomaly pulses)
    """
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            # Simulate real-time streaming data from Kafka
            await asyncio.sleep(1)
            mock_data = {
                "rps": 15000,
                "p99_latency_ms": 124.5,
                "bottleneck_risk": "low",
                "active_agents": ["LoadAgent", "ObservabilityAgent"]
            }
            await websocket.send_text(json.dumps(mock_data))
    except Exception as e:
        active_connections.remove(websocket)
