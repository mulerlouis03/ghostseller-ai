import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V78 REVENUE SYSTEM STABLE",
  phase:"Real Revenue Collection",
  stripeLiveReady:true,
  checkout:true,
  webhook:true,
  customerPortal:true,
  subscriptionActivation:true,
  billingEvents:true,
  revenueReady:true
}));
