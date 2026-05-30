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

ownerConsoleRouter.get("/me", requireAuth, async (req,res)=>{
  res.json({ ok:true, user:req.user, isOwner:isOwner(req.user) });
});

ownerConsoleRouter.get("/overview", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner only." });

  const [usersRes, billingRes, feedbackRes] = await Promise.all([
    supabase.from("users").select("*").order("created_at",{ascending:false}).limit(500),
    supabase.from("billing_profiles").select("*").order("updated_at",{ascending:false}).limit(500),
    supabase.from("feedback").select("*").order("created_at",{ascending:false}).limit(100)
  ]);

  const users = usersRes.data || [];
  const billing = billingRes.data || [];
  const feedback = feedbackRes.data || [];
  const today = todayPrefix();

  const mappedUsers = users.map(u => {
    const email = u.email || u.user_email || "";
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
  });

  res.json({
    ok:true,
    summary:{
      total_users:mappedUsers.length,
      new_today:mappedUsers.filter(u => String(u.created_at || "").startsWith(today)).length,
      active_subscriptions:billing.filter(b=>["active","trialing"].includes(b.status)).length,
      free_users:mappedUsers.filter(u => !u.plan || String(u.plan).toLowerCase().includes("gratuit") || String(u.plan).toLowerCase()==="free").length,
      starter:billing.filter(b=>b.plan==="starter").length,
      pro:billing.filter(b=>b.plan==="pro").length,
      agency:billing.filter(b=>b.plan==="agency").length,
      feedback_count:feedback.length,
      platform_status:"online"
    },
    users:mappedUsers,
    billing,
    feedback
  });
});
