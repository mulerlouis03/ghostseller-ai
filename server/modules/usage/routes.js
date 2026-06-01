import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { getLimits, ensureUsageRow } from "../../middleware/usageLimits.js";

export const usageRouter = express.Router();

usageRouter.get("/me", requireAuth, async (req,res)=>{
  const usage = await ensureUsageRow(req.user.id);
  const limits = getLimits(req.user);
  res.json({
    ok:true,
    plan:req.user.plan || "Free",
    role:req.user.role || "user",
    limits,
    usage,
    remaining:{
      credits:Math.max(0, limits.credits - (usage.used_credits || 0)),
      posts:Math.max(0, limits.posts - (usage.used_posts || 0)),
      leads:Math.max(0, limits.leads - (usage.used_leads || 0)),
      projects:Math.max(0, limits.projects - (usage.used_projects || 0))
    }
  });
});

usageRouter.post("/reset", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Owner/admin only." });
  }
  const target = req.body?.user_id || req.user.id;
  const { data, error } = await supabase.from("usage_counters").upsert({
    user_id:target,
    used_credits:0,
    used_posts:0,
    used_leads:0,
    used_projects:0,
    updated_at:new Date().toISOString()
  }, { onConflict:"user_id" }).select().single();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, usage:data });
});
