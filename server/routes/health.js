import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V84 REVENUE EMAIL AUTOMATION STABLE",
  basedOn:"V83 validated",
  unifiedBrainCrashFixed:true,
  revenueAutomation:true,
  trialSystem:true,
  upgradeEmails:true
}));
