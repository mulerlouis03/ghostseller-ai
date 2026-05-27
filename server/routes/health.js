import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V48 EXTRAORDINARY UI",
  phase:"Full Product Design System",
  architecture:"modular",
  extraordinaryUI:true,
  fullDesignSystem:true,
  premiumLanding:true,
  premiumDashboard:true,
  authUnified:true,
  billing:true,
  security:true,
  analytics:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
