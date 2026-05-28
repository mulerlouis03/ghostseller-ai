import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { AGENTS, chooseAgent, agentOutput } from "../agents/routes.js";

export const unifiedBrainRouter = express.Router();

async function loadMemory(userId){
  const [historyRes, agentRes, growthRes, goalsRes, actionsRes] = await Promise.all([
    supabase.from("content_history").select("*").eq("user_id", userId).order("created_at",{ascending:false}).limit(20),
    supabase.from("agent_runs").select("*").eq("user_id", userId).order("created_at",{ascending:false}).limit(20),
    supabase.from("growth_plans").select("*").eq("user_id", userId).order("created_at",{ascending:false}).limit(10),
    supabase.from("business_goals").select("*").eq("user_id", userId).order("created_at",{ascending:false}).limit(10),
    supabase.from("external_actions").select("*").eq("user_id", userId).order("created_at",{ascending:false}).limit(10)
  ]);

  return {
    content_history:historyRes.data || [],
    agent_runs:agentRes.data || [],
    growth_plans:growthRes.data || [],
    business_goals:goalsRes.data || [],
    external_actions:actionsRes.data || []
  };
}

function brainScore(memory){
  let score = 45;
  score += Math.min((memory.content_history || []).length * 2, 20);
  score += Math.min((memory.agent_runs || []).length * 2, 15);
  score += Math.min((memory.business_goals || []).length * 5, 10);
  score += Math.min((memory.growth_plans || []).length * 4, 10);
  return Math.min(score, 98);
}

function summarizeMemory(memory){
  const niches = {};
  const platforms = {};
  for(const item of memory.content_history || []){
    if(item.niche) niches[item.niche] = (niches[item.niche] || 0) + 1;
    if(item.platform) platforms[item.platform] = (platforms[item.platform] || 0) + 1;
  }

  return {
    total_content:(memory.content_history || []).length,
    total_agent_runs:(memory.agent_runs || []).length,
    total_goals:(memory.business_goals || []).length,
    total_growth_plans:(memory.growth_plans || []).length,
    top_niches:Object.entries(niches).sort((a,b)=>b[1]-a[1]).slice(0,5),
    top_platforms:Object.entries(platforms).sort((a,b)=>b[1]-a[1]).slice(0,5),
    last_goal:(memory.business_goals || [])[0]?.goal || null
  };
}

function prioritize(summary){
  const tasks = [];

  if(summary.total_content < 5) tasks.push({ priority:"high", task:"Generate and publish more content", reason:"Not enough content history yet." });
  if(summary.total_goals < 1) tasks.push({ priority:"high", task:"Set one business goal", reason:"The brain needs a clear objective." });
  if(summary.total_growth_plans < 1) tasks.push({ priority:"medium", task:"Create one growth plan", reason:"Growth system needs a plan to follow." });
  if(summary.top_niches.length > 0) tasks.push({ priority:"medium", task:`Double down on niche: ${summary.top_niches[0][0]}`, reason:"This niche appears most often in your activity." });

  tasks.push({ priority:"high", task:"Ask the AI CMO what to do today", reason:"Daily execution compounds results." });

  return tasks;
}

unifiedBrainRouter.get("/overview", requireAuth, async (req,res)=>{
  const memory = await loadMemory(req.user.id);
  const summary = summarizeMemory(memory);
  const score = brainScore(memory);
  const priorities = prioritize(summary);

  res.json({
    ok:true,
    brain:{
      score,
      summary,
      priorities,
      active_agents:AGENTS.map(a=>({id:a.id,name:a.name,role:a.role})),
      status: score >= 80 ? "strong" : score >= 60 ? "growing" : "needs more data"
    }
  });
});

unifiedBrainRouter.post("/think", requireAuth, async (req,res)=>{
  const { objective="Grow my business", context={} } = req.body || {};
  const memory = await loadMemory(req.user.id);
  const summary = summarizeMemory(memory);

  const selectedAgent = chooseAgent(objective);
  const primary = agentOutput(selectedAgent, objective, { ...context, memory_summary:summary });

  const supportAgents = AGENTS
    .filter(a=>a.id !== selectedAgent)
    .slice(0,3)
    .map(a=>agentOutput(a.id, objective, { support:true, memory_summary:summary }));

  const decision = {
    id:crypto.randomUUID(),
    objective,
    selected_agent:selectedAgent,
    primary,
    support_agents:supportAgents,
    recommended_next_steps:prioritize(summary),
    brain_score:brainScore(memory),
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("unified_brain_runs").insert({
      id:decision.id,
      user_id:req.user.id,
      objective,
      selected_agent:selectedAgent,
      decision,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, decision });
});

unifiedBrainRouter.post("/execute-plan", requireAuth, async (req,res)=>{
  const { objective="Run daily growth system" } = req.body || {};
  const memory = await loadMemory(req.user.id);
  const summary = summarizeMemory(memory);
  const tasks = prioritize(summary);

  const actions = tasks.map(t=>({
    id:crypto.randomUUID(),
    user_id:req.user.id,
    connector:"manual",
    action:"ai_recommended_task",
    payload:{ objective, task:t.task, reason:t.reason, priority:t.priority },
    status:"queued",
    created_at:new Date().toISOString()
  }));

  try{
    await supabase.from("external_actions").insert(actions);
  }catch(_e){}

  res.json({
    ok:true,
    message:"Brain execution plan queued as external/manual actions.",
    actions
  });
});

unifiedBrainRouter.get("/runs", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("unified_brain_runs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, runs:data });
});
