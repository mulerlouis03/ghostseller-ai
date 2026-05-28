import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const agentsRouter = express.Router();

const DEFAULT_AGENTS = [
  {
    key:"content_agent",
    name:"Content Agent",
    role:"Generate hooks, captions, reels and campaigns"
  },
  {
    key:"growth_agent",
    name:"Growth Agent",
    role:"Improve reach and audience growth"
  },
  {
    key:"trend_agent",
    name:"Trend Agent",
    role:"Detect viral opportunities and trends"
  },
  {
    key:"conversion_agent",
    name:"Conversion Agent",
    role:"Convert attention into leads and revenue"
  },
  {
    key:"tiktok_agent",
    name:"TikTok Agent",
    role:"Optimize TikTok content and structure"
  }
];

async function ensureAgents(userId){
  for(const a of DEFAULT_AGENTS){
    const { data } = await supabase
      .from("ai_agents")
      .select("id")
      .eq("user_id", userId)
      .eq("agent_key", a.key)
      .maybeSingle();

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
}

agentsRouter.get("/dashboard", requireAuth, async (req,res)=>{
  await ensureAgents(req.user.id);

  const { data:agents=[] } = await supabase
    .from("ai_agents")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:true});

  const { data:missions=[] } = await supabase
    .from("agent_missions")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(20);

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

agentsRouter.post("/mission", requireAuth, async (req,res)=>{
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

  await supabase.from("agent_missions").insert(mission);

  res.json({ ok:true, mission });
});

agentsRouter.post("/memory/save", requireAuth, async (req,res)=>{
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

  await supabase.from("agent_memory").insert(item);

  res.json({ ok:true, memory:item });
});

agentsRouter.get("/memory", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("agent_memory")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, memory:data });
});
