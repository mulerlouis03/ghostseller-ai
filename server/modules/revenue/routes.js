import express from "express";
import Stripe from "stripe";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { PRICING_PLANS, getPlanByName } from "../../config/pricing.js";

export const revenueRouter = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

function appUrl(){
  return process.env.APP_URL || "https://ghostseller-ai.vercel.app";
}

async function logBillingEvent({ user_id=null, email="", plan="", event_type="", payload={} }){
  try{
    await supabase.from("billing_events").insert({
      user_id,
      email,
      plan,
      event_type,
      payload,
      created_at:new Date().toISOString()
    });
  }catch(_e){}
}

function limitsForPlan(planName){
  const p = getPlanByName(planName);
  return {
    plan:p.name,
    credits:p.credits,
    max_projects:p.projects,
    max_posts:p.posts,
    max_leads:p.leads
  };
}

async function activatePlanByEmail(email, plan, extra={}){
  if(!email) return null;
  const limits = limitsForPlan(plan);

  const { data, error } = await supabase
    .from("users")
    .update({
      ...limits,
      subscription_status:extra.subscription_status || "active",
      stripe_customer_id:extra.stripe_customer_id || "",
      stripe_subscription_id:extra.stripe_subscription_id || "",
      updated_at:new Date().toISOString()
    })
    .eq("email", email)
    .select()
    .maybeSingle();

  if(error) throw error;
  return data;
}

revenueRouter.get("/status", requireAuth, async (req,res)=>{
  res.json({
    ok:true,
    stripe_configured:Boolean(stripe),
    webhook_configured:Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    plan:req.user.plan || "Free",
    subscription_status:req.user.subscription_status || "free",
    stripe_customer_id:req.user.stripe_customer_id || "",
    prices:{
      starter:Boolean(process.env.STRIPE_PRICE_STARTER),
      pro:Boolean(process.env.STRIPE_PRICE_PRO),
      agency:Boolean(process.env.STRIPE_PRICE_AGENCY)
    }
  });
});

revenueRouter.post("/checkout", requireAuth, async (req,res)=>{
  try{
    const { plan="Pro" } = req.body || {};
    const selected = getPlanByName(plan);

    if(selected.name === "Free"){
      return res.json({ ok:true, message:"Free plan does not require checkout." });
    }

    if(!stripe){
      return res.status(400).json({ error:"Stripe not configured. Add STRIPE_SECRET_KEY." });
    }

    if(!selected.stripe_price_id){
      return res.status(400).json({ error:`Missing Stripe price ID for ${selected.name}.` });
    }

    const session = await stripe.checkout.sessions.create({
      mode:"subscription",
      customer_email:req.user.email,
      line_items:[{ price:selected.stripe_price_id, quantity:1 }],
      success_url:`${appUrl()}/?billing=success&plan=${selected.name}`,
      cancel_url:`${appUrl()}/?billing=cancel`,
      metadata:{
        user_id:req.user.id,
        email:req.user.email,
        plan:selected.name
      },
      subscription_data:{
        metadata:{
          user_id:req.user.id,
          email:req.user.email,
          plan:selected.name
        }
      }
    });

    await logBillingEvent({
      user_id:req.user.id,
      email:req.user.email,
      plan:selected.name,
      event_type:"checkout_created",
      payload:{ session_id:session.id }
    });

    res.json({ ok:true, url:session.url, session_id:session.id });
  }catch(error){
    res.status(500).json({ error:error.message || "Checkout failed." });
  }
});

revenueRouter.post("/portal", requireAuth, async (req,res)=>{
  try{
    if(!stripe) return res.status(400).json({ error:"Stripe not configured." });

    let customerId = req.user.stripe_customer_id;

    if(!customerId){
      const customer = await stripe.customers.create({
        email:req.user.email,
        metadata:{ user_id:req.user.id }
      });
      customerId = customer.id;

      await supabase
        .from("users")
        .update({ stripe_customer_id:customerId, updated_at:new Date().toISOString() })
        .eq("id", req.user.id);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer:customerId,
      return_url:`${appUrl()}/?billing=portal_return`
    });

    res.json({ ok:true, url:session.url });
  }catch(error){
    res.status(500).json({ error:error.message || "Portal failed." });
  }
});

revenueRouter.post("/manual-activate", requireAuth, async (req,res)=>{
  try{
    if(!["owner","admin"].includes(req.user.role || "")){
      return res.status(403).json({ error:"Owner/admin only." });
    }

    const { email, plan="Pro" } = req.body || {};
    if(!email) return res.status(400).json({ error:"Email required." });

    const user = await activatePlanByEmail(email, plan, { subscription_status:"manual_active" });

    await logBillingEvent({
      user_id:user?.id || null,
      email,
      plan,
      event_type:"manual_activation",
      payload:{ activated_by:req.user.email }
    });

    res.json({ ok:true, user });
  }catch(error){
    res.status(500).json({ error:error.message || "Manual activation failed." });
  }
});

revenueRouter.get("/events", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Owner/admin only." });
  }

  const { data=[], error } = await supabase
    .from("billing_events")
    .select("*")
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, events:data });
});

export async function handleStripeEvent(event){
  const type = event.type;
  const obj = event.data.object;

  if(type === "checkout.session.completed"){
    const email = obj.customer_email || obj.metadata?.email;
    const plan = obj.metadata?.plan || "Pro";
    const user = await activatePlanByEmail(email, plan, {
      subscription_status:"active",
      stripe_customer_id:obj.customer || "",
      stripe_subscription_id:obj.subscription || ""
    });

    await logBillingEvent({
      user_id:user?.id || obj.metadata?.user_id || null,
      email,
      plan,
      event_type:type,
      payload:obj
    });
  }

  if(type === "customer.subscription.updated" || type === "customer.subscription.created"){
    const plan = obj.metadata?.plan || "Pro";
    const email = obj.metadata?.email || "";
    if(email){
      const user = await activatePlanByEmail(email, plan, {
        subscription_status:obj.status || "active",
        stripe_customer_id:obj.customer || "",
        stripe_subscription_id:obj.id || ""
      });

      await logBillingEvent({
        user_id:user?.id || obj.metadata?.user_id || null,
        email,
        plan,
        event_type:type,
        payload:obj
      });
    }
  }

  if(type === "customer.subscription.deleted"){
    const email = obj.metadata?.email || "";
    if(email){
      await activatePlanByEmail(email, "Free", {
        subscription_status:"canceled",
        stripe_customer_id:obj.customer || "",
        stripe_subscription_id:obj.id || ""
      });

      await logBillingEvent({
        email,
        plan:"Free",
        event_type:type,
        payload:obj
      });
    }
  }

  return true;
}
