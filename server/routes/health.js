import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V63 UNIFIED AI BRAIN",
  phase:"Unified Business Intelligence",
  unifiedBrain:true,
  masterOrchestrator:true,
  agentFusion:true,
  memoryFusion:true,
  taskPrioritization:true,
  autonomousRecommendations:true,
  strategyLearning:true,
  growthContentSalesAnalyticsLinked:true,
  automationLayer:true
}));
