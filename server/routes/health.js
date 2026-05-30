import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V108 USER DASHBOARD FEEDBACK STABLE",
  phase:"User dashboard reordered + dashboard feedback fixed",
  startHereFirst:true,
  dashboardFeedback:true,
  mobileStable:true,
  countersMovedDown:true,
  feedbackFallback:true
}));
