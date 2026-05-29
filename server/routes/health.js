import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V96 BUSINESS COMMAND CENTER",
  phase:"Action-First SaaS Dashboard",
  basedOn:"V95 uploaded by user",
  userEntryPoint:true,
  ownerDashboard:true,
  creditsVisible:true,
  subscriptionVisible:true,
  tiktokEntry:true,
  contentGeneratorEntry:true,
  videoGeneratorEntry:true,
  leadsEntry:true,
  whatsappEntry:true,
  cleanLogout:true,
  stripeReady:true,
  tiktokInReview:true
}));
