import express from "express";
import crypto from "crypto";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const opportunitiesRouter = express.Router();

const NICHE_BANK = [
  { niche:"AI tools for small businesses", demand:92, competition:61, monetization:88 },
  { niche:"Real estate short-form content", demand:85, competition:54, monetization:82 },
  { niche:"Beauty salon content automation", demand:78, competition:42, monetization:75 },
  { niche:"Fitness coach lead generation", demand:81, competition:58, monetization:79 },
  { niche:"Local restaurant reels", demand:74, competition:38, monetization:68 },
  { niche:"E-commerce product demo videos", demand:89, competition:66, monetization:86 },
  { niche:"Personal brand content engine", demand:87, competition:70, monetization:84 },
  { niche:"LinkedIn B2B founder content", demand:80, competition:46, monetization:83 },
  { niche:"WhatsApp lead follow-up automation", demand:84, competition:45, monetization:87 },
  { niche:"Creator monetization funnels", demand:88, competition:63, monetization:85 }
];

const ANGLES = [
  "AI saves time",
  "Before / After transformation",
  "Mistakes to avoid",
  "Secret workflow",
  "Automation advantage",
  "Make more clients with less content",
  "From views to customers",
  "Stop guessing what to post"
];

function scoreOpportunity(item){
  return Math.round((item.demand * 0.42) + ((100 - item.competition) * 0.28) + (item.monetization * 0.30));
}

function buildCampaign(opportunity){
  return {
    niche: opportunity.niche,
    hook:`Most businesses in ${opportunity.niche} are missing this opportunity.`,
    content_angle:ANGLES[Math.floor(Math.random()*ANGLES.length)],
    offer:`Free AI campaign preview for ${opportunity.niche}`,
    cta:"DM now to get a free campaign idea.",
    funnel:[
      "Short-form video hook",
      "Problem explanation",
      "AI-powered solution",
      "Proof / example",
      "DM CTA"
    ],
    platforms:["TikTok","Instagram Reels","LinkedIn","WhatsApp"],
    first_3_posts:[
      `3 mistakes in ${opportunity.niche}`,
      `How AI can improve ${opportunity.niche}`,
      `Before/after content strategy for ${opportunity.niche}`
    ]
  };
}

opportunitiesRouter.get("/scan", requireAuth, async (req,res)=>{
  const opportunities = NICHE_BANK.map(item=>({
    id:crypto.randomUUID(),
    ...item,
    opportunity_score:scoreOpportunity(item),
    suggested_angle:ANGLES[Math.floor(Math.random()*ANGLES.length)],
    weakness_detected:item.competition < 50 ? "Low content quality from competitors" : "Crowded market but strong demand"
  })).sort((a,b)=>b.opportunity_score-a.opportunity_score);

  try{
    await supabase.from("opportunity_scans").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      scan_type:"global",
      results:opportunities,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, opportunities });
});

opportunitiesRouter.post("/analyze", requireAuth, async (req,res)=>{
  const { niche="AI tools for small businesses", market="global" } = req.body || {};

  const base = NICHE_BANK.find(x=>x.niche.toLowerCase().includes(String(niche).toLowerCase())) || {
    niche, demand:76, competition:50, monetization:72
  };

  const analysis = {
    id:crypto.randomUUID(),
    niche:base.niche,
    market,
    opportunity_score:scoreOpportunity(base),
    demand_signal:base.demand >= 85 ? "high" : base.demand >= 70 ? "medium" : "low",
    competition_signal:base.competition >= 65 ? "competitive" : "underexploited",
    monetization_signal:base.monetization >= 80 ? "strong" : "medium",
    weak_competitor_angle:base.competition < 55 ? "Competitors likely have weak content strategy." : "Win through better positioning and proof.",
    recommended_content_angles:ANGLES.slice(0,5),
    recommended_offer:`AI-powered content and lead campaign for ${base.niche}`,
    campaign:buildCampaign(base)
  };

  try{
    await supabase.from("opportunity_items").insert({
      id:analysis.id,
      user_id:req.user.id,
      niche:analysis.niche,
      market,
      score:analysis.opportunity_score,
      analysis,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, analysis });
});

opportunitiesRouter.post("/campaign", requireAuth, async (req,res)=>{
  const { niche="AI tools for small businesses" } = req.body || {};
  const opportunity = NICHE_BANK.find(x=>x.niche.toLowerCase().includes(String(niche).toLowerCase())) || {
    niche, demand:76, competition:50, monetization:72
  };

  const campaign = {
    id:crypto.randomUUID(),
    opportunity_score:scoreOpportunity(opportunity),
    ...buildCampaign(opportunity),
    execution_ready:true
  };

  try{
    await supabase.from("opportunity_campaigns").insert({
      id:campaign.id,
      user_id:req.user.id,
      niche:campaign.niche,
      campaign,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  try{ await consumeUsage(req.user.id, req.usageCost || 3, req.usageType || "posts"); }catch(_e){}

  res.json({ ok:true, campaign });
});

opportunitiesRouter.get("/history", requireAuth, async (req,res)=>{
  const [scans, items, campaigns] = await Promise.all([
    supabase.from("opportunity_scans").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false}).limit(20),
    supabase.from("opportunity_items").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false}).limit(50),
    supabase.from("opportunity_campaigns").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false}).limit(50)
  ]);

  res.json({
    ok:true,
    history:{
      scans:scans.data || [],
      analyzed:items.data || [],
      campaigns:campaigns.data || []
    }
  });
});

opportunitiesRouter.get("/radar", requireAuth, async (req,res)=>{
  const ranked = NICHE_BANK.map(item=>({
    niche:item.niche,
    money_score:scoreOpportunity(item),
    reason:item.monetization >= 85 ? "Strong monetization potential" : "Good demand with campaign potential",
    next_action:`Create a campaign for ${item.niche}`
  })).sort((a,b)=>b.money_score-a.money_score).slice(0,5);

  res.json({
    ok:true,
    radar:ranked
  });
});
