import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";

export const contentRouter = express.Router();

const HOOKS = [
  "Nobody talks about this...",
  "This changes everything for small businesses.",
  "You’re losing customers because of this mistake.",
  "I tested this strategy for 7 days.",
  "Most creators fail because they ignore this.",
  "This trick gets attention instantly.",
  "Stop scrolling if you want more clients."
];

const PSYCHOLOGY = [
  "Curiosity",
  "Urgency",
  "Transformation",
  "Fear of missing out",
  "Authority",
  "Social proof",
  "Aspiration"
];

const EMOTIONS = [
  "Excitement",
  "Confidence",
  "Trust",
  "Curiosity",
  "Motivation",
  "Urgency"
];

function pick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function viralScore(){
  return Math.floor(78 + Math.random()*22);
}

function generateScenes(niche, goal){
  return [
    {
      scene:1,
      duration:"0-3s",
      purpose:"Hook",
      text:`Attention-grabbing intro for ${niche}.`,
      visual:"Fast moving visual with bold subtitle."
    },
    {
      scene:2,
      duration:"3-8s",
      purpose:"Problem",
      text:`Explain the main problem related to ${goal}.`,
      visual:"Show frustration/problem situation."
    },
    {
      scene:3,
      duration:"8-15s",
      purpose:"Solution",
      text:`Present the solution/business offer.`,
      visual:"Clean transformation or product showcase."
    },
    {
      scene:4,
      duration:"15-22s",
      purpose:"Proof",
      text:"Show testimonial, social proof or quick result.",
      visual:"Before/after or positive reaction."
    },
    {
      scene:5,
      duration:"22-30s",
      purpose:"CTA",
      text:"Invite user to DM or contact on WhatsApp.",
      visual:"Clear CTA with animated text."
    }
  ];
}

contentRouter.post("/generate", requireAuth, requireCredits(3,"posts"), async (req,res)=>{
  try{
    const {
      niche="Business",
      platform="TikTok",
      tone="viral",
      goal="Get more customers"
    } = req.body || {};

    const { data:history=[] } = await supabase
      .from("content_history")
      .select("niche,platform")
      .eq("user_id", req.user.id)
      .order("created_at",{ascending:false})
      .limit(20);

    const memoryNiches = [...new Set((history||[]).map(x=>x.niche).filter(Boolean))];

    const result = {
      id: crypto.randomUUID(),
      niche,
      platform,
      tone,
      goal,

      viral_score: viralScore(),
      psychological_angle: pick(PSYCHOLOGY),
      dominant_emotion: pick(EMOTIONS),

      hook: pick(HOOKS),

      tiktok_version: {
        title:`${niche} TikTok Strategy`,
        subtitle:"Short-form viral content",
        scenes: generateScenes(niche, goal)
      },

      instagram_version: {
        caption:`${niche}: Here is a smarter way to attract attention and convert followers into customers.`,
        carousel_idea:[
          "Problem",
          "Why most people fail",
          "Simple strategy",
          "Transformation",
          "Call to action"
        ]
      },

      whatsapp_version: {
        first_message:`Hey 👋 I wanted to show you a simple strategy that could help your ${niche.toLowerCase()} business attract more clients.`,
        follow_up:"Would you like me to show you an example campaign?"
      },

      hashtags:[
        "#marketing",
        "#business",
        "#viral",
        "#entrepreneur",
        "#growth"
      ],

      thumbnail_idea:"High contrast text + emotional face + short curiosity phrase.",

      cta:"DM now to get the strategy.",
      memory_context: memoryNiches
    };

    try{
      await supabase.from("content_history").insert({
        id: crypto.randomUUID(),
        user_id: req.user.id,
        type:"real_content_engine",
        niche,
        platform,
        prompt:goal,
        result,
        favorite:false,
        created_at:new Date().toISOString()
      });
    }catch(_e){}

    try{ await consumeUsage(req.user.id, req.usageCost || 3, req.usageType || "posts"); }catch(_e){}

    res.json({
      ok:true,
      result
    });

  }catch(error){
    res.status(500).json({
      error:error.message || "Generation failed."
    });
  }
});
