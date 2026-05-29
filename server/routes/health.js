import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V90 SIDEBAR HARD REPLACE",
  phase:"Hard Sidebar Replacement + Compact Dashboard",
  basedOn:"V89",
  hardSidebarReplace:true,
  compactRightLayout:true,
  tiktokFirst:true,
  productionFriendly:true,
  unifiedBrainCrashFixed:true
}));
