import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const autoGrowthRouter = express.Router();

function today(){
  return new Date().toISOString().slice(0,10);
}

function scoreGrowth({ users=0, campaigns=0, content=0, paid=0 }){
  let score = 35;
  score += Math.min(users * 2, 20);
  score += Math.min(campaigns * 5, 20);
  score += Math.min(content * 2, 15);
  score += Math.min(paid * 10, 10);
  return Math.min(score, 98);
}

async function loadGrowthContext(userId){
  const [content, campaigns, memory, revenue] = await Promise.all([
    supabase.from("content_history").select("*").eq("user_id", userId).limit(50),
    supabase.from("opportunity_campaigns").select("*").eq("user_id", userId).limit(50),
    supabase.from("persistent_memory").select("*").eq("user_id", userId).order("performance_score",{ascending:false}).limit(20),
    supabase.from("billing_events").select("*").limit(50)
  ]);

  return {
    content:content.data || [],
    campaigns:campaigns.data || [],
    memory:memory.data || [],
    revenue:revenue.data || []
  };
}

function buildDailyGrowthPlan(context){
  const topMemory = context.memory?.[0];

  return {
    date:today(),
    objective:"Acquire users and convert attention into revenue",
    focus_niche:topMemory?.niche || "AI tools for small businesses",
    focus_platform:topMemory?.platform || "TikTok / Instagram Reels",
    growth_score:scoreGrowth({
      campaigns:context.campaigns.length,
      content:context.content.length,
      paid:context.revenue.length
    }),
    actions:[
      {
        priority:"high",
        type:"content",
        task:"Publish one demo video showing GhostSeller generating a campaign.",
        output_needed:"hook + 5-scene reel + CTA"
      },
      {
        priority:"high",
        type:"outreach",
        task:"Contact 10 entrepreneurs or creators with a free AI campaign preview.",
        output_needed:"DM script"
      },
      {
        priority:"high",
        type:"conversion",
        task:"Push users toward Starter or Pro plan after first value moment.",
        output_needed:"upgrade CTA"
      },
      {
        priority:"medium",
        type:"proof",
        task:"Create one before/after post using a generated campaign example.",
        output_needed:"social proof post"
      }
    ],
    recommended_offer:"Free AI campaign preview",
    recommended_cta:"Try GhostSeller today and generate your first campaign.",
    next_experiment:"A/B test two hooks: curiosity vs transformation."
  };
}

autoGrowthRouter.get("/dashboard", requireAuth, async (req,res)=>{
  const context = await loadGrowthContext(req.user.id);
  const plan = buildDailyGrowthPlan(context);

  res.json({
    ok:true,
    dashboard:{
      growth_score:plan.growth_score,
      content_count:context.content.length,
      campaign_count:context.campaigns.length,
      memory_count:context.memory.length,
      revenue_events:context.revenue.length,
      today_plan:plan
    }
  });
});

autoGrowthRouter.post("/daily-plan", requireAuth, async (req,res)=>{
  const context = await loadGrowthContext(req.user.id);
  const plan = buildDailyGrowthPlan(context);

  try{
    await supabase.from("autonomous_growth_runs").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      run_type:"daily_plan",
      input:{},
      output:plan,
      status:"generated",
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, plan });
});

autoGrowthRouter.post("/launch-loop", requireAuth, async (req,res)=>{
  const { target="first 100 beta users", niche="AI marketing SaaS", platform="TikTok" } = req.body || {};

  const loop = {
    id:crypto.randomUUID(),
    target,
    niche,
    platform,
    steps:[
      "Detect opportunity",
      "Generate content pack",
      "Create reel storyboard",
      "Queue social post",
      "Send outreach DM",
      "Collect feedback",
      "Recommend upgrade",
      "Save performance to memory"
    ],
    assets:{
      hook:`Most businesses are wasting time creating content manually.`,
      reel:`Show GhostSeller creating a campaign in less than 30 seconds.`,
      dm:`Hey, I’m opening early access to an AI marketing tool. Want a free campaign preview?`,
      upgrade_cta:`Unlock Pro to run more campaigns and save your best strategies.`
    },
    status:"ready"
  };

  try{
    await supabase.from("growth_loops").insert({
      id:loop.id,
      user_id:req.user.id,
      target,
      niche,
      platform,
      loop,
      status:"ready",
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, loop });
});

autoGrowthRouter.post("/execute-loop/:id", requireAuth, async (req,res)=>{
  const { id } = req.params;

  const { data:loopRow } = await supabase
    .from("growth_loops")
    .select("*")
    .eq("id", id)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if(!loopRow) return res.status(404).json({ error:"Growth loop not found." });

  const actions = (loopRow.loop?.steps || []).map((step, index)=>({
    id:crypto.randomUUID(),
    user_id:req.user.id,
    connector:"manual",
    action:"growth_loop_step",
    payload:{
      loop_id:id,
      step_number:index+1,
      step,
      note:"Manual/safe execution until official social APIs are fully approved."
    },
    status:"queued",
    created_at:new Date().toISOString()
  }));

  try{
    await supabase.from("external_actions").insert(actions);
    await supabase.from("growth_loops").update({
      status:"queued",
      updated_at:new Date().toISOString()
    }).eq("id", id).eq("user_id", req.user.id);
  }catch(_e){}

  res.json({ ok:true, actions });
});

autoGrowthRouter.get("/loops", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("growth_loops")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, loops:data });
});

autoGrowthRouter.get("/runs", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("autonomous_growth_runs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, runs:data });
});
