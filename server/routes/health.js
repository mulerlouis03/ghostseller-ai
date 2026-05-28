import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V51 ONBOARDING ACCESS LIMITS",
  phase:"Controlled Launch",
  architecture:"clean modular",
  frontend:"vanilla stable",
  authUnified:true,
  onboarding:true,
  accessLimits:true,
  launchControlled:true,
  dashboardStable:true,
  landingStable:true,
  metaStatus:"paused",
  billing:true,
  security:true,
  analytics:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
