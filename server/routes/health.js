import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V124 TIKTOK CTA UPGRADE",
  phase:"Better TikTok roadmap CTA",
  tiktokCTA:true,
  tiktokRoadmapButton:true,
  tiktokValidationClear:true,
  mobileSaasUX:true
}));
