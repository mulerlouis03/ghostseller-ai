import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V85 STRIPE PAYMENTS LIVE STABLE",
  basedOn:"V84 validated",
  unifiedBrainCrashFixed:true,
  stripeCheckout:true,
  stripeWebhook:true,
  automaticPlanActivation:true,
  customerPortal:true
}));
