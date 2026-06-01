import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const revenueAutomationRouter = express.Router();

const PLAN_RULES = {
  Free:{ credits:20, max_projects:1, max_posts:10, max_leads:10 },
  Starter:{ credits:300, max_projects:5, max_posts:100, max_leads:100 },
  Pro:{ credits:1200, max_projects:25, max_posts:500, max_leads:500 },
  Agency:{ credits:5000, max_projects:100, max_posts:2500, max_leads:2500 }
};

async function logAutomation({ user_id=null, email="", type="", payload={} }){
  try{
    await supabase.from("revenue_automation_logs").insert({
      id:crypto.randomUUID(), user_id, email, type, payload, created_at:new Date().toISOString()
    });
  }catch(_e){}
}

async function logEmail({ user_id=null, email="", subject="", message="", type="system" }){
  try{
    await supabase.from("email_logs").insert({
      user_id, email, subject, type, status:"queued_or_simulated", payload:{message}, created_at:new Date().toISOString()
    });
  }catch(_e){}
}

revenueAutomationRouter.get("/status", requireAuth, (req,res)=>{
  res.json({
    ok:true,
    module:"V84 Revenue Email Automation",
    plan:req.user.plan || "Free",
    subscription_status:req.user.subscription_status || "free",
    email_mode:process.env.RESEND_API_KEY ? "real_ready" : "simulation",
    stripe_ready:Boolean(process.env.STRIPE_SECRET_KEY),
    plans:PLAN_RULES
  });
});

revenueAutomationRouter.post("/trial-start", requireAuth, async (req,res)=>{
  const { plan="Starter" } = req.body || {};
  const rules = PLAN_RULES[plan] || PLAN_RULES.Starter;
  const trial_ends_at = new Date(Date.now()+7*24*60*60*1000).toISOString();

  const { data:user, error } = await supabase.from("users").update({
    plan, ...rules, subscription_status:"trialing", trial_ends_at, updated_at:new Date().toISOString()
  }).eq("id", req.user.id).select().maybeSingle();

  if(error) return res.status(500).json({ error:error.message });

  await logEmail({ user_id:req.user.id, email:req.user.email, subject:"Ton essai GhostSeller AI a commencé", message:`Essai ${plan} actif jusqu'au ${trial_ends_at}.`, type:"trial_start" });
  await logAutomation({ user_id:req.user.id, email:req.user.email, type:"trial_started", payload:{plan, trial_ends_at} });

  res.json({ ok:true, user, trial_ends_at });
});

revenueAutomationRouter.post("/send-upgrade-email", requireAuth, async (req,res)=>{
  const { email=req.user.email, plan="Pro" } = req.body || {};
  await logEmail({ user_id:req.user.id, email, subject:"Débloque GhostSeller Pro", message:`Passe au plan ${plan} pour plus de campagnes IA.`, type:"upgrade" });
  await logAutomation({ user_id:req.user.id, email, type:"upgrade_email_sent", payload:{plan} });
  res.json({ ok:true, sent:true, simulated:!Boolean(process.env.RESEND_API_KEY) });
});

revenueAutomationRouter.post("/activate-plan", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Owner/admin only." });
  }

  const { email, plan="Pro" } = req.body || {};
  if(!email) return res.status(400).json({ error:"Email required." });

  const rules = PLAN_RULES[plan] || PLAN_RULES.Free;
  const { data:user, error } = await supabase.from("users").update({
    plan, ...rules, subscription_status:plan==="Free" ? "free" : "active", updated_at:new Date().toISOString()
  }).eq("email", email).select().maybeSingle();

  if(error) return res.status(500).json({ error:error.message });

  await logEmail({ user_id:user?.id, email, subject:`Plan ${plan} activé`, message:`Ton plan ${plan} est actif.`, type:"plan_activation" });
  await logAutomation({ user_id:user?.id, email, type:"plan_activated", payload:{plan} });

  res.json({ ok:true, user, plan, rules });
});

revenueAutomationRouter.get("/logs", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Owner/admin only." });
  }
  const { data=[], error } = await supabase.from("revenue_automation_logs").select("*").order("created_at",{ascending:false}).limit(100);
  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, logs:data });
});
