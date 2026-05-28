import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const growthRouter = express.Router();

const CHANNELS = [
  "TikTok organic content",
  "Instagram Reels",
  "LinkedIn founder posts",
  "Facebook entrepreneur groups",
  "YouTube Shorts",
  "WhatsApp communities",
  "Reddit niche communities",
  "Cold outreach"
];

const DAILY_ACTIONS = [
  "Publish 1 short demo video",
  "Post 1 founder story",
  "DM 10 potential beta users",
  "Share 1 before/after content example",
  "Collect feedback from 3 users",
  "Improve one landing page section",
  "Create one case-study style post"
];

growthRouter.post("/plan", requireAuth, async (req,res)=>{
  const {
    product="GhostSeller AI",
    target="entrepreneurs, creators and small businesses",
    goal="get first users",
    market="global",
    tone="bold and premium"
  } = req.body || {};

  const plan = {
    id: crypto.randomUUID(),
    product,
    target,
    market,
    goal,
    tone,

    positioning:`${product} helps ${target} turn content into customers using AI.`,

    best_channels: CHANNELS.slice(0,6),

    campaign_angles:[
      {
        angle:"AI agency in your pocket",
        message:`${product} creates hooks, reels, WhatsApp messages and campaigns in minutes.`
      },
      {
        angle:"Stop guessing what to post",
        message:"Describe your business and let the AI propose the best content direction."
      },
      {
        angle:"From content to customers",
        message:"Not just content generation — a growth system with leads, scripts and analytics."
      }
    ],

    daily_actions: DAILY_ACTIONS,

    seven_day_launch_plan:[
      "Day 1: publish launch announcement + collect 10 beta users",
      "Day 2: publish 3 demo videos showing AI output",
      "Day 3: post in 5 entrepreneur communities",
      "Day 4: DM 30 small businesses with a free audit offer",
      "Day 5: collect testimonials and improve landing",
      "Day 6: run pricing test and Stripe checkout test",
      "Day 7: publish results and open early access"
    ],

    lead_targets:[
      "solo entrepreneurs",
      "local businesses",
      "coaches",
      "e-commerce stores",
      "agencies",
      "content creators"
    ],

    dm_templates:[
      `Hey, I’m testing ${product}, an AI tool that creates marketing content and WhatsApp lead messages for businesses. Want a free demo?`,
      `Quick question — would you use an AI that turns your business idea into TikTok/Reels scripts and sales messages?`,
      `I can generate 3 content ideas for your business using ${product}. Want me to show you?`
    ],

    self_promo_posts:[
      `${product} is live 🚀 It helps entrepreneurs create viral content, reels, WhatsApp messages and campaigns with AI.`,
      `I’m building an AI marketing agent that turns attention into customers. Looking for early testers.`,
      `Most businesses don’t need more tools. They need a smarter growth system. That’s why I built ${product}.`
    ]
  };

  try{
    await supabase.from("growth_plans").insert({
      id: plan.id,
      user_id: req.user.id,
      product,
      target,
      goal,
      market,
      plan,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, plan });
});

growthRouter.get("/daily", requireAuth, (req,res)=>{
  res.json({
    ok:true,
    date:new Date().toISOString().slice(0,10),
    actions: DAILY_ACTIONS.map((action,index)=>({
      id:index+1,
      action,
      priority:index < 3 ? "high" : "medium"
    }))
  });
});

growthRouter.post("/prospect-score", requireAuth, (req,res)=>{
  const { business="", audience="", activity="" } = req.body || {};
  const text = `${business} ${audience} ${activity}`.toLowerCase();

  let score = 55;
  if(text.includes("business")) score += 10;
  if(text.includes("coach") || text.includes("agency") || text.includes("store")) score += 15;
  if(text.includes("tiktok") || text.includes("instagram") || text.includes("whatsapp")) score += 15;
  if(text.includes("need") || text.includes("grow") || text.includes("clients")) score += 10;

  score = Math.min(score, 98);

  res.json({
    ok:true,
    score,
    category: score >= 80 ? "hot prospect" : score >= 65 ? "warm prospect" : "cold prospect",
    recommendation: score >= 80
      ? "Offer a free demo immediately."
      : score >= 65
      ? "Send educational content and follow up."
      : "Add to long-term nurture list."
  });
});
