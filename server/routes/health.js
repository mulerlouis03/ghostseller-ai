import express from "express";
import { supabaseConfigured } from "../lib/supabase.js";
import { openai } from "../lib/openai.js";
import { stripe } from "../lib/stripe.js";

export const healthRouter = express.Router();

healthRouter.get("/", (req, res) => {
  res.json({
    ok: true,
    version: "GhostSeller AI CORE V26",
    architecture: "modular",
    supabase: supabaseConfigured,
    openai: Boolean(openai),
    stripe: Boolean(stripe)
  });
});
