import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V64 AUTONOMOUS EXECUTION ENGINE",
  phase:"Autonomous Workflow Execution",
  autonomousExecution:true,
  workflowEngine:true,
  campaignRunners:true,
  retrySystem:true,
  executionLogs:true,
  executionMonitoring:true,
  brainToAction:true,
  semiAutonomous:true
}));
