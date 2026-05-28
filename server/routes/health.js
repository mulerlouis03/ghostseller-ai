import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V56 AUTO VIDEO PIPELINE",
  phase:"Video Production Pipeline",
  autoVideoPipeline:true,
  storyboard:true,
  videoPrompts:true,
  voiceDirection:true,
  subtitleTiming:true,
  creatorExport:true,
  oneClickReelFoundation:true
}));
