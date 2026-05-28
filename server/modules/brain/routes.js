import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { requireAuth } from "../../lib/auth.js";
export const brainRouter = express.Router();

brainRouter.get("/history", requireAuth, async (req,res)=>{
  const {data,error}=await supabase.from("content_history").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false}).limit(50);
  if(error) return res.status(500).json({error:error.message});
  res.json({ok:true,history:data||[]});
});

brainRouter.post("/save", requireAuth, async (req,res)=>{
  const {type,niche,platform,prompt,result,favorite=false}=req.body||{};
  const {data,error}=await supabase.from("content_history").insert({
    id:crypto.randomUUID(),user_id:req.user.id,type:type||"content",niche:niche||"",platform:platform||"",
    prompt:prompt||"",result:result||{},favorite,created_at:new Date().toISOString()
  }).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({ok:true,item:data});
});

brainRouter.post("/favorite/:id", requireAuth, async (req,res)=>{
  const {data,error}=await supabase.from("content_history").update({favorite:req.body?.favorite ?? true}).eq("id",req.params.id).eq("user_id",req.user.id).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({ok:true,item:data});
});

brainRouter.get("/profile", requireAuth, async (req,res)=>{
  const {data:history=[]}=await supabase.from("content_history").select("niche,platform,type,created_at,favorite").eq("user_id",req.user.id).order("created_at",{ascending:false}).limit(100);
  const niches={}, platforms={};
  for(const item of history||[]){
    if(item.niche) niches[item.niche]=(niches[item.niche]||0)+1;
    if(item.platform) platforms[item.platform]=(platforms[item.platform]||0)+1;
  }
  res.json({ok:true,profile:{
    total_generations:(history||[]).length,
    favorite_count:(history||[]).filter(x=>x.favorite).length,
    top_niches:Object.entries(niches).sort((a,b)=>b[1]-a[1]).slice(0,5),
    top_platforms:Object.entries(platforms).sort((a,b)=>b[1]-a[1]).slice(0,5),
    last_activity:(history||[])[0]?.created_at || null
  }});
});
