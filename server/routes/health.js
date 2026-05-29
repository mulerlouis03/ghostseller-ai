import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V97 CLEAN LAUNCH EDITION",
  phase:"Public User Dashboard + Owner Console",
  cleanLaunch:true,
  publicDashboard:true,
  ownerConsole:true,
  noTechnicalTermsForUsers:true,
  stripePlansReady:true,
  tiktokReviewSubmitted:true
}));
