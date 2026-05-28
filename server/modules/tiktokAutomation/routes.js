import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const tiktokAutomationRouter = express.Router();

function nowISO(){
  return new Date().toISOString();
}

function buildScript({ niche="business", topic="AI Marketing", mode="viral" }){
  return {
    hook:`I gave ${niche} to AI and this happened...`,
    duration:"30s",
    mode,
    scenes:[
      { t:"0-3s", text:"Stop scrolling. This AI created a full campaign.", visual:"Fast zoom + big subtitle" },
      { t:"3-8s", text:`Most ${niche} businesses post without strategy.`, visual:"Show low views / messy posts" },
      { t:"8-15s", text:`I asked GhostSeller AI to build a ${topic} campaign.`, visual:"Screen recording" },
      { t:"15-23s", text:"It generated hooks, scenes, captions, CTA and hashtags.", visual:"Show generated output" },
      { t:"23-30s", text:"Comment AI to get a free campaign preview.", visual:"CTA screen" }
    ],
    caption:`Testing GhostSeller AI for ${niche}. This is how AI can turn one idea into a TikTok campaign.`,
    hashtags:["#ghostsellerai","#tiktokmarketing","#aitools","#businessgrowth","#contentstrategy"],
    cta:"Comment AI for a free campaign preview."
  };
}

tiktokAutomationRouter.get("/status", requireAuth, async (req,res)=>{
  const { data:items=[] } = await supabase
    .from("tiktok_scheduled_posts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(20);

  res.json({
    ok:true,
    module:"V87 TikTok Automation Studio",
    safe_mode:true,
    real_tiktok_publish:false,
    note:"Real TikTok publishing requires official TikTok API approval.",
    scheduled_count:items.length,
    recent:items
  });
});

tiktokAutomationRouter.post("/script", requireAuth, async (req,res)=>{
  const { niche="business", topic="AI Marketing", mode="viral" } = req.body || {};
  const script = buildScript({ niche, topic, mode });

  try{
    await supabase.from("tiktok_scripts").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      niche,
      topic,
      mode,
      script,
      created_at:nowISO()
    });
  }catch(_e){}

  res.json({ ok:true, script });
});

tiktokAutomationRouter.post("/schedule", requireAuth, async (req,res)=>{
  const {
    niche="business",
    topic="AI Marketing",
    mode="viral",
    scheduled_at=null,
    caption="",
    media_url=""
  } = req.body || {};

  const script = buildScript({ niche, topic, mode });

  const item = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    niche,
    topic,
    mode,
    caption:caption || script.caption,
    media_url,
    script,
    scheduled_at,
    status:"queued",
    result:{ note:"Queued safely. Real publishing disabled until TikTok API approval." },
    created_at:nowISO(),
    updated_at:nowISO()
  };

  const { data, error } = await supabase
    .from("tiktok_scheduled_posts")
    .insert(item)
    .select()
    .single();

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, scheduled:data });
});

tiktokAutomationRouter.get("/calendar", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("tiktok_scheduled_posts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("scheduled_at",{ascending:true})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, calendar:data });
});

tiktokAutomationRouter.post("/mark-done/:id", requireAuth, async (req,res)=>{
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tiktok_scheduled_posts")
    .update({
      status:"done",
      updated_at:nowISO()
    })
    .eq("id", id)
    .eq("user_id", req.user.id)
    .select()
    .single();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, post:data });
});
