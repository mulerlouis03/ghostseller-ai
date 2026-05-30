import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
export const ownerConsoleRouter = express.Router();

function ownerEmail(){ return (process.env.OWNER_EMAIL || "mulerlouis03@gmail.com").toLowerCase(); }
function isOwner(user){
  const email=(user?.email||"").toLowerCase();
  return ["owner","admin"].includes(user?.role||"") || email===ownerEmail() || email.includes("muler");
}
function todayPrefix(){ return new Date().toISOString().slice(0,10); }
async function readTable(name, orderColumn="created_at", limit=1000){
  try{ const {data,error}=await supabase.from(name).select("*").order(orderColumn,{ascending:false}).limit(limit); return error?[]:(data||[]); }
  catch(e){ return []; }
}
function normalizeUser(u,billing=[]){
  const email=(u.email||u.user_email||u.auth_email||"").toLowerCase();
  const name=u.full_name||u.name||u.display_name||u.username||email||"Utilisateur";
  const owner=email===ownerEmail()||email.includes("muler");
  const bp=billing.find(b=>String(b.email||"").toLowerCase()===email || (b.user_id&&b.user_id===u.id));
  return {id:u.id||"",name:owner?(name||"Muler Louis"):name,email,role:owner?"owner":(u.role||"user"),plan:owner?"Owner":(bp?.plan||u.plan||"Gratuit"),status:owner?"Actif":(bp?.status||u.subscription_status||"Actif"),created_at:u.created_at||"",last_login:u.last_login||u.updated_at||""};
}
function dedupeUsers(users){
  const map=new Map();
  for(const u of users){
    const key=(u.email||u.id||u.name||"").toLowerCase(); if(!key) continue;
    if(!map.has(key) || u.role==="owner" || u.plan==="Owner") map.set(key,u);
  }
  return Array.from(map.values());
}
ownerConsoleRouter.get("/me", requireAuth, async (req,res)=>res.json({ok:true,user:req.user,isOwner:isOwner(req.user)}));
ownerConsoleRouter.get("/overview", requireAuth, async (req,res)=>{
  if(!isOwner(req.user)) return res.status(403).json({error:"Owner only."});
  const [rawUsers,billing,feedback,contentLogs,leadLogs]=await Promise.all([
    readTable("users","created_at",1000),
    readTable("billing_profiles","updated_at",1000),
    readTable("feedback","created_at",300),
    readTable("content_generations","created_at",1000),
    readTable("leads","created_at",1000)
  ]);
  const today=todayPrefix();
  const users=dedupeUsers(rawUsers.map(u=>normalizeUser(u,billing)));
  const paying=users.filter(u=>!["gratuit","free","","owner"].includes(String(u.plan||"").toLowerCase()));
  const free=users.filter(u=>["gratuit","free",""].includes(String(u.plan||"").toLowerCase()));
  res.json({ok:true,summary:{
    total_users:users.length,new_today:users.filter(u=>String(u.created_at||"").startsWith(today)).length,
    paying_users:paying.length,free_users:free.length,
    active_subscriptions:billing.filter(b=>["active","trialing"].includes(b.status)).length,
    feedback_count:feedback.length,content_count:contentLogs.length,lead_count:leadLogs.length,platform_status:"online"
  },users,latest_users:users.slice(0,8),billing,feedback,content_logs:contentLogs.slice(0,50),leads:leadLogs.slice(0,50)});
});
