import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V110 CLEAN USER BUTTONS",
  phase:"Clean user feedback + single logout",
  betaTopFeedbackRemoved:true,
  singleFeedbackBlock:true,
  singleUserLogout:true,
  mobileCleaner:true
}));
