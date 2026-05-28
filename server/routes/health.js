import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V72 CREDITS QUOTAS LIMITS ENFORCEMENT",
  phase:"Usage Control + SaaS Limits",
  creditSystem:true,
  quotaEnforcement:true,
  planLimits:true,
  usageTracking:true,
  blockedWhenLimitReached:true
}));
