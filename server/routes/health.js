import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V109 FEEDBACK WHATSAPP FALLBACK",
  phase:"Feedback simplified + WhatsApp fallback",
  feedbackAcceptsShortMessage:true,
  whatsappFallback:true,
  dashboardFeedback:true,
  mobileStable:true
}));
