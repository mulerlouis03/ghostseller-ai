import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";
export const healthRouter = express.Router();
healthRouter.get("/",(req,res)=>res.json({
 ok:true,version:"GhostSeller AI V39 META INSTAGRAM CONNECT",phase:"Meta OAuth",architecture:"modular",
 dashboard:true,billing:true,landing:true,logo:true,instagramConnect:true,metaConnect:true,
 admin:true,tiktokEngine:true,trendScanner:true,whatsappLeads:true,autopilot:true,
 supabase:supabaseConfigured,openai:Boolean(openai),stripe:Boolean(stripe),
 meta:Boolean(process.env.META_APP_ID&&process.env.META_APP_SECRET&&process.env.META_REDIRECT_URI)
}));
