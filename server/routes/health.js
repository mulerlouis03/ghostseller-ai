import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V42 SECURITY OWNER",
  phase:"Pre Launch Security",
  architecture:"modular",
  dashboard:true,
  billing:true,
  planLimits:true,
  landing:true,
  waitlist:true,
  security:true,
  ownerAccess:true,
  stripeWebhookReady:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe),
  meta:Boolean(process.env.META_APP_ID&&process.env.META_APP_SECRET&&process.env.META_REDIRECT_URI)
}));
