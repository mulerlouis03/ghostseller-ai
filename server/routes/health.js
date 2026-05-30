import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V100.1 OWNER LOGOUT FIXED",
  phase:"Stable Owner Access + Reliable User Logout",
  ownerAccessStable:true,
  ownerRoutes:["/owner","/admin"],
  logoutAlwaysVisible:true,
  topRightLogout:true,
  floatingBackupLogout:true,
  usersDashboardReady:true
}));
