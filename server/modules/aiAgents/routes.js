import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const aiAgentsRouter = express.Router();

const DEFAULT_AGENTS = [
  { key:"content_agent", name:"Content Agent", role:"Generate hooks, captions, reels and campaigns" },
  { key:"growth_agent", name:"Growth Agent", role:"Improve reach and audience growth" },
  { key:"trend_agent", name:"Trend Agent", role:"Detect viral opportunities and trends" },
  { key:"conversion_agent", name:"Conversion Agent", role:"Convert attention into leads and revenue" },
  { key:"tiktok_agent", name:"TikTok Agent", role:"Optimize TikTok content and structure" }
];

async function safeQuery(fn, fallback){
  try{
    const result = await fn();
    if(result?.error) return fallback;
    return result?.data ?? fallback;
  }catch(_e){
    return fallback;
  }
}

async function ensureAgents(userId){
  try{
    for(const a of DEFAULT_AGENTS){
      const { data, error } = await supabase
        .from("ai_agents")
        .select("id")
        .eq("user_id", userId)
        .eq("agent_key", a.key)
        .maybeSingle();

      if(error) continue;

      if(!data){
        await supabase.from("ai_agents").insert({
          id:crypto.randomUUID(),
          user_id:userId,
          agent_key:a.key,
          name:a.name,
          role:a.role,
          status:"active",
          memory:{},
          created_at:new Date().toISOString(),
          updated_at:new Date().toISOString()
        });
      }
    }
  }catch(_e){}
}

aiAgentsRouter.get("/status", requireAuth, (_req,res)=>{
  res.json({ ok:true, module:"aiAgents", version:"V82 hotfix", safe:true });
});

aiAgentsRouter.get("/dashboard", requireAuth, async (req,res)=>{
  await ensureAgents(req.user.id);

  const fallbackAgents = DEFAULT_AGENTS.map(a=>({
    id:a.key,
    user_id:req.user.id,
    agent_key:a.key,
    name:a.name,
    role:a.role,
    status:"demo",
    memory:{}
  }));

  const agents = await safeQuery(
    () => supabase.from("ai_agents").select("*").eq("user_id", req.user.id).order("created_at",{ascending:true}),
    fallbackAgents
  );

  const missions = await safeQuery(
    () => supabase.from("agent_missions").select("*").eq("user_id", req.user.id).order("created_at",{ascending:false}).limit(20),
    []
  );

  res.json({
    ok:true,
    command_center:{
      active_agents:agents.length,
      active_missions:missions.filter(m=>m.status==="active").length,
      agents,
      missions
    }
  });
});

aiAgentsRouter.post("/mission", requireAuth, async (req,res)=>{
  const {
    title="Grow GhostSeller AI",
    objective="Generate TikTok growth content",
    target_platform="TikTok"
  } = req.body || {};

  const mission = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    title,
    objective,
    target_platform,
    status:"active",
    steps:[
      "Analyze niche",
      "Generate hooks",
      "Create storyboard",
      "Generate CTA",
      "Queue campaign",
      "Save winning patterns"
    ],
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };

  try{ await supabase.from("agent_missions").insert(mission); }catch(_e){}

  res.json({ ok:true, mission });
});

aiAgentsRouter.post("/memory/save", requireAuth, async (req,res)=>{
  const {
    agent_key="content_agent",
    memory_key="best_hook",
    memory_value="Nobody talks about this..."
  } = req.body || {};

  const item = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    agent_key,
    memory_key,
    memory_value,
    created_at:new Date().toISOString()
  };

  try{ await supabase.from("agent_memory").insert(item); }catch(_e){}

  res.json({ ok:true, memory:item });
});

aiAgentsRouter.get("/memory", requireAuth, async (req,res)=>{
  const memory = await safeQuery(
    () => supabase.from("agent_memory").select("*").eq("user_id", req.user.id).order("created_at",{ascending:false}).limit(100),
    []
  );

  res.json({ ok:true, memory });
});
