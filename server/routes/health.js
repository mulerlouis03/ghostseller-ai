import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V115 PREMIUM UX DASHBOARD",
  phase:"Premium user dashboard polish",
  premiumHero:true,
  recentActivity:true,
  statsEmptyState:true,
  tiktokClearSplit:true,
  visualRoadmap:true
}));
