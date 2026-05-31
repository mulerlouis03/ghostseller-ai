import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const ownerConsoleRouter = express.Router();

function ownerEmail(){
  return (process.env.OWNER_EMAIL || "mulerlouis03@gmail.com").toLowerCase().trim();
}
function isOwnerEmail(email){
  const e = String(email || "").toLowerCase().trim();
  return e === ownerEmail() || e.includes("mulerlouis03") || e.includes("muler") || e.includes("ghostseller.ai@gmail");
}
function isOwner(user){
  return ["owner","admin"].includes(user?.role || "") || isOwnerEmail(user?.email);
}
function todayPrefix(){ return new Date().toISOString().slice(0,10); }

async function readTable(name, orderColumn="created_at", limit=1000){
  try{
    const { data, error } = await supabase.from(name).select("*").order(orderColumn,{ascending:false}).limit(limit);
    return error ? [] : (data || []);
  }catch(e){ return []; }
}

function normalizeUser(u, billing=[]){
  const email = (u.email || u.user_email || u.auth_email || "").toLowerCase().trim();
  const owner = isOwnerEmail(email);
  const bp = billing.find(b => String(b.email || "").toLowerCase().trim() === email || (b.user_id && b.user_id === u.id));
  return {
    id:u.id || "",
    name:u.full_name || u.name || u.display_name || u.username || email || "Utilisateur",
    email,
    role:owner ? "owner" : (u.role || "user"),
    plan:owner ? "Owner" : (bp?.plan || u.plan || "Gratuit"),
    status:owner ? "Actif" : (bp?.status || u.subscription_status || "Actif"),
    created_at:u.created_at || "",
    last_login:u.last_login || u.updated_at || "",
    is_owner:owner
  };
}

function dedupeUsers(users){
  const map = new Map();
  for(const u of users){
    const key = (u.email || u.id || u.name || "").toLowerCase();
    if(!key) continue;
    if(!map.has(key) || u.is_owner || u.role === "owner" || u.plan === "Owner"){
      map.set(key, u);
    }
  }
  return Array.from(map.values());
}

ownerConsoleRouter.get("/me", requireAuth, async (req,res)=>{
  res.json({ ok:true, user:req.user, isOwner:isOwner(req.user) });
});

ownerConsoleRouter.get("/overview", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner only." });

  const [rawUsers, rawBilling, feedback, contentLogs, leadLogs] = await Promise.all([
    readTable("users","created_at",1000),
    readTable("billing_profiles","updated_at",1000),
    readTable("feedback","created_at",300),
    readTable("content_generations","created_at",1000),
    readTable("leads","created_at",1000)
  ]);

  const allUsers = dedupeUsers(rawUsers.map(u => normalizeUser(u, rawBilling)));
  const ownerAccounts = allUsers.filter(u => u.is_owner || u.role === "owner" || u.plan === "Owner");
  const users = allUsers.filter(u => !(u.is_owner || u.role === "owner" || u.plan === "Owner"));
  const billing = rawBilling.filter(b => !isOwnerEmail(b.email));

  const today = todayPrefix();
  const payingUsers = users.filter(u => !["gratuit","free",""].includes(String(u.plan || "").toLowerCase()));
  const freeUsers = users.filter(u => ["gratuit","free",""].includes(String(u.plan || "").toLowerCase()));

  res.json({
    ok:true,
    summary:{
      total_users:users.length,
      owner_accounts:ownerAccounts.length,
      new_today:users.filter(u => String(u.created_at || "").startsWith(today)).length,
      paying_users:payingUsers.length,
      free_users:freeUsers.length,
      active_subscriptions:billing.filter(b=>["active","trialing"].includes(b.status)).length,
      feedback_count:feedback.length,
      content_count:contentLogs.length,
      lead_count:leadLogs.length,
      platform_status:"online"
    },
    owner_accounts:ownerAccounts,
    users,
    latest_users:users.slice(0,8),
    billing,
    feedback,
    content_logs:contentLogs.slice(0,50),
    leads:leadLogs.slice(0,50)
  });
});
