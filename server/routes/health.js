import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V46 AUTH UNIFIED FIX",
  phase:"Unified Authentication",
  architecture:"modular",
  authUnified:true,
  supabaseAuth:true,
  publicUsersSync:true,
  passwordRecovery:true,
  dashboard:true,
  billing:true,
  security:true,
  analytics:true,
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe)
}));
