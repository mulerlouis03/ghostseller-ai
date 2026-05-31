import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { sendSystemEmail } from "../../lib/email.js";

export const betaRouter = express.Router();

betaRouter.post("/complete-onboarding", requireAuth, async (req,res)=>{
  const {
    business_type="",
    main_goal="",
    main_platform="",
    language="fr"
  } = req.body || {};

  const { data, error } = await supabase
    .from("users")
    .update({
      onboarding_completed:true,
      business_type,
      main_goal,
      main_platform,
      preferred_language:language,
      updated_at:new Date().toISOString()
    })
    .eq("id", req.user.id)
    .select()
    .single();

  if(error) return res.status(500).json({ error:error.message });

  try{
    await supabase.from("user_notifications").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      type:"onboarding_completed",
      title:"Onboarding completed",
      message:"Your GhostSeller AI workspace is ready.",
      read:false,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({
    ok:true,
    user:data
  });
});

betaRouter.get("/checklist", requireAuth, async (req,res)=>{
  res.json({
    ok:true,
    checklist:[
      { id:1, title:"Choose your language", done:Boolean(req.user.preferred_language) },
      { id:2, title:"Complete onboarding", done:Boolean(req.user.onboarding_completed) },
      { id:3, title:"Generate first content", done:false },
      { id:4, title:"Create first opportunity campaign", done:false },
      { id:5, title:"Check AI CMO recommendations", done:false }
    ]
  });
});

betaRouter.get("/notifications", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("user_notifications")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, notifications:data });
});

betaRouter.post("/notify", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Owner/admin only." });
  }

  const { user_id=req.user.id, title="GhostSeller update", message="New update available." } = req.body || {};

  const { data, error } = await supabase.from("user_notifications").insert({
    id:crypto.randomUUID(),
    user_id,
    type:"admin",
    title,
    message,
    read:false,
    created_at:new Date().toISOString()
  }).select().single();

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, notification:data });
});
