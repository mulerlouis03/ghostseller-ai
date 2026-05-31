import express from "express";
import Stripe from "stripe";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const stripeLiveRouter = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const PLAN_CONFIG = {
  Starter:{ env:"STRIPE_PRICE_STARTER", credits:300, max_projects:5, max_posts:100, max_leads:100 },
  Pro:{ env:"STRIPE_PRICE_PRO", credits:1200, max_projects:25, max_posts:500, max_leads:500 },
  Agency:{ env:"STRIPE_PRICE_AGENCY", credits:5000, max_projects:100, max_posts:2500, max_leads:2500 }
};

function appUrl(){ return process.env.APP_URL || "https://ghostseller-ai.vercel.app"; }
function getPlan(plan){ return PLAN_CONFIG[plan] ? plan : "Pro"; }
function getPriceId(plan){ const p=getPlan(plan); return process.env[PLAN_CONFIG[p].env] || ""; }

async function logBilling({ user_id=null, email="", plan="", event_type="", payload={} }){
  try{ await supabase.from("billing_events").insert({ user_id,email,plan,event_type,payload,created_at:new Date().toISOString() }); }catch(_e){}
}

async function activatePlan({ email="", user_id=null, plan="Pro", customer_id="", subscription_id="", status="active" }){
  const p=getPlan(plan), cfg=PLAN_CONFIG[p];
  let q=supabase.from("users").update({
    plan:p, credits:cfg.credits, max_projects:cfg.max_projects, max_posts:cfg.max_posts, max_leads:cfg.max_leads,
    subscription_status:status, stripe_customer_id:customer_id, stripe_subscription_id:subscription_id, updated_at:new Date().toISOString()
  });
  q = user_id ? q.eq("id",user_id) : q.eq("email",email);
  const { data, error } = await q.select().maybeSingle();
  if(error) throw error;
  return data;
}

async function downgradeToFree({ email="", user_id=null, customer_id="", subscription_id="", status="canceled" }){
  let q=supabase.from("users").update({
    plan:"Free", credits:20, max_projects:1, max_posts:10, max_leads:10,
    subscription_status:status, stripe_customer_id:customer_id, stripe_subscription_id:subscription_id, updated_at:new Date().toISOString()
  });
  q = user_id ? q.eq("id",user_id) : q.eq("email",email);
  const { data, error } = await q.select().maybeSingle();
  if(error) throw error;
  return data;
}

stripeLiveRouter.get("/status", requireAuth, (req,res)=>{
  res.json({
    ok:true,
    stripe_configured:Boolean(stripe),
    webhook_configured:Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    app_url:appUrl(),
    current_plan:req.user.plan || "Free",
    subscription_status:req.user.subscription_status || "free",
    prices:{
      Starter:Boolean(process.env.STRIPE_PRICE_STARTER),
      Pro:Boolean(process.env.STRIPE_PRICE_PRO),
      Agency:Boolean(process.env.STRIPE_PRICE_AGENCY)
    }
  });
});

stripeLiveRouter.post("/checkout", requireAuth, async (req,res)=>{
  try{
    if(!stripe) return res.status(400).json({ error:"Stripe not configured. Add STRIPE_SECRET_KEY." });
    const plan=getPlan(req.body?.plan || "Pro");
    const price=getPriceId(plan);
    if(!price) return res.status(400).json({ error:`Missing Stripe price ID for ${plan}.`, required_env:PLAN_CONFIG[plan].env });
    const session=await stripe.checkout.sessions.create({
      mode:"subscription",
      customer_email:req.user.email,
      line_items:[{price, quantity:1}],
      success_url:`${appUrl()}/?billing=success&plan=${plan}`,
      cancel_url:`${appUrl()}/?billing=cancel&plan=${plan}`,
      metadata:{ user_id:req.user.id, email:req.user.email, plan },
      subscription_data:{ metadata:{ user_id:req.user.id, email:req.user.email, plan } }
    });
    await logBilling({ user_id:req.user.id,email:req.user.email,plan,event_type:"checkout_session_created",payload:{session_id:session.id} });
    res.json({ ok:true, url:session.url, session_id:session.id });
  }catch(error){ res.status(500).json({ error:error.message || "Stripe checkout failed." }); }
});

stripeLiveRouter.post("/portal", requireAuth, async (req,res)=>{
  try{
    if(!stripe) return res.status(400).json({ error:"Stripe not configured." });
    let customerId=req.user.stripe_customer_id;
    if(!customerId){
      const customer=await stripe.customers.create({ email:req.user.email, metadata:{ user_id:req.user.id } });
      customerId=customer.id;
      await supabase.from("users").update({ stripe_customer_id:customerId, updated_at:new Date().toISOString() }).eq("id",req.user.id);
    }
    const session=await stripe.billingPortal.sessions.create({ customer:customerId, return_url:`${appUrl()}/?billing=portal_return` });
    res.json({ ok:true, url:session.url });
  }catch(error){ res.status(500).json({ error:error.message || "Customer portal failed." }); }
});

stripeLiveRouter.get("/events", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")) return res.status(403).json({ error:"Owner/admin only." });
  const { data=[], error } = await supabase.from("billing_events").select("*").order("created_at",{ascending:false}).limit(100);
  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, events:data });
});

export async function handleStripeLiveEvent(event){
  const type=event.type, obj=event.data.object;
  if(type==="checkout.session.completed"){
    const email=obj.customer_email || obj.metadata?.email || "";
    const user_id=obj.metadata?.user_id || null;
    const plan=obj.metadata?.plan || "Pro";
    const user=await activatePlan({ email,user_id,plan,customer_id:obj.customer||"",subscription_id:obj.subscription||"",status:"active" });
    await logBilling({ user_id:user?.id || user_id,email,plan,event_type:type,payload:obj });
  }
  if(type==="customer.subscription.created" || type==="customer.subscription.updated"){
    const email=obj.metadata?.email || "", user_id=obj.metadata?.user_id || null, plan=obj.metadata?.plan || "Pro";
    if(email || user_id){
      const user=await activatePlan({ email,user_id,plan,customer_id:obj.customer||"",subscription_id:obj.id||"",status:obj.status||"active" });
      await logBilling({ user_id:user?.id || user_id,email,plan,event_type:type,payload:obj });
    }
  }
  if(type==="customer.subscription.deleted"){
    const email=obj.metadata?.email || "", user_id=obj.metadata?.user_id || null;
    const user=await downgradeToFree({ email,user_id,customer_id:obj.customer||"",subscription_id:obj.id||"",status:"canceled" });
    await logBilling({ user_id:user?.id || user_id,email,plan:"Free",event_type:type,payload:obj });
  }
  if(type==="invoice.payment_failed"){
    await logBilling({ email:obj.customer_email || "", plan:"", event_type:type, payload:obj });
  }
  return true;
}
