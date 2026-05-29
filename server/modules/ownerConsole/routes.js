import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
export const ownerConsoleRouter = express.Router();
function isOwner(user){ return ["owner","admin"].includes(user?.role || "") || user?.email === process.env.OWNER_EMAIL; }

ownerConsoleRouter.get("/overview", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({ error:"Owner only." });
  const [usersRes,billingRes]=await Promise.all([
    supabase.from("users").select("id,email,role,plan,created_at,last_login,subscription_status").order("created_at",{ascending:false}).limit(100),
    supabase.from("billing_profiles").select("*").order("updated_at",{ascending:false}).limit(100)
  ]);
  const users=usersRes.data||[], billing=billingRes.data||[];
  res.json({ok:true,summary:{
    total_users:users.length,
    active_subscriptions:billing.filter(b=>["active","trialing"].includes(b.status)).length,
    starter:billing.filter(b=>b.plan==="starter").length,
    pro:billing.filter(b=>b.plan==="pro").length,
    agency:billing.filter(b=>b.plan==="agency").length,
    tiktok_review:"submitted",
    platform_status:"online"
  },users,billing});
});
