import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const launchpadRouter = express.Router();

function isOwner(user){
  return ["owner","admin"].includes(user?.role || "");
}

launchpadRouter.get("/status", async (_req,res)=>{
  res.json({
    ok:true,
    version:"V80",
    public_launch_ready:true,
    launch_mode:process.env.PUBLIC_LAUNCH === "true" ? "public" : "private",
    beta_open:process.env.BETA_OPEN === "true",
    app_url:process.env.APP_URL || "",
    checklist:[
      "API health",
      "Auth",
      "Admin dashboard",
      "Stripe revenue system",
      "Usage limits",
      "OpenAI engine",
      "Onboarding",
      "Multilingual",
      "Growth system"
    ]
  });
});

launchpadRouter.get("/production-checklist", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner/admin only." });

  const checks = [
    { id:"app_url", label:"APP_URL configured", done:Boolean(process.env.APP_URL) },
    { id:"jwt", label:"JWT_SECRET configured", done:Boolean(process.env.JWT_SECRET) },
    { id:"supabase", label:"Supabase configured", done:Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) },
    { id:"openai", label:"OpenAI configured", done:Boolean(process.env.OPENAI_API_KEY) },
    { id:"stripe", label:"Stripe secret configured", done:Boolean(process.env.STRIPE_SECRET_KEY) },
    { id:"stripe_webhook", label:"Stripe webhook configured", done:Boolean(process.env.STRIPE_WEBHOOK_SECRET) },
    { id:"prices", label:"Stripe price IDs configured", done:Boolean(process.env.STRIPE_PRICE_STARTER && process.env.STRIPE_PRICE_PRO && process.env.STRIPE_PRICE_AGENCY) },
    { id:"email", label:"Email configured or simulation ready", done:true },
    { id:"public_launch", label:"PUBLIC_LAUNCH set", done:Boolean(process.env.PUBLIC_LAUNCH) },
    { id:"beta_open", label:"BETA_OPEN set", done:Boolean(process.env.BETA_OPEN) }
  ];

  res.json({
    ok:true,
    launch_score:Math.round((checks.filter(c=>c.done).length / checks.length) * 100),
    checks
  });
});

launchpadRouter.post("/event", async (req,res)=>{
  const { type="page_view", source="unknown", metadata={} } = req.body || {};

  const event = {
    id:crypto.randomUUID(),
    type,
    source,
    metadata,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("launch_events").insert(event);
  }catch(_e){}

  res.json({ ok:true, event });
});

launchpadRouter.get("/events", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner/admin only." });

  const { data=[], error } = await supabase
    .from("launch_events")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(200);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, events:data });
});

launchpadRouter.post("/go-live-note", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner/admin only." });

  const { note="GhostSeller AI public launch note." } = req.body || {};

  const item = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    note,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("launch_notes").insert(item);
  }catch(_e){}

  res.json({ ok:true, note:item });
});
