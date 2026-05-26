import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  res.json({
    ok: true,
    version: "GhostSeller AI V30 TIKTOK ENGINE",
    architecture: "modular",
    dashboard: true,
    billing: true,
    admin: true,
    tiktokEngine: true,
    supabase: supabaseConfigured,
    openai: Boolean(openai),
    stripe: Boolean(stripe)
  });
});
