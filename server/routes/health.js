import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V89 DASHBOARD LAYOUT FIX",
  phase:"Sidebar + Dashboard Layout Cleanup",
  basedOn:"V88",
  leftSidebarGrouped:true,
  compactDashboardCards:true,
  cleanerPositioning:true,
  tiktokLaunchPriority:true,
  unifiedBrainCrashFixed:true
}));
