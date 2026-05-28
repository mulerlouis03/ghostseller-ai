import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V52 GLOBAL AI NICHES",
  phase:"Global SaaS Positioning",
  globalBranding:true,
  nicheDetection:true
}));
