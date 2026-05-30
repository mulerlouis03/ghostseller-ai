import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V102 CLEAN APP OWNER STABLE",
  phase:"Main App Replaced + Stable Owner Console",
  mainAppReplaced:true,
  oldDashboardBypassed:true,
  userMenuClean:true,
  accountPageUseful:true,
  logoutFixed:true,
  ownerConsoleStable:true,
  ownerUsersVisible:true
}));
