import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V83 REAL USER ACQUISITION SYSTEM",
  phase:"Real User Acquisition",
  waitlist:true,
  referrals:true,
  emailCapture:true,
  analytics:true,
  subscriptionPlans:true,
  onboardingOptimization:true,
  tiktokConversionFunnels:true
}));
