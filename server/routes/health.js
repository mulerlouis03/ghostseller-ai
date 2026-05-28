import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V76 REAL AI ENGINE STABLE",
  phase:"Real AI Production Engine",
  realAIEngine:true,
  openaiReady:Boolean(process.env.OPENAI_API_KEY),
  fallbackMode:!Boolean(process.env.OPENAI_API_KEY),
  memoryAware:true,
  multiFormatGeneration:true,
  promptsAdvanced:true,
  stable:true
}));
