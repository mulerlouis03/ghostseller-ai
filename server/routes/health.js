import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V94 STRIPE BILLING READY",
  phase:"Stripe Revenue System",
  basedOn:"V93 public launch ready",
  stripeCheckout:true,
  customerPortal:true,
  subscriptionStatus:true,
  billingEvents:true,
  plans:["starter","pro","agency"],
  publicLaunchReady:true
}));
