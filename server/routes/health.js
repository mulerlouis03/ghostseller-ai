import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V90 SIDEBAR SINGLE CLEAN FIX",
  phase:"Remove Duplicate Menus + Clean Dashboard",
  basedOn:"V89",
  oneSidebarOnly:true,
  duplicateMenuRemoved:true,
  cleanerDashboard:true,
  unifiedBrainCrashFixed:true
}));
