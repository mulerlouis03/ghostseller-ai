import express from "express";
import { supabase } from "../../lib/supabase.js";
import { requireAuth } from "../../lib/auth.js";

export const onboardingRouter = express.Router();

onboardingRouter.get("/status", requireAuth, async (req,res)=>{
  res.json({
    ok:true,
    onboarding_completed:Boolean(req.user.onboarding_completed),
    access_status:req.user.access_status || "approved",
    role:req.user.role || "user",
    plan:req.user.plan || "Free",
    credits:req.user.credits ?? 0
  });
});

onboardingRouter.post("/complete", requireAuth, async (req,res)=>{
  try{
    const { business_type, main_goal, main_platform } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({
        onboarding_completed:true,
        business_type: business_type || "",
        main_goal: main_goal || "",
        main_platform: main_platform || "",
        updated_at: new Date().toISOString()
      })
      .eq("id", req.user.id)
      .select()
      .single();

    if(error) return res.status(500).json({error:error.message});

    res.json({
      ok:true,
      user:data
    });
  }catch(error){
    res.status(500).json({error:error.message || "Erreur onboarding."});
  }
});
