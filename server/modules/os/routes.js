import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const osRouter = express.Router();

const DAILY_TASKS = [
  "Publish one short-form video",
  "Reply to 5 potential leads",
  "Improve one landing section",
  "Analyze one competitor",
  "Create one CTA-focused post",
  "Follow up with old prospects"
];

function growthScore(data){
  let score = 50;

  if((data.history || 0) > 10) score += 10;
  if((data.campaigns || 0) > 3) score += 10;
  if((data.leads || 0) > 5) score += 10;
  if((data.posts || 0) > 10) score += 10;
  if((data.tasks || 0) > 3) score += 10;

  return Math.min(score,98);
}

osRouter.get("/dashboard", requireAuth, async (req,res)=>{
  const { data:history=[] } = await supabase
    .from("content_history")
    .select("*")
    .eq("user_id", req.user.id);

  const { data:growth=[] } = await supabase
    .from("growth_plans")
    .select("*")
    .eq("user_id", req.user.id);

  const dashboard = {
    user:req.user.email,
    generated_content:history.length,
    campaigns:growth.length,
    leads_estimation:Math.floor(history.length * 1.5),
    growth_score:growthScore({
      history:history.length,
      campaigns:growth.length,
      leads:Math.floor(history.length * 1.5),
      posts:history.length,
      tasks:DAILY_TASKS.length
    }),
    recommendations:[
      "Publish more short-form content",
      "Increase CTA usage in videos",
      "Focus on one niche for 7 days",
      "Collect testimonials from users"
    ],
    today_tasks:DAILY_TASKS
  };

  res.json({
    ok:true,
    dashboard
  });
});

osRouter.post("/calendar", requireAuth, (req,res)=>{
  const {
    niche="Business",
    platform="TikTok",
    days=7
  } = req.body || {};

  const calendar = [];

  for(let i=1;i<=Number(days || 7);i++){
    calendar.push({
      day:i,
      platform,
      niche,
      content_type:i % 2 === 0 ? "Educational" : "Viral",
      idea:`${niche} content idea #${i}`,
      cta:"DM for more information"
    });
  }

  res.json({
    ok:true,
    calendar
  });
});

osRouter.post("/lead-pipeline", requireAuth, (req,res)=>{
  const {
    niche="Business"
  } = req.body || {};

  res.json({
    ok:true,
    pipeline:{
      niche,
      stages:[
        {
          stage:"Discovery",
          goal:"Find businesses needing content"
        },
        {
          stage:"Contact",
          goal:"Send DM or outreach message"
        },
        {
          stage:"Demo",
          goal:"Show AI-generated example"
        },
        {
          stage:"Conversion",
          goal:"Move to paid subscription"
        },
        {
          stage:"Retention",
          goal:"Keep client active with weekly value"
        }
      ]
    }
  });
});

osRouter.post("/task", requireAuth, async (req,res)=>{
  const {
    title="Business task",
    priority="medium"
  } = req.body || {};

  const task = {
    id: crypto.randomUUID(),
    user_id:req.user.id,
    title,
    priority,
    completed:false,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("ai_tasks").insert(task);
  }catch(_e){}

  res.json({
    ok:true,
    task
  });
});

osRouter.get("/recommendations", requireAuth, (req,res)=>{
  res.json({
    ok:true,
    recommendations:[
      {
        type:"content",
        title:"Publish more reels",
        impact:"high"
      },
      {
        type:"growth",
        title:"Message 10 new businesses",
        impact:"high"
      },
      {
        type:"branding",
        title:"Create before/after showcase",
        impact:"medium"
      },
      {
        type:"conversion",
        title:"Improve CTA in short videos",
        impact:"high"
      }
    ]
  });
});
