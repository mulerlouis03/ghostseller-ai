import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V100.2 STABLE LAYOUT + USERS",
  phase:"Stable User Layout + Compact Owner Console + Users View",
  userDashboardStable:true,
  ownerDashboardCompact:true,
  logoutFixed:true,
  floatingButtonsRemoved:true,
  menuReduced:true,
  usersViewReady:true,
  usersStatsReady:true,
  contentWidthControlled:true
}));
