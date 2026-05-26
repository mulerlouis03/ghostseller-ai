import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";
export const healthRouter = express.Router();
healthRouter.get("/", (req,res)=>res.json({ok:true,version:"GhostSeller AI V29 STRIPE",architecture:"modular",admin:true,
    dashboard:true,
    billing:true,supabase:supabaseConfigured,openai:Boolean(openai),stripe:Boolean(stripe)}));
