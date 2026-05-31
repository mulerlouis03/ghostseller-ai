import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const cmoRouter = express.Router();

function todayISO(){
  return new Date().toISOString().slice(0,10);
}

function scorePotential(goal, niche, platform){
  let score = 72;
  const text = `${goal} ${niche} ${platform}`.toLowerCase();
  if(text.includes("lead")) score += 8;
  if(text.includes("sale")) score += 7;
  if(text.includes("tiktok") || text.includes("reels")) score += 8;
  if(text.includes("whatsapp")) score += 5;
  return Math.min(score, 98);
}

function buildDailyPlan({ goal, niche, platform }){
  const score = scorePotential(goal, niche, platform);

  return {
    date: todayISO(),
    focus:`${niche || "Business"} growth on ${platform || "TikTok/Reels"}`,
    performance_potential_score: score,
    priority: score >= 85 ? "high" : "medium",
    today_actions:[
      {
        type:"content",
        title:"Publish one high-hook short video",
        instruction:`Create a 20-30s ${platform || "short-form"} video about ${niche || "your business"} with a strong CTA.`
      },
      {
        type:"lead",
        title:"Contact 10 warm prospects",
        instruction:"Use the DM templates from Growth Agent and offer a quick free AI campaign preview."
      },
      {
        type:"conversion",
        title:"Improve CTA",
        instruction:"Add a clear call-to-action: DM, book, try, or click link."
      },
      {
        type:"learning",
        title:"Review performance",
        instruction:"Check which hook got the most attention and reuse the winning pattern."
      }
    ],
    recommended_hook:"Stop scrolling — this can help your business get more customers.",
    recommended_cta:"DM now to get a free AI campaign preview.",
    recommended_post:{
      platform:platform || "TikTok",
      caption:`If you run a ${niche || "business"}, this AI marketing workflow can help you create content and get leads faster.`,
      hashtags:["#marketing","#business","#ai","#growth","#entrepreneur"]
    }
  };
}

cmoRouter.post("/goal", requireAuth, async (req,res)=>{
  const {
    goal="get more leads",
    niche="business",
    platform="TikTok",
    budget="0",
    cadence="daily"
  } = req.body || {};

  const item = {
    id: crypto.randomUUID(),
    user_id: req.user.id,
    goal,
    niche,
    platform,
    budget,
    cadence,
    active:true,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("business_goals").insert(item);
  }catch(_e){}

  res.json({ ok:true, goal:item });
});

cmoRouter.get("/goals", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("business_goals")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false});

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, goals:data });
});

cmoRouter.post("/daily-plan", requireAuth, async (req,res)=>{
  const {
    goal="get more leads",
    niche="business",
    platform="TikTok"
  } = req.body || {};

  const plan = buildDailyPlan({ goal, niche, platform });

  try{
    await supabase.from("autopilot_runs").insert({
      id: crypto.randomUUID(),
      user_id: req.user.id,
      type:"daily_plan",
      input:{ goal, niche, platform },
      output:plan,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, plan });
});

cmoRouter.post("/recurring-campaign", requireAuth, async (req,res)=>{
  const {
    campaign_name="Weekly growth campaign",
    niche="business",
    platform="TikTok",
    frequency="weekly"
  } = req.body || {};

  const campaign = {
    id: crypto.randomUUID(),
    user_id:req.user.id,
    campaign_name,
    niche,
    platform,
    frequency,
    active:true,
    workflow:[
      "Generate 3 hooks",
      "Create 1 short video script",
      "Prepare 1 WhatsApp follow-up message",
      "Publish content manually",
      "Review results",
      "Improve next campaign"
    ],
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("recurring_campaigns").insert(campaign);
  }catch(_e){}

  res.json({ ok:true, campaign });
});

cmoRouter.get("/next-actions", requireAuth, async (req,res)=>{
  res.json({
    ok:true,
    mode:"semi-autonomous",
    title:"What GhostSeller recommends today",
    actions:[
      {
        priority:"high",
        action:"Generate one video pipeline and publish it manually.",
        reason:"Short-form content is the fastest awareness channel."
      },
      {
        priority:"high",
        action:"Send 10 DM templates to potential early users.",
        reason:"Direct outreach is the fastest path to first customers."
      },
      {
        priority:"medium",
        action:"Review Ghost Brain history and reuse the best-performing niche.",
        reason:"Memory helps compound what works."
      },
      {
        priority:"medium",
        action:"Create one proof post about what GhostSeller can generate.",
        reason:"Proof builds trust."
      }
    ]
  });
});

cmoRouter.post("/score-content", requireAuth, (req,res)=>{
  const { hook="", cta="", platform="TikTok" } = req.body || {};
  let score = 60;
  if(hook.length > 30) score += 10;
  if(hook.includes("?") || hook.toLowerCase().includes("stop")) score += 10;
  if(cta.length > 10) score += 10;
  if(["TikTok","Instagram Reels","YouTube Shorts"].includes(platform)) score += 8;

  score = Math.min(score, 98);

  res.json({
    ok:true,
    score,
    verdict:score >= 85 ? "strong" : score >= 70 ? "good" : "needs improvement",
    improvements:[
      "Make the hook more specific",
      "Add stronger urgency",
      "Use a clearer CTA",
      "Show proof or transformation"
    ]
  });
});
