import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { generateMarketingContent, generateCreativeDirections, aiConfigured } from "../../lib/aiEngine.js";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";

export const aiRouter = express.Router();

aiRouter.get("/status", requireAuth, (_req,res)=>{
  res.json({
    ok:true,
    provider: aiConfigured() ? "openai" : "fallback",
    openai_ready: aiConfigured(),
    model: process.env.OPENAI_MODEL || "gpt-4o-mini"
  });
});

aiRouter.post("/generate", requireAuth, requireCredits(5,"posts"), async (req,res)=>{
  try{
    const language = req.headers["x-ghostseller-language"] || req.body?.language || "fr";

    const payload = {
      user:req.user,
      niche:req.body?.niche || "business",
      platform:req.body?.platform || "TikTok",
      goal:req.body?.goal || "get more leads",
      tone:req.body?.tone || "premium",
      language
    };

    const data = await generateMarketingContent(payload);

    try{
      await supabase.from("content_history").insert({
        id:crypto.randomUUID(),
        user_id:req.user.id,
        type:"real_ai_engine",
        niche:payload.niche,
        platform:payload.platform,
        prompt:payload.goal,
        result:data.result,
        favorite:false,
        created_at:new Date().toISOString()
      });
    }catch(_e){}

    try{ await consumeUsage(req.user.id, req.usageCost || 5, req.usageType || "posts"); }catch(_e){}

    res.json(data);
  }catch(error){
    res.status(500).json({ error:error.message || "AI generation failed." });
  }
});

aiRouter.post("/creative-directions", requireAuth, requireCredits(3,"posts"), async (req,res)=>{
  try{
    const language = req.headers["x-ghostseller-language"] || req.body?.language || "fr";
    const description = req.body?.description || "";

    const data = await generateCreativeDirections({ description, language });

    try{ await consumeUsage(req.user.id, req.usageCost || 3, req.usageType || "posts"); }catch(_e){}

    res.json({
      ok:true,
      ...data
    });
  }catch(error){
    res.status(500).json({ error:error.message || "Creative direction failed." });
  }
});
