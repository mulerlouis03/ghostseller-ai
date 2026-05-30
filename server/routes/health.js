import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V106.1 BETA FEEDBACK BUTTON",
  phase:"User beta notice + feedback CTA",
  userBetaNotice:true,
  feedbackButton:true,
  feedbackToSupabase:true,
  ownerConsoleFeedback:true
}));
