import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const ownerConsoleRouter = express.Router();

function isOwner(user){
  const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase();
  const email = (user?.email || "").toLowerCase();
  return ["owner","admin"].includes(user?.role || "") || (ownerEmail && email === ownerEmail) || email.includes("muler");
}

function todayPrefix(){
  return new Date().toISOString().slice(0,10);
}

function normalizeUser(u, billing=[]){
  const email = u.email || u.user_email || u.auth_email || "";
  const name = u.full_name || u.name || u.display_name || u.username || email || "Utilisateur";
  const billingProfile = billing.find(b => (b.email && b.email === email) || (b.user_id && b.user_id === u.id));
  return {
    id:u.id || "",
    name,
    email,
    role:u.role || "user",
    plan: billingProfile?.plan || u.plan || "Gratuit",
    status: billingProfile?.status || u.subscription_status || "Actif",
    created_at:u.created_at || "",
    last_login:u.last_login || u.updated_at || ""
  };
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
  const mappedUsers = users.map(u => normalizeUser(u, billing));
  const payingUsers = mappedUsers.filter(u => !["gratuit","free",""].includes(String(u.plan || "").toLowerCase()));

  res.json({
    ok:true,
    summary:{
      total_users:mappedUsers.length,
      new_today:mappedUsers.filter(u => String(u.created_at || "").startsWith(today)).length,
      paying_users:payingUsers.length,
      free_users:mappedUsers.length - payingUsers.length,
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
