import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V41 FIX FULL WAITLIST LEADS",
  phase:"Lead Capture + Stable SaaS",
  architecture:"modular",
  dashboard:true,
  billing:true,
  planLimits:true,
  landing:true,
  logo:true,
  favicon:true,
  aiContent:true,
  waitlist:true,
  leadCapture:true,
  admin:true,
  tiktokEngine:true,
  trendScanner:true,
  whatsappLeads:true,
  autopilot:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe),
  meta:Boolean(process.env.META_APP_ID&&process.env.META_APP_SECRET&&process.env.META_REDIRECT_URI)
}));
