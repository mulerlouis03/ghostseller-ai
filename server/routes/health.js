import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V82 AI AGENTS SYSTEM",
  phase:"Persistent AI Agents",
  aiAgents:true,
  persistentMemory:true,
  autonomousMissions:true,
  commandCenter:true,
  safeArchitecture:true
}));
