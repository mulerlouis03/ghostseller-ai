import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const executionRouter = express.Router();

function buildWorkflow({ objective, niche, platform }) {
  return [
    {
      step:1,
      agent:"unified_brain",
      action:"analyze_objective",
      status:"pending",
      input:{ objective, niche, platform }
    },
    {
      step:2,
      agent:"content_agent",
      action:"generate_hook_and_script",
      status:"pending",
      input:{ niche, platform }
    },
    {
      step:3,
      agent:"sales_agent",
      action:"create_cta_and_dm",
      status:"pending",
      input:{ objective, niche }
    },
    {
      step:4,
      agent:"video_pipeline",
      action:"prepare_video_storyboard",
      status:"pending",
      input:{ platform, niche }
    },
    {
      step:5,
      agent:"growth_agent",
      action:"prepare_distribution_plan",
      status:"pending",
      input:{ platform, niche }
    },
    {
      step:6,
      agent:"automation_layer",
      action:"queue_manual_external_action",
      status:"pending",
      input:{ platform, note:"Official API publishing requires connected credentials." }
    }
  ];
}

function simulateStep(step){
  return {
    ...step,
    status:"completed",
    completed_at:new Date().toISOString(),
    output:{
      message:`${step.agent} completed ${step.action}`,
      next:"continue"
    }
  };
}

executionRouter.post("/workflow", requireAuth, async (req,res)=>{
  const {
    objective="Create and distribute a marketing campaign",
    niche="business",
    platform="TikTok"
  } = req.body || {};

  const workflow = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    objective,
    niche,
    platform,
    status:"draft",
    steps:buildWorkflow({ objective, niche, platform }),
    retry_count:0,
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };

  try{
    await supabase.from("execution_workflows").insert(workflow);
  }catch(_e){}

  res.json({ ok:true, workflow });
});

executionRouter.post("/run/:id", requireAuth, async (req,res)=>{
  const { id } = req.params;

  const { data:workflow, error } = await supabase
    .from("execution_workflows")
    .select("*")
    .eq("id", id)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if(error) return res.status(500).json({ error:error.message });
  if(!workflow) return res.status(404).json({ error:"Workflow introuvable." });

  const executedSteps = (workflow.steps || []).map(simulateStep);

  const updated = {
    status:"completed",
    steps:executedSteps,
    updated_at:new Date().toISOString()
  };

  try{
    await supabase
      .from("execution_workflows")
      .update(updated)
      .eq("id", id)
      .eq("user_id", req.user.id);

    await supabase.from("execution_logs").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      workflow_id:id,
      event:"workflow_completed",
      payload:{ objective:workflow.objective, steps:executedSteps.length },
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({
    ok:true,
    workflow:{ ...workflow, ...updated }
  });
});

executionRouter.post("/retry/:id", requireAuth, async (req,res)=>{
  const { id } = req.params;

  const { data:workflow, error } = await supabase
    .from("execution_workflows")
    .select("*")
    .eq("id", id)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if(error) return res.status(500).json({ error:error.message });
  if(!workflow) return res.status(404).json({ error:"Workflow introuvable." });

  const retry_count = (workflow.retry_count || 0) + 1;

  try{
    await supabase.from("execution_workflows").update({
      status:"retrying",
      retry_count,
      updated_at:new Date().toISOString()
    }).eq("id", id).eq("user_id", req.user.id);

    await supabase.from("execution_logs").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      workflow_id:id,
      event:"workflow_retry",
      payload:{ retry_count },
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.json({ ok:true, retry_count });
});

executionRouter.get("/workflows", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("execution_workflows")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, workflows:data });
});

executionRouter.get("/logs", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("execution_logs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, logs:data });
});

executionRouter.post("/campaign-runner", requireAuth, async (req,res)=>{
  const {
    campaign_name="Autonomous campaign",
    objective="Generate leads",
    niche="business",
    platform="TikTok"
  } = req.body || {};

  const workflowSteps = buildWorkflow({ objective, niche, platform });

  const campaign = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    campaign_name,
    objective,
    niche,
    platform,
    status:"ready",
    workflow:workflowSteps,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("campaign_runners").insert(campaign);
  }catch(_e){}

  res.json({
    ok:true,
    campaign
  });
});

executionRouter.get("/monitor", requireAuth, async (req,res)=>{
  const { data:workflows=[] } = await supabase
    .from("execution_workflows")
    .select("status")
    .eq("user_id", req.user.id);

  const counts = workflows.reduce((acc,w)=>{
    acc[w.status] = (acc[w.status] || 0) + 1;
    return acc;
  },{});

  res.json({
    ok:true,
    monitor:{
      total:workflows.length,
      by_status:counts,
      health:counts.failed ? "needs_attention" : "healthy"
    }
  });
});
