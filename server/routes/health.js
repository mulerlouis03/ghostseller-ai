import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V45 PREMIUM UI",
  phase:"Premium SaaS Experience",
  architecture:"modular",
  dashboard:true,
  premiumUI:true,
  trustDesign:true,
  billing:true,
  security:true,
  ownerAccess:true,
  passwordRecovery:true,
  analytics:true,
  adminPanel:true,
  waitlist:true,
  launchReady:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
