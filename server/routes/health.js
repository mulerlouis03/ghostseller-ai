import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V67 AUTONOMOUS OPPORTUNITY DISCOVERY",
  phase:"Market Opportunity Intelligence",
  opportunityDiscovery:true,
  nicheScanner:true,
  trendAngles:true,
  weakCompetitorDetection:true,
  marketGapFinder:true,
  campaignFromOpportunity:true,
  moneyOpportunityRadar:true
}));
