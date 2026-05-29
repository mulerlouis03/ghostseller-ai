import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V95 CLEAN SAAS DASHBOARD",
  phase:"User Dashboard + Owner Dashboard + Clean Navigation",
  basedOn:"V94 Stripe Billing Ready",
  clientDashboard:true,
  ownerDashboard:true,
  cleanSidebar:true,
  visibleSubscription:true,
  visibleBilling:true,
  secureLogout:true,
  stripeReady:true,
  tiktokInReview:true
}));
