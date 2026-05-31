import express from "express";
import crypto from "crypto";
import Stripe from "stripe";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const stripeBillingRouter = express.Router();

function appUrl(){
  return process.env.APP_URL || "https://ghostseller-ai.vercel.app";
}

function getStripe(){
  const key = process.env.STRIPE_SECRET_KEY || "";
  if(!key) return null;
  return new Stripe(key, { apiVersion:"2024-06-20" });
}

const PLANS = {
  starter:{
    key:"starter",
    name:"Starter",
    price:9.99,
    priceIdEnv:"STRIPE_PRICE_STARTER",
    credits:300,
    posts:100,
    leads:50,
    projects:5
  },
  pro:{
    key:"pro",
    name:"Pro",
    price:29.99,
    priceIdEnv:"STRIPE_PRICE_PRO",
    credits:1500,
    posts:500,
    leads:250,
    projects:25
  },
  agency:{
    key:"agency",
    name:"Agency",
    price:79.99,
    priceIdEnv:"STRIPE_PRICE_AGENCY",
    credits:5000,
    posts:2000,
    leads:1000,
    projects:100
  }
};

function publicPlans(){
  return Object.values(PLANS).map(p=>({
    key:p.key,
    name:p.name,
    price:p.price,
    credits:p.credits,
    posts:p.posts,
    leads:p.leads,
    projects:p.projects,
    configured:Boolean(process.env[p.priceIdEnv])
  }));
}

async function getBillingProfile(user){
  const { data } = await supabase
    .from("billing_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}

async function upsertBillingProfile(user, patch){
  const payload = {
    user_id:user.id,
    email:user.email || "",
    updated_at:new Date().toISOString(),
    ...patch
  };

  const { data, error } = await supabase
    .from("billing_profiles")
    .upsert(payload, { onConflict:"user_id" })
    .select()
    .single();

  if(error) throw error;
  return data;
}

stripeBillingRouter.get("/plans", (_req,res)=>{
  res.json({ ok:true, plans:publicPlans() });
});

stripeBillingRouter.get("/status", requireAuth, async (req,res)=>{
  try{
    const profile = await getBillingProfile(req.user);

    res.json({
      ok:true,
      stripeConfigured:Boolean(process.env.STRIPE_SECRET_KEY),
      customerPortalConfigured:Boolean(process.env.STRIPE_SECRET_KEY),
      profile:profile || {
        plan:"free",
        status:"inactive",
        credits:0,
        posts_limit:0,
        leads_limit:0,
        projects_limit:0
      },
      plans:publicPlans()
    });
  }catch(error){
    res.status(500).json({ error:error.message || "Billing status failed." });
  }
});

stripeBillingRouter.post("/checkout", requireAuth, async (req,res)=>{
  try{
    const stripe = getStripe();
    if(!stripe){
      return res.status(400).json({ error:"Stripe not configured. Missing STRIPE_SECRET_KEY." });
    }

    const { plan="starter" } = req.body || {};
    const selected = PLANS[plan];

    if(!selected){
      return res.status(400).json({ error:"Invalid plan." });
    }

    const priceId = process.env[selected.priceIdEnv];
    if(!priceId){
      return res.status(400).json({
        error:`Missing Stripe price ID for ${selected.name}.`,
        missing:selected.priceIdEnv
      });
    }

    let profile = await getBillingProfile(req.user);
    let customerId = profile?.stripe_customer_id || "";

    if(!customerId){
      const customer = await stripe.customers.create({
        email:req.user.email || undefined,
        metadata:{ user_id:req.user.id }
      });
      customerId = customer.id;
      profile = await upsertBillingProfile(req.user, {
        stripe_customer_id:customerId,
        plan:profile?.plan || "free",
        status:profile?.status || "inactive"
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode:"subscription",
      customer:customerId,
      line_items:[{ price:priceId, quantity:1 }],
      success_url:`${appUrl()}/?billing=success&plan=${selected.key}`,
      cancel_url:`${appUrl()}/?billing=cancelled`,
      metadata:{
        user_id:req.user.id,
        plan:selected.key
      },
      subscription_data:{
        metadata:{
          user_id:req.user.id,
          plan:selected.key
        }
      }
    });

    await supabase.from("billing_events").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      event_type:"checkout_created",
      plan:selected.key,
      stripe_id:session.id,
      payload:{ url:session.url },
      created_at:new Date().toISOString()
    });

    res.json({ ok:true, url:session.url, session_id:session.id });
  }catch(error){
    res.status(500).json({ error:error.message || "Checkout failed." });
  }
});

stripeBillingRouter.post("/portal", requireAuth, async (req,res)=>{
  try{
    const stripe = getStripe();
    if(!stripe){
      return res.status(400).json({ error:"Stripe not configured. Missing STRIPE_SECRET_KEY." });
    }

    const profile = await getBillingProfile(req.user);
    if(!profile?.stripe_customer_id){
      return res.status(400).json({ error:"No Stripe customer found. Create checkout first." });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer:profile.stripe_customer_id,
      return_url:`${appUrl()}/?billing=portal-return`
    });

    res.json({ ok:true, url:portal.url });
  }catch(error){
    res.status(500).json({ error:error.message || "Portal failed." });
  }
});

stripeBillingRouter.post("/webhook", express.raw({ type:"application/json" }), async (req,res)=>{
  const stripe = getStripe();
  if(!stripe){
    return res.status(400).send("Stripe not configured.");
  }

  const signature = req.headers["stripe-signature"];
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";

  let event;

  try{
    if(secret){
      event = stripe.webhooks.constructEvent(req.body, signature, secret);
    }else{
      event = JSON.parse(req.body.toString());
    }
  }catch(error){
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  try{
    const type = event.type;
    const obj = event.data?.object || {};

    let userId =
      obj.metadata?.user_id ||
      obj.subscription_details?.metadata?.user_id ||
      "";

    let plan =
      obj.metadata?.plan ||
      obj.subscription_details?.metadata?.plan ||
      "unknown";

    if(type === "checkout.session.completed"){
      const customerId = obj.customer || "";
      const subscriptionId = obj.subscription || "";

      await supabase.from("billing_profiles").upsert({
        user_id:userId,
        email:obj.customer_details?.email || "",
        stripe_customer_id:customerId,
        stripe_subscription_id:subscriptionId,
        plan,
        status:"active",
        credits:PLANS[plan]?.credits || 0,
        posts_limit:PLANS[plan]?.posts || 0,
        leads_limit:PLANS[plan]?.leads || 0,
        projects_limit:PLANS[plan]?.projects || 0,
        updated_at:new Date().toISOString()
      }, { onConflict:"user_id" });
    }

    if(type === "customer.subscription.updated" || type === "customer.subscription.deleted"){
      const subscriptionId = obj.id || "";
      const status = obj.status || "unknown";
      plan = obj.metadata?.plan || plan;

      const patch = {
        stripe_subscription_id:subscriptionId,
        status,
        plan,
        updated_at:new Date().toISOString()
      };

      if(PLANS[plan]){
        patch.credits = PLANS[plan].credits;
        patch.posts_limit = PLANS[plan].posts;
        patch.leads_limit = PLANS[plan].leads;
        patch.projects_limit = PLANS[plan].projects;
      }

      if(userId){
        await supabase.from("billing_profiles").upsert({
          user_id:userId,
          ...patch
        }, { onConflict:"user_id" });
      }else{
        await supabase.from("billing_profiles")
          .update(patch)
          .eq("stripe_subscription_id", subscriptionId);
      }
    }

    await supabase.from("billing_events").insert({
      id:crypto.randomUUID(),
      user_id:userId || null,
      event_type:type,
      plan,
      stripe_id:event.id,
      payload:event,
      created_at:new Date().toISOString()
    });

    res.json({ received:true });
  }catch(error){
    res.status(500).json({ error:error.message || "Webhook processing failed." });
  }
});
