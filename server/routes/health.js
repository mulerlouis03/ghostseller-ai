import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V98 PUBLIC TEST READY",
  phase:"Public Friend Testing + Cleaner Dashboard",
  publicTestReady:true,
  cleanUserDashboard:true,
  ownerConsole:true,
  feedbackReady:true,
  userSignupTest:true,
  stripePlansReady:true,
  tiktokReviewSubmitted:true,
  note:"Some AI/video actions may still be in preview mode until final generation endpoints are fully connected."
}));
