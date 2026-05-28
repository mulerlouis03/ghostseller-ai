import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const referralRouter = express.Router();

function appUrl(){
  return process.env.APP_URL || "https://ghostseller-ai.vercel.app";
}

function makeCode(email=""){
  const clean = String(email).split("@")[0].replace(/[^a-zA-Z0-9]/g,"").slice(0,8).toUpperCase() || "GHOST";
  return `${clean}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

async function getOrCreateReferral(user){
  const existing = await supabase
    .from("referral_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if(existing.data) return existing.data;

  const code = makeCode(user.email);

  const { data, error } = await supabase
    .from("referral_profiles")
    .insert({
      id:crypto.randomUUID(),
      user_id:user.id,
      email:user.email,
      referral_code:code,
      total_clicks:0,
      total_signups:0,
      total_rewards:0,
      created_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    })
    .select()
    .single();

  if(error) throw error;
  return data;
}

referralRouter.get("/me", requireAuth, async (req,res)=>{
  try{
    const profile = await getOrCreateReferral(req.user);
    res.json({
      ok:true,
      profile,
      referral_link:`${appUrl()}/?ref=${profile.referral_code}`
    });
  }catch(error){
    res.status(500).json({ error:error.message || "Referral profile failed." });
  }
});

referralRouter.post("/track-click", async (req,res)=>{
  try{
    const { ref="", source="unknown", path="/" } = req.body || {};

    if(!ref){
      return res.json({ ok:true, tracked:false });
    }

    const { data:profile } = await supabase
      .from("referral_profiles")
      .select("*")
      .eq("referral_code", ref)
      .maybeSingle();

    if(profile){
      await supabase.from("referral_clicks").insert({
        id:crypto.randomUUID(),
        referral_code:ref,
        referrer_user_id:profile.user_id,
        source,
        path,
        created_at:new Date().toISOString()
      });

      await supabase
        .from("referral_profiles")
        .update({
          total_clicks:(profile.total_clicks || 0) + 1,
          updated_at:new Date().toISOString()
        })
        .eq("id", profile.id);
    }

    res.json({ ok:true, tracked:Boolean(profile) });
  }catch(error){
    res.status(500).json({ error:error.message || "Referral click failed." });
  }
});

referralRouter.post("/track-signup", requireAuth, async (req,res)=>{
  try{
    const { referral_code="" } = req.body || {};

    if(!referral_code){
      return res.json({ ok:true, tracked:false });
    }

    const { data:profile } = await supabase
      .from("referral_profiles")
      .select("*")
      .eq("referral_code", referral_code)
      .maybeSingle();

    if(!profile){
      return res.json({ ok:true, tracked:false, reason:"referral_not_found" });
    }

    if(profile.user_id === req.user.id){
      return res.json({ ok:true, tracked:false, reason:"self_referral_ignored" });
    }

    const reward = 50;

    await supabase.from("referral_signups").insert({
      id:crypto.randomUUID(),
      referral_code,
      referrer_user_id:profile.user_id,
      referred_user_id:req.user.id,
      referred_email:req.user.email,
      reward_credits:reward,
      created_at:new Date().toISOString()
    });

    await supabase
      .from("referral_profiles")
      .update({
        total_signups:(profile.total_signups || 0) + 1,
        total_rewards:(profile.total_rewards || 0) + reward,
        updated_at:new Date().toISOString()
      })
      .eq("id", profile.id);

    try{
      const { data:refUser } = await supabase
        .from("users")
        .select("credits")
        .eq("id", profile.user_id)
        .maybeSingle();

      await supabase
        .from("users")
        .update({
          credits:(refUser?.credits || 0) + reward,
          updated_at:new Date().toISOString()
        })
        .eq("id", profile.user_id);
    }catch(_e){}

    res.json({ ok:true, tracked:true, reward_credits:reward });
  }catch(error){
    res.status(500).json({ error:error.message || "Referral signup failed." });
  }
});

referralRouter.get("/leaderboard", requireAuth, async (_req,res)=>{
  const { data=[], error } = await supabase
    .from("referral_profiles")
    .select("email,referral_code,total_clicks,total_signups,total_rewards")
    .order("total_signups",{ascending:false})
    .limit(25);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, leaderboard:data });
});
