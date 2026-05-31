import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V114 UX DASHBOARD PRO",
  phase:"Professional user dashboard UX",
  actionCards:true,
  betaMessaging:true,
  tiktokWaitingState:true,
  roadmap:true,
  emptyStateImproved:true,
  ownerBillingExclusion:true
}));
