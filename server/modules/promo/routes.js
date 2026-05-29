import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const promoRouter = express.Router();

promoRouter.get("/list", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, promo_codes:data });
});

promoRouter.post("/create", requireAuth, async (req,res)=>{
  try{
    if(!["owner","admin"].includes(req.user.role || "")){
      return res.status(403).json({ error:"Owner/admin only." });
    }

    const {
      code=`GHOST-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      credits=100,
      plan_bonus="",
      max_uses=100
    } = req.body || {};

    const { data, error } = await supabase
      .from("promo_codes")
      .insert({
        id:crypto.randomUUID(),
        code:String(code).toUpperCase(),
        credits:Number(credits),
        plan_bonus,
        max_uses:Number(max_uses),
        used_count:0,
        active:true,
        created_at:new Date().toISOString()
      })
      .select()
      .single();

    if(error) return res.status(500).json({ error:error.message });
    res.json({ ok:true, promo:data });
  }catch(error){
    res.status(500).json({ error:error.message || "Promo create failed." });
  }
});

promoRouter.post("/redeem", requireAuth, async (req,res)=>{
  try{
    const { code="" } = req.body || {};
    const normalized = String(code).toUpperCase().trim();

    const { data:promo, error } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", normalized)
      .eq("active", true)
      .maybeSingle();

    if(error) return res.status(500).json({ error:error.message });
    if(!promo) return res.status(404).json({ error:"Promo code not found." });

    if((promo.used_count || 0) >= (promo.max_uses || 0)){
      return res.status(400).json({ error:"Promo code limit reached." });
    }

    const { data:already } = await supabase
      .from("promo_redemptions")
      .select("id")
      .eq("promo_code", normalized)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if(already){
      return res.status(400).json({ error:"Promo already redeemed." });
    }

    await supabase.from("promo_redemptions").insert({
      id:crypto.randomUUID(),
      promo_code:normalized,
      user_id:req.user.id,
      email:req.user.email,
      credits:promo.credits || 0,
      created_at:new Date().toISOString()
    });

    await supabase
      .from("promo_codes")
      .update({
        used_count:(promo.used_count || 0) + 1,
        updated_at:new Date().toISOString()
      })
      .eq("id", promo.id);

    try{
      const { data:user } = await supabase
        .from("users")
        .select("credits")
        .eq("id", req.user.id)
        .maybeSingle();

      await supabase
        .from("users")
        .update({
          credits:(user?.credits || 0) + (promo.credits || 0),
          updated_at:new Date().toISOString()
        })
        .eq("id", req.user.id);
    }catch(_e){}

    res.json({
      ok:true,
      redeemed:true,
      credits_added:promo.credits || 0
    });
  }catch(error){
    res.status(500).json({ error:error.message || "Promo redeem failed." });
  }
});
