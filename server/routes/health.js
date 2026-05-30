import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V111 FEEDBACK BODY FIX",
  phase:"Feedback body parser fixed",
  feedbackFixed:true,
  expressJsonBeforeFeedback:true,
  feedbackAcceptsShortMessage:true,
  cleanUserButtons:true
}));
