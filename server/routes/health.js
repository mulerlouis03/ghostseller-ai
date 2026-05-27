import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";
export const healthRouter = express.Router();
healthRouter.get("/", (req,res)=>res.json({
 ok:true, version:"GhostSeller AI V43 AUTH RECOVERY FIX", phase:"Secure Password Recovery",
 architecture:"modular", dashboard:true, billing:true, security:true, ownerAccess:true,
 passwordRecovery:true, resetPasswordPage:true, supabase:supabaseConfigured, openai:Boolean(openai), stripe:Boolean(stripe)
}));
