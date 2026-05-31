import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const tiktokRouter = express.Router();

const HOOKS = {
  curiosity:["Nobody talks about this…","This changes everything.","Watch this before posting again.","I gave this business to AI…","This is why your content gets ignored."],
  authority:["I tested AI on this business.","Here’s the exact strategy.","I analyzed viral TikToks.","Here is the TikTok growth formula."],
  shock:["Stop wasting time posting randomly.","Your content is probably invisible.","This is costing you customers.","AI can do this in seconds."]
};

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function buildStoryboard(mode, niche, topic){
  return [
    { step:1, duration:"0-3s", role:"Hook", visual:"Fast zoom + big subtitle", text:random(HOOKS.curiosity) },
    { step:2, duration:"3-7s", role:"Problem", visual:"Show low views/problem", text:`Most ${niche} businesses post without strategy.` },
    { step:3, duration:"7-14s", role:"AI Solution", visual:"Show GhostSeller dashboard", text:`I gave ${topic} to GhostSeller AI.` },
    { step:4, duration:"14-23s", role:"Result", visual:"Show hooks + scenes + CTA", text:"It creates hooks, scenes, captions and a growth plan." },
    { step:5, duration:"23-30s", role:"CTA", visual:"Clean CTA screen", text:"Comment AI or try GhostSeller today." }
  ];
}

function buildSeries(topic, niche){
  return [
    { title:`I gave ${niche} to AI — Part 1`, hook:`I gave ${topic} to GhostSeller AI and this happened…` },
    { title:`AI fixes bad marketing — Part 2`, hook:"Most businesses make this content mistake." },
    { title:`AI growth test — Part 3`, hook:"Which hook would you post first?" },
    { title:`TikTok content machine — Part 4`, hook:"One idea became 10 TikToks in seconds." },
    { title:`From views to clients — Part 5`, hook:"Views are useless if they don’t become leads." }
  ];
}

tiktokRouter.get("/status", requireAuth, (_req,res)=>{
  res.json({ ok:true, version:"V81 TikTok Engine Stable", ready:true });
});

tiktokRouter.post("/generate", requireAuth, async (req,res)=>{
  try{
    const { niche="business", mode="viral", topic="AI Marketing", audience="small business owners" } = req.body || {};
    const viralScore = Math.min(97, 84 + Math.floor(Math.random()*12));
    const payload = {
      id:crypto.randomUUID(),
      niche, mode, topic, audience,
      viral_score:viralScore,
      hook_strength:Math.min(99, viralScore+2),
      retention_prediction:Math.max(70, viralScore-4),
      hooks:{ curiosity:random(HOOKS.curiosity), authority:random(HOOKS.authority), shock:random(HOOKS.shock) },
      storyboard:buildStoryboard(mode,niche,topic),
      series:buildSeries(topic,niche),
      caption:`I tested GhostSeller AI on ${niche}. It created hooks, scenes and a growth plan in seconds.`,
      cta:"Comment 'AI' to get a free campaign preview.",
      hashtags:["#tiktokmarketing","#aitools","#businessgrowth","#marketingtips","#ghostsellerai"],
      next_actions:["Record screen while generating campaign","Use big subtitles in first 2 seconds","Post Part 1 today","Reply to comments with Part 2"]
    };

    try{
      await supabase.from("tiktok_generations").insert({
        id:payload.id, user_id:req.user.id, niche, mode, topic, payload, created_at:new Date().toISOString()
      });
    }catch(_e){}

    res.json({ ok:true, result:payload });
  }catch(error){
    res.status(500).json({ error:error.message || "TikTok generation failed." });
  }
});

tiktokRouter.get("/history", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase.from("tiktok_generations").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false}).limit(50);
  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, history:data });
});
