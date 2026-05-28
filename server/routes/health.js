import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V58 AUTOPILOT GROWTH AGENT",
  phase:"Autonomous Growth Planning",
  autopilotGrowthAgent:true,
  selfPromotion:true,
  acquisitionPlans:true,
  prospectScoring:true,
  dailyActions:true,
  campaignBuilder:true,
  socialAPIs:"paused until official connection"
}));
