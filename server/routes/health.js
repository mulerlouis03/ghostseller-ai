import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V36 LANDING BRANDING FIXED",
  phase:"Landing + SaaS",
  architecture:"modular",
  dashboard:true,
  billing:true,
  planLimits:true,
  landing:true,
  admin:true,
  tiktokEngine:true,
  trendScanner:true,
  whatsappLeads:true,
  autopilot:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
