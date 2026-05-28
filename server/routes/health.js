import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V74 ADMIN DASHBOARD PRO",
  phase:"Admin Control Center",
  adminDashboard:true,
  userManagement:true,
  planManagement:true,
  creditsManagement:true,
  emailLogs:true,
  usageMonitoring:true,
  betaReady:true
}));
