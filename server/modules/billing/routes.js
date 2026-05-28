import express from "express";
import Stripe from "stripe";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { PRICING_PLANS, getPlanByName } from "../../config/pricing.js";

export const billingRouter = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

billingRouter.get("/plans", (_req,res)=>{
  res.json({
    ok:true,
    plans:Object.values(PRICING_PLANS).map(p=>({
      id:p.id,
      name:p.name,
      price:p.price,
      currency:p.currency,
      credits:p.credits,
      projects:p.projects,
      posts:p.posts,
      leads:p.leads,
      features:p.features,
      available:p.name === "Free" || Boolean(p.stripe_price_id)
    }))
  });
});

billingRouter.post("/checkout", requireAuth, async (req,res)=>{
  try{
    const { plan="Pro" } = req.body || {};
    const selected = getPlanByName(plan);

    if(selected.name === "Free"){
      return res.json({ ok:true, message:"Free plan does not need checkout." });
    }

    if(!stripe){
      return res.status(400).json({
        error:"Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs in Vercel."
      });
    }

    if(!selected.stripe_price_id){
      return res.status(400).json({
        error:`Stripe price ID missing for ${selected.name}.`
      });
    }

    const appUrl = process.env.APP_URL || "https://ghostseller-ai.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode:"subscription",
      customer_email:req.user.email,
      line_items:[{
        price:selected.stripe_price_id,
        quantity:1
      }],
      success_url:`${appUrl}/?billing=success&plan=${selected.name}`,
      cancel_url:`${appUrl}/?billing=cancel`,
      metadata:{
        user_id:req.user.id,
        email:req.user.email,
        plan:selected.name
      }
    });

    res.json({
      ok:true,
      url:session.url,
      session_id:session.id
    });
  }catch(error){
    res.status(500).json({ error:error.message || "Checkout failed." });
  }
});

billingRouter.post("/activate-manual", requireAuth, async (req,res)=>{
  try{
    const { plan="Pro" } = req.body || {};
    const selected = getPlanByName(plan);

    if(!["owner","admin"].includes(req.user.role)){
      return res.status(403).json({ error:"Owner/admin only." });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        plan:selected.name,
        credits:selected.credits,
        max_projects:selected.projects,
        max_posts:selected.posts,
        max_leads:selected.leads,
        updated_at:new Date().toISOString()
      })
      .eq("email", req.body.email || req.user.email)
      .select()
      .single();

    if(error) return res.status(500).json({ error:error.message });

    res.json({ ok:true, user:data });
  }catch(error){
    res.status(500).json({ error:error.message || "Plan activation failed." });
  }
});
