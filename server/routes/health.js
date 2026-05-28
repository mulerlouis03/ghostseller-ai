import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V82 SERVER CRASH HOTFIX",
  phase:"AI Agents Safe Recovery",
  serverCrashFixed:true,
  agentsSafeMode:true,
  stable:true
}));
