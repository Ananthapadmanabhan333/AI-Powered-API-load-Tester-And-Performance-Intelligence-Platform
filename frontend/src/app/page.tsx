"use client";

import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Zap, Server, Network, BrainCircuit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeAgents, setActiveAgents] = useState(["SupervisorAgent (Standby)"]);

  // Mock WebSocket Telemetry
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const newData = [...prev, {
          time: new Date().toLocaleTimeString(),
          rps: Math.floor(Math.random() * 5000) + 10000,
          latency: Math.random() * 100 + 50
        }];
        return newData.slice(-20); // Keep last 20 data points
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const startOrchestration = async () => {
    setIsRunning(true);
    setActiveAgents(["SupervisorAgent (Active)", "LoadAgent (Ramping)", "ObservabilityAgent (Polling)"]);
    
    setTimeout(() => {
      setActiveAgents(["LoadAgent (Max Load)", "ObservabilityAgent (Anomaly Detected)", "RCA_Agent (Investigating)"]);
    }, 5000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-black">
      <header className="w-full flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aegis-blue/20 rounded-lg">
            <ShieldAlert className="text-aegis-blue w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Aegis OS</h1>
            <p className="text-sm text-zinc-400">Autonomous Intelligence Plane</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={startOrchestration}
            disabled={isRunning}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              isRunning 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-aegis-blue hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
            }`}
          >
            {isRunning ? 'Orchestration Active' : 'Initiate SRE Workflow'}
          </button>
        </div>
      </header>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Global Throughput</span>
          </div>
          <span className="text-4xl font-bold font-mono">
            {telemetry.length > 0 ? telemetry[telemetry.length - 1].rps.toLocaleString() : "0"} <span className="text-lg text-zinc-500">RPS</span>
          </span>
        </div>
        
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-aegis-purple/5 to-transparent animate-pulse-slow" />
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-medium">p99 Latency</span>
          </div>
          <span className="text-4xl font-bold font-mono text-aegis-cyan">
            {telemetry.length > 0 ? telemetry[telemetry.length - 1].latency.toFixed(1) : "0.0"} <span className="text-lg text-zinc-500">ms</span>
          </span>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <BrainCircuit className="w-4 h-4" />
            <span className="text-sm font-medium">Active Agents</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {activeAgents.map((agent, i) => (
              <span key={i} className="text-sm font-mono text-aegis-blue bg-aegis-blue/10 px-2 py-1 rounded w-fit border border-aegis-blue/20">
                {agent}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl h-[400px]">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Real-Time Telemetry Stream</h2>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetry}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="time" stroke="#52525b" fontSize={12} tickLine={false} />
              <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="rps" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 overflow-y-auto h-[400px]">
          <h2 className="text-lg font-semibold text-zinc-200">Bottleneck Radar</h2>
          {!isRunning ? (
            <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
              Waiting for telemetry...
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-2">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                 <div className="flex justify-between items-start mb-2">
                   <span className="text-sm font-semibold text-red-400 flex items-center gap-2">
                     <Server className="w-4 h-4" /> Primary DB Replica
                   </span>
                   <span className="text-xs text-zinc-500 font-mono">12s ago</span>
                 </div>
                 <p className="text-xs text-zinc-400 mb-2">CPU Utilization &gt; 90%. Suspected missing index on `orders` table.</p>
                 <div className="text-xs text-aegis-purple font-mono bg-aegis-purple/10 p-2 rounded border border-aegis-purple/20">
                   RCA Agent: Proposing new compound index...
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
