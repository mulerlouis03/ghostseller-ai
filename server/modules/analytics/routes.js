import express from "express";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, requireAdminOrOwner } from "../../lib/auth.js";
export const analyticsRouter = express.Router();

analyticsRouter.get("/launch", requireAuth, requireAdminOrOwner, async (req,res)=>{
 try{
  const count = async (table)=>{
   const {count,error}=await supabase.from(table).select("*",{count:"exact",head:true});
   return error ? 0 : (count||0);
  };
  const rows = async (table,limit=20)=>{
   const {data,error}=await supabase.from(table).select("*").order("created_at",{ascending:false}).limit(limit);
   return error ? [] : (data||[]);
  };

  const users=await rows("users",50);
  const waitlist=await rows("waitlist",50);

  const starter=users.filter(u=>(u.plan||"")==="Starter");
  const pro=users.filter(u=>(u.plan||"")==="Pro");
  const paid=[...starter,...pro];
  const mrr=Number((starter.length*9.99 + pro.length*29).toFixed(2));

  res.json({
   ok:true,
   launchStatus:"ready",
   summary:{
    users:await count("users"),
    paidUsers:paid.length,
    starterUsers:starter.length,
    proUsers:pro.length,
    estimatedMRR:mrr,
    waitlist:await count("waitlist"),
    projects:await count("projects"),
    posts:await count("posts"),
    leads:await count("leads"),
    trends:await count("trends"),
    autopilotCampaigns:await count("auto_campaigns")
   },
   recentUsers:users.slice(0,10).map(u=>({email:u.email,name:u.name,role:u.role||"user",plan:u.plan||"Free",credits:u.credits??0,created_at:u.created_at})),
   recentWaitlist:waitlist.slice(0,10).map(w=>({name:w.name,email:w.email,business:w.business,created_at:w.created_at})),
   checklist:{
    stripe:Boolean(process.env.STRIPE_SECRET_KEY),
    openai:Boolean(process.env.OPENAI_API_KEY),
    supabase:Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY),
    appUrl:Boolean(process.env.APP_URL),
    owner:(req.user.role||"user")==="owner"
   }
  });
 }catch(e){res.status(500).json({error:e.message||"Erreur analytics."});}
});
