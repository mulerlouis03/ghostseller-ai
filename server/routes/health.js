import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V61 MULTI AGENT INTELLIGENCE",
  phase:"Multi-Agent Marketing Intelligence",
  multiAgentSystem:true,
  masterOrchestrator:true,
  contentAgent:true,
  growthAgent:true,
  salesAgent:true,
  analyticsAgent:true,
  brandAgent:true,
  outreachAgent:true,
  agentMemory:true,
  agentTasks:true
}));
