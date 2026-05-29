import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V88 DASHBOARD UX TIKTOK LAUNCH",
  phase:"Dashboard Cleanup + TikTok Launch",
  basedOn:"V87 validated",
  dashboardUX:true,
  groupedNavigation:true,
  tiktokLaunchMode:true,
  simplifiedMenu:true,
  productionFriendly:true
}));
