import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const connectorsRouter = express.Router();

const CONNECTORS = [
  {
    id:"meta",
    name:"Meta / Instagram / Facebook",
    status:"credentials_required",
    required_env:["META_APP_ID","META_APP_SECRET","META_REDIRECT_URI"],
    capabilities:["future_posting","future_insights","future_pages"]
  },
  {
    id:"tiktok",
    name:"TikTok",
    status:"credentials_required",
    required_env:["TIKTOK_CLIENT_KEY","TIKTOK_CLIENT_SECRET","TIKTOK_REDIRECT_URI"],
    capabilities:["future_upload","future_insights","future_trends"]
  },
  {
    id:"linkedin",
    name:"LinkedIn",
    status:"strategy_ready",
    required_env:["LINKEDIN_CLIENT_ID","LINKEDIN_CLIENT_SECRET"],
    capabilities:["future_posts","future_company_pages"]
  },
  {
    id:"whatsapp",
    name:"WhatsApp Business",
    status:"credentials_required",
    required_env:["WHATSAPP_TOKEN","WHATSAPP_PHONE_NUMBER_ID"],
    capabilities:["future_messages","future_leads","future_followups"]
  }
];

connectorsRouter.get("/status", requireAuth, (req,res)=>{
  const status = CONNECTORS.map(c => ({
    ...c,
    env_ready: c.required_env.every(k => Boolean(process.env[k]))
  }));

  res.json({ ok:true, connectors:status });
});

connectorsRouter.post("/action", requireAuth, async (req,res)=>{
  const {
    connector="manual",
    action="draft",
    payload={}
  } = req.body || {};

  const item = {
    id: crypto.randomUUID(),
    user_id:req.user.id,
    connector,
    action,
    payload,
    status:"queued",
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("external_actions").insert(item);
  }catch(_e){}

  res.json({
    ok:true,
    action:item,
    message:"Action queued. Real execution requires official API credentials."
  });
});

connectorsRouter.get("/actions", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("external_actions")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, actions:data });
});

connectorsRouter.post("/schedule", requireAuth, async (req,res)=>{
  const {
    title="Scheduled automation",
    connector="manual",
    frequency="daily",
    task={}
  } = req.body || {};

  const job = {
    id: crypto.randomUUID(),
    user_id:req.user.id,
    title,
    connector,
    frequency,
    task,
    active:true,
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("agent_schedules").insert(job);
  }catch(_e){}

  res.json({
    ok:true,
    schedule:job
  });
});

connectorsRouter.get("/schedules", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("agent_schedules")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false});

  if(error) return res.status(500).json({ error:error.message });

  res.json({ ok:true, schedules:data });
});
