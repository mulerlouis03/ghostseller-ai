import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V55 CREATIVE DIRECTOR AI",
  phase:"Creative Director Engine",
  creativeDirectorAI:true,
  multiStyleGeneration:true,
  cinematicScripts:true,
  reelsGenerator:true,
  adConceptEngine:true,
  videoPromptReady:true
}));
