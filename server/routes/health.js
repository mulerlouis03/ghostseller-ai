import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V71 PRICING STRIPE PLANS CLEAN",
  phase:"Commercial SaaS Pricing",
  pricingPage:true,
  stripePlans:true,
  cleanCheckout:true,
  betaCommercialReady:true,
  starterPlan:true,
  proPlan:true,
  agencyPlan:true
}));
