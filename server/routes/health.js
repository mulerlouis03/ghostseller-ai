import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V37 LAUNCH LOGO",
  phase:"Public Launch",
  architecture:"modular",
  dashboard:true,
  billing:true,
  planLimits:true,
  landing:true,
  logo:true,
  favicon:true,
  admin:true,
  tiktokEngine:true,
  trendScanner:true,
  whatsappLeads:true,
  autopilot:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
