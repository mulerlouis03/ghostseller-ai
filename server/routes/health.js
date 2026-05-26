import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  res.json({
    ok: true,
    version: "GhostSeller AI V29 STRIPE FIXED",
    architecture: "modular",
    dashboard: true,
    billing: true,
    admin: true,
    supabase: supabaseConfigured,
    openai: Boolean(openai),
    stripe: Boolean(stripe)
  });
});
