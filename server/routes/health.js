import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V107 MOBILE USER STABLE",
  phase:"Mobile user dashboard + feedback fixed",
  mobileStable:true,
  noHorizontalScroll:true,
  mobileMenu:true,
  feedbackFixed:true,
  accountImproved:true,
  userDashboardStable:true
}));
