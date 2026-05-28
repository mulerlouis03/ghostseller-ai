import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const agentsRouter = express.Router();

const AGENTS = [
  {
    id:"content_agent",
    name:"Content Agent",
    role:"Creates hooks, captions, scripts and content ideas.",
    strengths:["TikTok hooks","Instagram captions","content calendars","viral angles"]
  },
  {
    id:"growth_agent",
    name:"Growth Agent",
    role:"Finds acquisition strategies and daily growth actions.",
    strengths:["channels","launch plans","audience growth","daily actions"]
  },
  {
    id:"sales_agent",
    name:"Sales Agent",
    role:"Creates sales messages, CTAs and closing flows.",
    strengths:["DM scripts","WhatsApp messages","offers","follow-ups"]
  },
  {
    id:"analytics_agent",
    name:"Analytics Agent",
    role:"Scores performance and recommends optimizations.",
    strengths:["growth score","content score","conversion improvement"]
  },
  {
    id:"brand_agent",
    name:"Brand Strategy Agent",
    role:"Clarifies positioning, voice and market perception.",
    strengths:["positioning","tone","brand angle","trust building"]
  },
  {
    id:"outreach_agent",
    name:"Outreach Agent",
    role:"Creates prospecting and outreach plans.",
    strengths:["cold DM","lead scoring","prospect targeting","community posts"]
  }
];

function chooseAgent(task){
  const t = String(task || "").toLowerCase();

  if(t.includes("hook") || t.includes("post") || t.includes("script") || t.includes("content")) return "content_agent";
  if(t.includes("growth") || t.includes("users") || t.includes("audience")) return "growth_agent";
  if(t.includes("sell") || t.includes("sale") || t.includes("cta") || t.includes("whatsapp")) return "sales_agent";
  if(t.includes("score") || t.includes("analytics") || t.includes("performance")) return "analytics_agent";
  if(t.includes("brand") || t.includes("positioning") || t.includes("trust")) return "brand_agent";
  if(t.includes("dm") || t.includes("prospect") || t.includes("outreach")) return "outreach_agent";

  return "growth_agent";
}

function agentOutput(agentId, task, context){
  const agent = AGENTS.find(a => a.id === agentId) || AGENTS[1];

  const base = {
    agent_id:agent.id,
    agent_name:agent.name,
    task,
    context,
    confidence: Math.floor(78 + Math.random()*20)
  };

  if(agent.id === "content_agent"){
    return {
      ...base,
      output:{
        hooks:[
          "Stop scrolling — this can change your business.",
          "Most businesses post content the wrong way.",
          "Here is how to turn attention into customers."
        ],
        content_plan:[
          "Create one problem-focused reel",
          "Create one transformation post",
          "Create one CTA story"
        ]
      }
    };
  }

  if(agent.id === "growth_agent"){
    return {
      ...base,
      output:{
        channels:["TikTok","Instagram Reels","LinkedIn","Facebook Groups","WhatsApp communities"],
        next_actions:[
          "Publish 1 demo video",
          "DM 10 potential early users",
          "Post 1 founder story",
          "Collect 3 feedback messages"
        ]
      }
    };
  }

  if(agent.id === "sales_agent"){
    return {
      ...base,
      output:{
        offer:"Free AI campaign preview",
        cta:"DM now to get your free preview.",
        follow_up:"Would you like me to generate 3 content ideas for your business?"
      }
    };
  }

  if(agent.id === "analytics_agent"){
    return {
      ...base,
      output:{
        score: Math.floor(70 + Math.random()*25),
        improvements:[
          "Make hook more specific",
          "Add stronger CTA",
          "Use proof or transformation",
          "Test a second creative angle"
        ]
      }
    };
  }

  if(agent.id === "brand_agent"){
    return {
      ...base,
      output:{
        positioning:"AI marketing command center for creators and businesses.",
        tone:"Premium, bold, futuristic, trustworthy",
        trust_assets:["demo videos","testimonials","before/after examples"]
      }
    };
  }

  return {
    ...base,
    output:{
      target_profiles:["small business owners","coaches","agencies","content creators"],
      dm_template:"Hey, I’m testing an AI marketing tool that creates campaigns for businesses. Want a free demo?",
      communities:["entrepreneur groups","creator communities","small business forums"]
    }
  };
}

agentsRouter.get("/list", requireAuth, (req,res)=>{
  res.json({
    ok:true,
    agents:AGENTS
  });
});

agentsRouter.post("/orchestrate", requireAuth, async (req,res)=>{
  const {
    task="grow my business",
    context={}
  } = req.body || {};

  const agentId = chooseAgent(task);
  const result = agentOutput(agentId, task, context);

  try{
    await supabase.from("agent_runs").insert({
      id: crypto.randomUUID(),
      user_id:req.user.id,
      selected_agent:agentId,
      task,
      context,
      result,
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({
    ok:true,
    selected_agent:agentId,
    result
  });
});

agentsRouter.post("/team", requireAuth, async (req,res)=>{
  const {
    objective="Launch and grow GhostSeller",
    context={}
  } = req.body || {};

  const plan = AGENTS.map(agent => agentOutput(agent.id, objective, context));

  try{
    await supabase.from("agent_runs").insert({
      id: crypto.randomUUID(),
      user_id:req.user.id,
      selected_agent:"multi_agent_team",
      task:objective,
      context,
      result:{ team_plan:plan },
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({
    ok:true,
    objective,
    team_plan:plan
  });
});

agentsRouter.get("/runs", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });

  res.json({
    ok:true,
    runs:data
  });
});
