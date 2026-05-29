import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V91 FINAL SIDEBAR REPAIR",
  phase:"Final Sidebar Repair",
  basedOn:"V90",
  oneSidebarOnly:true,
  duplicateMenuRemoved:true,
  logoutRestored:true,
  dashboardClean:true,
  unifiedBrainCrashFixed:true
}));
