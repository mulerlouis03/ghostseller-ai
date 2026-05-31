import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V116 MISSION CENTER FEEDBACK MODAL",
  phase:"Mission center + visual roadmap + feedback modal",
  missionCenter:true,
  progressChecklist:true,
  feedbackModal:true,
  visualTimeline:true,
  dashboardCleaner:true
}));
