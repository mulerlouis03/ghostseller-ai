import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const optimizationRouter = express.Router();

function scoreText(text=""){
  let score = 50;
  const t = String(text).toLowerCase();

  if(text.length > 25) score += 8;
  if(text.length > 60) score += 5;
  if(t.includes("stop") || t.includes("why") || t.includes("how") || t.includes("?")) score += 10;
  if(t.includes("business") || t.includes("clients") || t.includes("money") || t.includes("growth")) score += 10;
  if(t.includes("now") || t.includes("today") || t.includes("fast")) score += 6;

  return Math.min(score, 98);
}

function improveHook(hook=""){
  const base = hook || "This can help your business grow";
  return [
    `Stop scrolling — ${base}`,
    `Most people miss this: ${base}`,
    `If you want more clients, watch this: ${base}`,
    `This simple mistake is costing you customers: ${base}`,
    `Here is how to turn attention into customers: ${base}`
  ];
}

function improveCTA(cta=""){
  const base = cta || "DM now";
  return [
    `${base} to get a free preview.`,
    `Send “START” and I’ll show you the strategy.`,
    `DM now before your competitors test this first.`,
    `Click the link and generate your first campaign.`,
    `Reply “AI” and get your content plan.`
  ];
}

function detectWeaknesses({ hook="", cta="", platform="", niche="" }){
  const weaknesses = [];

  if(!hook || hook.length < 25) weaknesses.push("Hook is too weak or too short.");
  if(!cta || cta.length < 10) weaknesses.push("CTA is not clear enough.");
  if(!platform) weaknesses.push("Platform is missing.");
  if(!niche) weaknesses.push("Niche is too generic.");
  if(hook && !/[?]/.test(hook) && !hook.toLowerCase().includes("stop")) weaknesses.push("Hook needs stronger curiosity or interruption.");

  return weaknesses.length ? weaknesses : ["No major weakness detected."];
}

optimizationRouter.post("/evaluate", requireAuth, async (req,res)=>{
  const {
    hook="",
    cta="",
    platform="TikTok",
    niche="business",
    strategy=""
  } = req.body || {};

  const hook_score = scoreText(hook);
  const cta_score = scoreText(cta);
  const strategy_score = scoreText(strategy);

  const total_score = Math.round((hook_score + cta_score + strategy_score) / 3);

  const weaknesses = detectWeaknesses({ hook, cta, platform, niche });

  const evaluation = {
    id:crypto.randomUUID(),
    hook,
    cta,
    platform,
    niche,
    strategy,
    hook_score,
    cta_score,
    strategy_score,
    total_score,
    verdict: total_score >= 85 ? "strong" : total_score >= 70 ? "good" : "needs improvement",
    weaknesses,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("optimization_runs").insert({
      id:evaluation.id,
      user_id:req.user.id,
      type:"evaluation",
      input:{hook,cta,platform,niche,strategy},
      output:evaluation,
      score:total_score,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, evaluation });
});

optimizationRouter.post("/improve", requireAuth, async (req,res)=>{
  const {
    hook="",
    cta="",
    niche="business",
    platform="TikTok"
  } = req.body || {};

  const improvements = {
    id:crypto.randomUUID(),
    original:{ hook, cta, niche, platform },
    improved_hooks: improveHook(hook),
    improved_ctas: improveCTA(cta),
    recommendation:"Test at least 2 hooks and 2 CTAs. Keep the winner in Persistent Memory.",
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("optimization_runs").insert({
      id:improvements.id,
      user_id:req.user.id,
      type:"improvement",
      input:{hook,cta,niche,platform},
      output:improvements,
      score:0,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, improvements });
});

optimizationRouter.post("/ab-test", requireAuth, async (req,res)=>{
  const {
    variants=[],
    niche="business",
    platform="TikTok"
  } = req.body || {};

  const scored = (Array.isArray(variants) ? variants : [])
    .map((v,idx)=>({
      id:idx+1,
      variant:v,
      score:scoreText(v),
      reason:scoreText(v) >= 80 ? "strong curiosity / relevance" : "needs stronger hook or clearer value"
    }))
    .sort((a,b)=>b.score-a.score);

  const test = {
    id:crypto.randomUUID(),
    niche,
    platform,
    variants:scored,
    winner:scored[0] || null,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("optimization_runs").insert({
      id:test.id,
      user_id:req.user.id,
      type:"ab_test",
      input:{variants,niche,platform},
      output:test,
      score:test.winner?.score || 0,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, test });
});

optimizationRouter.get("/cycles", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("optimization_runs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });

  const best = data
    .filter(x=>typeof x.score === "number")
    .sort((a,b)=>b.score-a.score)
    .slice(0,5);

  res.json({
    ok:true,
    total_cycles:data.length,
    best_cycles:best,
    recent_cycles:data.slice(0,20)
  });
});

optimizationRouter.get("/recommendations", requireAuth, async (req,res)=>{
  const { data:memory=[] } = await supabase
    .from("persistent_memory")
    .select("*")
    .eq("user_id", req.user.id)
    .order("performance_score",{ascending:false})
    .limit(10);

  const top = memory[0];

  const recommendations = top ? [
    `Reuse ${top.platform} because it has the best historical performance.`,
    `Create variants around this hook: ${top.hook || "your best hook"}`,
    `Double down on niche: ${top.niche}`,
    "Run an A/B test before publishing the next campaign."
  ] : [
    "Start by testing 3 different hooks.",
    "Save performance data into Persistent Memory.",
    "Use short-form video first.",
    "Compare CTA variations."
  ];

  res.json({
    ok:true,
    recommendations
  });
});
