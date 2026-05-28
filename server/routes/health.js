import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V54 REAL CONTENT ENGINE",
  phase:"Real Marketing Content Engine",
  architecture:"clean modular",
  realContentEngine:true,
  ghostBrain:true,
  tiktokEngine:true,
  instagramEngine:true,
  whatsappEngine:true,
  viralScoring:true,
  psychologyAngles:true,
  sceneBySceneScripts:true,
  authUnified:true,
  dashboardStable:true,
  globalBranding:true,
  metaStatus:"paused",
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
