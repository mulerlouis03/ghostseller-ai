import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V112 USER EXPERIENCE REBUILD",
  phase:"Cleaner user dashboard + beta roadmap + TikTok status",
  userExperienceRebuild:true,
  startHereSimplified:true,
  duplicateFeedbackRemoved:true,
  tiktokStatusClear:true,
  roadmapVisible:true,
  mobileCleaner:true,
  feedbackFixed:true
}));
