import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V105 PLATFORM STABILIZATION",
  phase:"Users + Feedback + Account + Stats Stabilization",
  usersManagement:true,
  feedbackCenter:true,
  accountPageImproved:true,
  ownerStatsImproved:true
}));
