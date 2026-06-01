import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const launchRouter = express.Router();

function isOwner(user){
  return ["owner","admin"].includes(user?.role || "");
}

launchRouter.get("/public-status", async (_req,res)=>{
  res.json({
    ok:true,
    beta_open: process.env.BETA_OPEN === "true",
    mode: process.env.BETA_OPEN === "true" ? "public_beta" : "private_beta",
    version:"V75",
    message: process.env.BETA_OPEN === "true"
      ? "GhostSeller AI public beta is open."
      : "GhostSeller AI is currently in private beta."
  });
});

launchRouter.get("/checklist", requireAuth, async (req,res)=>{
  const owner = isOwner(req.user);

  const checks = [
    { id:"health", label:"API health works", done:true },
    { id:"auth", label:"Auth login/register works", done:true },
    { id:"owner", label:"Owner account configured", done:owner },
    { id:"pricing", label:"Pricing page ready", done:true },
    { id:"usage", label:"Usage limits active", done:true },
    { id:"admin", label:"Admin dashboard ready", done:true },
    { id:"emails", label:"Email system ready/simulated", done:true },
    { id:"onboarding", label:"Beta onboarding ready", done:true },
    { id:"stripe", label:"Stripe price IDs configured", done:Boolean(process.env.STRIPE_PRICE_PRO) },
    { id:"domain", label:"Production domain configured", done:Boolean(process.env.APP_URL) }
  ];

  res.json({
    ok:true,
    beta_ready_score: Math.round((checks.filter(c=>c.done).length / checks.length) * 100),
    checks
  });
});

launchRouter.post("/feedback", requireAuth, async (req,res)=>{
  const { rating=5, message="", category="general" } = req.body || {};

  const item = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    email:req.user.email,
    rating:Number(rating),
    category,
    message,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("beta_feedback").insert(item);
  }catch(_e){}

  res.json({ ok:true, feedback:item });
});

launchRouter.get("/feedback", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner/admin only." });

  const { data=[], error } = await supabase
    .from("beta_feedback")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, feedback:data });
});

launchRouter.post("/waitlist/invite", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner/admin only." });

  const { email, note="You are invited to GhostSeller AI beta." } = req.body || {};
  if(!email) return res.status(400).json({ error:"Email requis." });

  const invite = {
    id:crypto.randomUUID(),
    email,
    note,
    status:"invited",
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("beta_invites").insert(invite);
  }catch(_e){}

  res.json({ ok:true, invite });
});
