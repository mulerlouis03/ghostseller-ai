import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";

export const acquisitionRouter = express.Router();

acquisitionRouter.post("/waitlist", async (req,res)=>{
  try{
    const {
      email="",
      source="organic",
      referral_code=""
    } = req.body || {};

    const item = {
      id:crypto.randomUUID(),
      email,
      source,
      referral_code,
      created_at:new Date().toISOString()
    };

    try{
      await supabase.from("waitlist").insert(item);
    }catch(_e){}

    res.json({
      ok:true,
      message:"Added to waitlist",
      referral_link:`https://ghostseller-ai.vercel.app/?ref=${item.id.slice(0,8)}`
    });

  }catch(error){
    res.status(500).json({ error:error.message });
  }
});

acquisitionRouter.get("/stats", async (_req,res)=>{
  let total_waitlist = 0;

  try{
    const { count } = await supabase
      .from("waitlist")
      .select("*",{ count:"exact", head:true });

    total_waitlist = count || 0;
  }catch(_e){}

  res.json({
    ok:true,
    stats:{
      total_waitlist,
      conversion_system:true,
      referral_system:true,
      onboarding_active:true,
      growth_mode:"tiktok-first"
    }
  });
});

acquisitionRouter.get("/plans", (_req,res)=>{
  res.json({
    ok:true,
    plans:[
      {
        name:"Starter",
        price:0,
        limit:"3 generations/day"
      },
      {
        name:"Creator",
        price:19,
        limit:"Unlimited TikTok campaigns"
      },
      {
        name:"Agency",
        price:79,
        limit:"Multi-client AI growth system"
      }
    ]
  });
});
