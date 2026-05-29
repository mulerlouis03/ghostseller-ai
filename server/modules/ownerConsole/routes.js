import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const ownerConsoleRouter = express.Router();

function isOwner(user){
  const ownerEmail = (process.env.OWNER_EMAIL || "").toLowerCase();
  const email = (user?.email || "").toLowerCase();
  return ["owner","admin"].includes(user?.role || "") || (ownerEmail && email === ownerEmail);
}

ownerConsoleRouter.get("/overview", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner only." });

  const [usersRes, billingRes, feedbackRes] = await Promise.all([
    supabase.from("users").select("id,email,role,plan,created_at,last_login,subscription_status").order("created_at",{ascending:false}).limit(100),
    supabase.from("billing_profiles").select("*").order("updated_at",{ascending:false}).limit(100),
    supabase.from("feedback").select("*").order("created_at",{ascending:false}).limit(50)
  ]);

  const users = usersRes.data || [];
  const billing = billingRes.data || [];
  const feedback = feedbackRes.data || [];

  res.json({
    ok:true,
    summary:{
      total_users:users.length,
      active_subscriptions:billing.filter(b=>["active","trialing"].includes(b.status)).length,
      starter:billing.filter(b=>b.plan==="starter").length,
      pro:billing.filter(b=>b.plan==="pro").length,
      agency:billing.filter(b=>b.plan==="agency").length,
      feedback_count:feedback.length,
      platform_status:"online"
    },
    users,
    billing,
    feedback
  });
});
