import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const ownerConsoleRouter = express.Router();

function ownerEmail(){
  return (process.env.OWNER_EMAIL || "mulerlouis03@gmail.com").toLowerCase();
}

function isOwner(user){
  const email = (user?.email || "").toLowerCase();
  return ["owner","admin"].includes(user?.role || "") || email === ownerEmail() || email.includes("muler");
}

function todayPrefix(){
  return new Date().toISOString().slice(0,10);
}

function normalizeUser(u, billing=[]){
  const email = (u.email || u.user_email || u.auth_email || "").toLowerCase();
  const name = u.full_name || u.name || u.display_name || u.username || email || "Utilisateur";
  const isOwnerAccount = email === ownerEmail() || email.includes("muler");
  const billingProfile = billing.find(b => {
    const be = String(b.email || "").toLowerCase();
    return (be && be === email) || (b.user_id && b.user_id === u.id);
  });

  return {
    id:u.id || "",
    name: isOwnerAccount ? (name || "Muler Louis") : name,
    email,
    role: isOwnerAccount ? "owner" : (u.role || "user"),
    plan: isOwnerAccount ? "Owner" : (billingProfile?.plan || u.plan || "Gratuit"),
    status: isOwnerAccount ? "Actif" : (billingProfile?.status || u.subscription_status || "Actif"),
    created_at:u.created_at || "",
    last_login:u.last_login || u.updated_at || ""
  };
}

function dedupeUsers(users){
  const map = new Map();

  for(const u of users){
    const key = (u.email || u.id || u.name || "").toLowerCase();
    if(!key) continue;

    if(!map.has(key)){
      map.set(key, u);
      continue;
    }

    const existing = map.get(key);

    // Owner always wins
    if(u.role === "owner" || u.plan === "Owner"){
      map.set(key, u);
      continue;
    }

    // Prefer paid plan over free if same email
    const existingFree = ["gratuit","free",""].includes(String(existing.plan || "").toLowerCase());
    const userFree = ["gratuit","free",""].includes(String(u.plan || "").toLowerCase());
    if(existingFree && !userFree){
      map.set(key, u);
      continue;
    }

    // Prefer newest known activity
    const exDate = new Date(existing.last_login || existing.created_at || 0).getTime();
    const uDate = new Date(u.last_login || u.created_at || 0).getTime();
    if(uDate > exDate && existing.plan !== "Owner"){
      map.set(key, {...existing, ...u, plan: existing.plan === "Owner" ? "Owner" : u.plan});
    }
  }

  return Array.from(map.values());
}

ownerConsoleRouter.get("/me", requireAuth, async (req,res)=>{
  res.json({ ok:true, user:req.user, isOwner:isOwner(req.user) });
});

ownerConsoleRouter.get("/overview", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner only." });

  let users = [];
  let billing = [];
  let feedback = [];

  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at",{ascending:false}).limit(1000);
    users = error ? [] : (data || []);
  } catch(e) { users = []; }

  try {
    const { data, error } = await supabase.from("billing_profiles").select("*").order("updated_at",{ascending:false}).limit(1000);
    billing = error ? [] : (data || []);
  } catch(e) { billing = []; }

  try {
    const { data, error } = await supabase.from("feedback").select("*").order("created_at",{ascending:false}).limit(300);
    feedback = error ? [] : (data || []);
  } catch(e) { feedback = []; }

  const today = todayPrefix();
  const mappedUsers = dedupeUsers(users.map(u => normalizeUser(u, billing)));
  const payingUsers = mappedUsers.filter(u => !["gratuit","free","","owner"].includes(String(u.plan || "").toLowerCase()));

  res.json({
    ok:true,
    summary:{
      total_users:mappedUsers.length,
      new_today:mappedUsers.filter(u => String(u.created_at || "").startsWith(today)).length,
      paying_users:payingUsers.length,
      free_users:mappedUsers.filter(u => ["gratuit","free",""].includes(String(u.plan || "").toLowerCase())).length,
      active_subscriptions:billing.filter(b=>["active","trialing"].includes(b.status)).length,
      starter:billing.filter(b=>b.plan==="starter").length,
      pro:billing.filter(b=>b.plan==="pro").length,
      agency:billing.filter(b=>b.plan==="agency").length,
      feedback_count:feedback.length,
      platform_status:"online"
    },
    users:mappedUsers,
    latest_users:mappedUsers.slice(0,8),
    billing,
    feedback
  });
});
