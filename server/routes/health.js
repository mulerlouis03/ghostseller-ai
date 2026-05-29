import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V99 CLEAN PUBLIC BETA",
  phase:"Clean Public Beta",
  publicBeta:true,
  cleanPublicInterface:true,
  userDashboard:true,
  ownerConsole:true,
  technicalTermsHidden:true,
  feedbackReady:true,
  stripePlansReady:true,
  tiktokReviewSubmitted:true
}));
