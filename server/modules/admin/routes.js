import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const adminRouter = express.Router();

function isOwner(user){
  return ["owner","admin"].includes(user?.role || "");
}

function requireOwner(req,res,next){
  if(!req.user) return res.status(401).json({ error:"Non connecté." });
  if(!isOwner(req.user)) return res.status(403).json({ error:"Accès admin requis." });
  next();
}

async function safeSelect(query, fallback=[]){
  try{
    const { data, error } = await query;
    if(error) return fallback;
    return data || fallback;
  }catch(_e){
    return fallback;
  }
}

adminRouter.get("/status", requireAuth, requireOwner, (_req,res)=>{
  res.json({
    ok:true,
    admin:true,
    version:"V75 HOTFIX",
    status:"safe"
  });
});

adminRouter.get("/overview", requireAuth, requireOwner, async (_req,res)=>{
  const users = await safeSelect(
    supabase.from("users").select("id,email,role,plan,access_status,credits,created_at"),
    []
  );

  const usage = await safeSelect(
    supabase.from("usage_counters").select("*"),
    []
  );

  const emails = await safeSelect(
    supabase.from("email_logs").select("*").order("created_at",{ascending:false}).limit(20),
    []
  );

  const actions = await safeSelect(
    supabase.from("external_actions").select("*").order("created_at",{ascending:false}).limit(20),
    []
  );

  res.json({
    ok:true,
    overview:{
      total_users:users.length,
      owners:users.filter(u=>["owner","admin"].includes(u.role)).length,
      free_users:users.filter(u=>(u.plan || "Free")==="Free").length,
      paid_users:users.filter(u=>!["Free",""].includes(u.plan || "Free")).length,
      total_used_credits:usage.reduce((a,b)=>a+(b.used_credits||0),0),
      recent_emails:emails,
      recent_actions:actions
    }
  });
});

adminRouter.get("/users", requireAuth, requireOwner, async (_req,res)=>{
  const users = await safeSelect(
    supabase.from("users")
      .select("id,email,name,role,plan,access_status,credits,max_projects,max_posts,max_leads,onboarding_completed,created_at")
      .order("created_at",{ascending:false})
      .limit(200),
    []
  );

  res.json({ ok:true, users });
});

adminRouter.post("/user/update", requireAuth, requireOwner, async (req,res)=>{
  const { email, role, plan, access_status, credits, max_projects, max_posts, max_leads } = req.body || {};
  if(!email) return res.status(400).json({ error:"Email requis." });

  const update = {};
  if(role !== undefined && role !== "") update.role = role;
  if(plan !== undefined && plan !== "") update.plan = plan;
  if(access_status !== undefined && access_status !== "") update.access_status = access_status;
  if(credits !== undefined && credits !== "") update.credits = Number(credits);
  if(max_projects !== undefined && max_projects !== "") update.max_projects = Number(max_projects);
  if(max_posts !== undefined && max_posts !== "") update.max_posts = Number(max_posts);
  if(max_leads !== undefined && max_leads !== "") update.max_leads = Number(max_leads);
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .update(update)
    .eq("email", email)
    .select()
    .maybeSingle();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, user:data });
});

adminRouter.post("/user/approve", requireAuth, requireOwner, async (req,res)=>{
  const { email } = req.body || {};
  if(!email) return res.status(400).json({ error:"Email requis." });

  const { data, error } = await supabase
    .from("users")
    .update({ access_status:"approved", updated_at:new Date().toISOString() })
    .eq("email", email)
    .select()
    .maybeSingle();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, user:data });
});

adminRouter.post("/usage/reset", requireAuth, requireOwner, async (req,res)=>{
  const { user_id } = req.body || {};
  if(!user_id) return res.status(400).json({ error:"user_id requis." });

  const { data, error } = await supabase
    .from("usage_counters")
    .upsert({
      user_id,
      used_credits:0,
      used_posts:0,
      used_leads:0,
      used_projects:0,
      updated_at:new Date().toISOString()
    }, { onConflict:"user_id" })
    .select()
    .maybeSingle();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, usage:data });
});

adminRouter.get("/logs", requireAuth, requireOwner, async (_req,res)=>{
  const emails = await safeSelect(supabase.from("email_logs").select("*").order("created_at",{ascending:false}).limit(50), []);
  const usageEvents = await safeSelect(supabase.from("usage_events").select("*").order("created_at",{ascending:false}).limit(50), []);
  const brainRuns = await safeSelect(supabase.from("unified_brain_runs").select("*").order("created_at",{ascending:false}).limit(50), []);
  const workflows = await safeSelect(supabase.from("execution_workflows").select("*").order("created_at",{ascending:false}).limit(50), []);

  res.json({
    ok:true,
    logs:{
      emails,
      usage_events:usageEvents,
      brain_runs:brainRuns,
      workflows
    }
  });
});
