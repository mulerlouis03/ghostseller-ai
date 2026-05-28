import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const adminRouter = express.Router();

function requireOwner(req,res,next){
  if(!req.user) return res.status(401).json({ error:"Non connecté." });
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Accès admin requis." });
  }
  next();
}

adminRouter.get("/overview", requireAuth, requireOwner, async (_req,res)=>{
  const [users, usage, emails, actions] = await Promise.all([
    supabase.from("users").select("id,email,role,plan,access_status,credits,created_at"),
    supabase.from("usage_counters").select("*"),
    supabase.from("email_logs").select("*").order("created_at",{ascending:false}).limit(20),
    supabase.from("external_actions").select("*").order("created_at",{ascending:false}).limit(20)
  ]);

  const userList = users.data || [];
  const usageList = usage.data || [];

  res.json({
    ok:true,
    overview:{
      total_users:userList.length,
      owners:userList.filter(u=>["owner","admin"].includes(u.role)).length,
      free_users:userList.filter(u=>(u.plan || "Free")==="Free").length,
      paid_users:userList.filter(u=>!["Free",""].includes(u.plan || "Free")).length,
      total_used_credits:usageList.reduce((a,b)=>a+(b.used_credits||0),0),
      recent_emails:emails.data || [],
      recent_actions:actions.data || []
    }
  });
});

adminRouter.get("/users", requireAuth, requireOwner, async (_req,res)=>{
  const { data=[], error } = await supabase
    .from("users")
    .select("id,email,name,role,plan,access_status,credits,max_projects,max_posts,max_leads,onboarding_completed,created_at")
    .order("created_at",{ascending:false})
    .limit(200);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, users:data });
});

adminRouter.post("/user/update", requireAuth, requireOwner, async (req,res)=>{
  const { email, role, plan, access_status, credits, max_projects, max_posts, max_leads } = req.body || {};
  if(!email) return res.status(400).json({ error:"Email requis." });

  const update = {};
  if(role !== undefined) update.role = role;
  if(plan !== undefined) update.plan = plan;
  if(access_status !== undefined) update.access_status = access_status;
  if(credits !== undefined) update.credits = Number(credits);
  if(max_projects !== undefined) update.max_projects = Number(max_projects);
  if(max_posts !== undefined) update.max_posts = Number(max_posts);
  if(max_leads !== undefined) update.max_leads = Number(max_leads);
  update.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("users")
    .update(update)
    .eq("email", email)
    .select()
    .single();

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
    .single();

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
    .single();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, usage:data });
});

adminRouter.get("/logs", requireAuth, requireOwner, async (_req,res)=>{
  const [emails, usageEvents, brainRuns, workflows] = await Promise.all([
    supabase.from("email_logs").select("*").order("created_at",{ascending:false}).limit(50),
    supabase.from("usage_events").select("*").order("created_at",{ascending:false}).limit(50),
    supabase.from("unified_brain_runs").select("*").order("created_at",{ascending:false}).limit(50),
    supabase.from("execution_workflows").select("*").order("created_at",{ascending:false}).limit(50)
  ]);

  res.json({
    ok:true,
    logs:{
      emails:emails.data || [],
      usage_events:usageEvents.data || [],
      brain_runs:brainRuns.data || [],
      workflows:workflows.data || []
    }
  });
});
