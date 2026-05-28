import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const memoryRouter = express.Router();

function calculatePerformanceScore(metrics){
  let score = 50;

  score += Math.min((metrics.engagement || 0) / 10, 15);
  score += Math.min((metrics.clicks || 0) / 5, 15);
  score += Math.min((metrics.conversions || 0) * 5, 20);

  return Math.min(Math.round(score), 98);
}

memoryRouter.post("/learn", requireAuth, async (req,res)=>{
  const {
    niche="business",
    platform="TikTok",
    hook="",
    cta="",
    strategy="",
    campaign_name="",
    metrics={}
  } = req.body || {};

  const score = calculatePerformanceScore(metrics);

  const memory = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    niche,
    platform,
    hook,
    cta,
    strategy,
    campaign_name,
    metrics,
    performance_score:score,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("persistent_memory").insert(memory);
  }catch(_e){}

  res.json({
    ok:true,
    learned:true,
    memory
  });
});

memoryRouter.get("/best-strategies", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("persistent_memory")
    .select("*")
    .eq("user_id", req.user.id)
    .order("performance_score",{ascending:false})
    .limit(20);

  if(error) return res.status(500).json({ error:error.message });

  res.json({
    ok:true,
    best_strategies:data
  });
});

memoryRouter.get("/insights", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("persistent_memory")
    .select("*")
    .eq("user_id", req.user.id);

  if(error) return res.status(500).json({ error:error.message });

  const nicheStats = {};
  const platformStats = {};
  const hookStats = [];

  for(const item of data){
    nicheStats[item.niche] = (nicheStats[item.niche] || 0) + item.performance_score;
    platformStats[item.platform] = (platformStats[item.platform] || 0) + item.performance_score;

    if(item.hook){
      hookStats.push({
        hook:item.hook,
        score:item.performance_score
      });
    }
  }

  const bestNiches = Object.entries(nicheStats)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  const bestPlatforms = Object.entries(platformStats)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  const bestHooks = hookStats
    .sort((a,b)=>b.score-a.score)
    .slice(0,5);

  res.json({
    ok:true,
    insights:{
      best_niches:bestNiches,
      best_platforms:bestPlatforms,
      best_hooks:bestHooks,
      recommendation:
        bestPlatforms[0]
          ? `${bestPlatforms[0][0]} currently performs best for your account.`
          : "Not enough learning data yet."
    }
  });
});

memoryRouter.get("/ranked-campaigns", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("persistent_memory")
    .select("*")
    .eq("user_id", req.user.id)
    .order("performance_score",{ascending:false});

  if(error) return res.status(500).json({ error:error.message });

  const ranked = data.map((item,index)=>({
    rank:index+1,
    campaign:item.campaign_name || "Unnamed campaign",
    score:item.performance_score,
    niche:item.niche,
    platform:item.platform
  }));

  res.json({
    ok:true,
    ranked_campaigns:ranked
  });
});

memoryRouter.post("/recommend", requireAuth, async (req,res)=>{
  const { objective="grow faster" } = req.body || {};

  const { data=[] } = await supabase
    .from("persistent_memory")
    .select("*")
    .eq("user_id", req.user.id)
    .order("performance_score",{ascending:false})
    .limit(10);

  const top = data[0];

  const recommendation = top
    ? {
        strategy:`Reuse high-performing strategy from ${top.platform} in ${top.niche}.`,
        hook:top.hook,
        cta:top.cta,
        reason:`Previous campaign scored ${top.performance_score}.`
      }
    : {
        strategy:"Start testing short-form video hooks.",
        reason:"No historical learning yet."
      };

  res.json({
    ok:true,
    objective,
    recommendation
  });
});

memoryRouter.get("/timeline", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("persistent_memory")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });

  res.json({
    ok:true,
    timeline:data
  });
});
