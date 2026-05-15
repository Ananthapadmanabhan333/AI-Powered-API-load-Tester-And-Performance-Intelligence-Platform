# 🏛️ Aegis OS Architecture

## 1. System Architecture Overview

Aegis OS operates on a decoupled, microservice-based architecture designed for extreme scale and low latency. The system is split into four core planes:

### A. The Control Plane (Backend & Orchestration)
- **FastAPI**: Acts as the primary API gateway, serving the Next.js frontend and managing websocket connections for real-time telemetry.
- **LangGraph Multi-Agent System**: The "brain." It coordinates distinct agents (Chaos, Load, Observability, Root Cause Analysis).
- **PostgreSQL**: Stores persistent configurations, test definitions, historical metadata, RBAC policies, and agent memory.

### B. The Intelligence Plane (AI & Analytics)
- **Anomaly Detection Models**: Time-series forecasting (Prophet/ARIMA) running async to detect metric deviations.
- **Semantic Bottleneck Engine**: LLM pipelines (OpenAI/Anthropic) analyzing distributed trace payloads and logs from OpenTelemetry to identify root causes.

### C. The Execution Plane (Load & Chaos)
- **Go/Rust Load Workers**: Stateless nodes that pull traffic profiles from Kafka/Redis and blast target endpoints.
- **Chaos Orchestrator**: Interfaces with K8s API (or Chaos Mesh) to inject pod failures, network delays, and resource starvation.

### D. The Data & Observability Plane
- **OpenTelemetry Collector**: Ingests traces, metrics, and logs from both the load workers and the target application.
- **Prometheus/Mimir**: Time-series database for high-cardinality performance metrics.
- **Loki & Tempo**: High-performance logging and distributed tracing.
- **Kafka**: Streams real-time performance telemetry back to the backend for live UI updates.

---

## 2. Multi-Agent SRE Orchestration

Aegis OS uses LangGraph to construct a deterministic, recursive AI agent loop.

- **Supervisor Agent**: Takes the user's high-level goal (e.g., "Find the breaking point of the checkout service") and delegates.
- **Load Generation Agent**: Designs realistic traffic profiles, ramps up Go workers, and monitors error rates to avoid destroying the cluster unnecessarily.
- **Observability Agent**: Continuously polls Prometheus and Tempo. If latency spikes, it alerts the RCA agent.
- **RCA (Root Cause) Agent**: Analyzes the telemetry context, correlates it with recent code deployments or chaos events, and generates an actionable optimization plan.
- **Chaos Agent**: Safely injects failures (e.g., "Kill one DB replica") while the Load Agent is running, observing system resilience.

---

## 3. Database Schema (PostgreSQL)

```sql
CREATE TABLE test_scenarios (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    target_url VARCHAR(255),
    traffic_profile JSONB,
    created_at TIMESTAMP
);

CREATE TABLE load_executions (
    id UUID PRIMARY KEY,
    scenario_id UUID REFERENCES test_scenarios(id),
    status VARCHAR(50), -- RUNNING, FAILED, COMPLETED
    max_throughput INT,
    bottleneck_detected BOOLEAN,
    ai_summary TEXT
);

CREATE TABLE telemetry_anomalies (
    id UUID PRIMARY KEY,
    execution_id UUID REFERENCES load_executions(id),
    metric_name VARCHAR(100),
    expected_value FLOAT,
    actual_value FLOAT,
    severity VARCHAR(20),
    root_cause_analysis TEXT
);

CREATE TABLE chaos_experiments (
    id UUID PRIMARY KEY,
    execution_id UUID REFERENCES load_executions(id),
    fault_type VARCHAR(50), -- POD_KILL, NETWORK_DELAY
    target_selector JSONB,
    blast_radius VARCHAR(50),
    resilience_score FLOAT
);
```

---

## 4. Real-Time Streaming Analytics

1. Load workers emit latency metrics directly to **Kafka topics** (`metrics.latency`, `metrics.throughput`).
2. A FastStream/Kafka consumer in the Python backend processes these streams, aggregating them over 1-second tumbling windows.
3. The aggregated metrics are pushed to the frontend via **WebSockets**, powering the cinematic D3.js/Recharts dashboards at 60 FPS without overloading the browser.

---

## 5. Security & Governance Architecture

- **RBAC & SSO**: Integrated with SAML/OIDC. SREs have write access to chaos, devs have read-only analytics.
- **Tenant Isolation**: Separate K8s namespaces for different teams' load workers and telemetry buckets.
- **Audit Logging**: Every AI agent decision, chaos injection, and load test parameter change is immutably logged to an append-only S3 bucket for SOC2 compliance.
- **Safeguards**: Chaos Engineering Agent is restricted by a "Blast Radius" policy engine (OPA/Rego) preventing it from touching production namespaces.

---

## 6. Frontend Architecture (Next.js 15)

- **UI Framework**: App Router, Server Components for fast initial load, Client Components for live dashboards.
- **Aesthetics**: Glassmorphism panels, dark mode by default (`bg-zinc-950`), glowing accents for active traffic (`shadow-[0_0_15px_rgba(59,130,246,0.5)]`).
- **Interactive Topologies**: Using **React Flow** to render the "Infrastructure Digital Twin", showing microservices as nodes. When an anomaly is detected, the affected node pulses red.

---

## 7. Autonomous Scalability Optimization System

When a bottleneck is found (e.g., CPU saturation on an API pod at 5k RPS), the **Autoscaling Optimization Agent**:
1. Checks current HPA (Horizontal Pod Autoscaler) policies.
2. Checks historical scaling efficiency.
3. Generates a Terraform/Helm patch proposing a change to `targetCPUUtilizationPercentage` or suggesting a shift to KEDA-based queue-length scaling.
4. Estimates the monthly cloud cost impact of the change.
