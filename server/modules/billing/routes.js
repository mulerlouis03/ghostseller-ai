import express from "express";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, safeUser } from "../../lib/auth.js";
import { stripe, APP_URL } from "../../lib/stripe.js";

export const billingRouter = express.Router();

const PLANS = {
  Free: { name:"Free", price:"0€", credits:20, description:"Pour tester GhostSeller." },
  Starter: { name:"Starter", price:"9,99€/mois", credits:300, description:"Prix lancement TikTok/WhatsApp.", priceId:process.env.STRIPE_STARTER_PRICE_ID },
  Pro: { name:"Pro", price:"29€/mois", credits:1200, description:"Pour boutiques et agences.", priceId:process.env.STRIPE_PRO_PRICE_ID }
};

billingRouter.get("/plans", requireAuth, (req,res)=>{
  res.json({ plans:PLANS, currentPlan:req.user.plan||"Free", credits:req.user.credits??20, stripeConfigured:Boolean(stripe) });
});

billingRouter.post("/checkout", requireAuth, async (req,res)=>{
  try{
    const { plan } = req.body;
    if(!["Starter","Pro"].includes(plan)) return res.status(400).json({error:"Plan invalide."});
    const selected = PLANS[plan];

    if(!stripe || !selected.priceId){
      return res.status(400).json({error:"Stripe non configuré. Ajoute STRIPE_SECRET_KEY + STRIPE_STARTER_PRICE_ID + STRIPE_PRO_PRICE_ID dans Vercel."});
    }

    let customerId = req.user.stripe_customer_id;

    if(!customerId){
      const customer = await stripe.customers.create({
        email:req.user.email,
        name:req.user.name,
        metadata:{userId:req.user.id}
      });
      customerId = customer.id;
      await supabase.from("users").update({stripe_customer_id:customerId}).eq("id",req.user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode:"subscription",
      customer:customerId,
      line_items:[{price:selected.priceId, quantity:1}],
      success_url:`${APP_URL}?billing=success`,
      cancel_url:`${APP_URL}?billing=cancel`,
      metadata:{userId:req.user.id, plan}
    });

    res.json({url:session.url});
  }catch(error){
    res.status(500).json({error:error.message || "Erreur Stripe."});
  }
});

billingRouter.post("/demo-upgrade", requireAuth, async (req,res)=>{
  const { plan } = req.body;
  if(!["Free","Starter","Pro"].includes(plan)) return res.status(400).json({error:"Plan invalide."});
  const credits = plan==="Pro" ? 1200 : plan==="Starter" ? 300 : 20;

  const {data,error} = await supabase
    .from("users")
    .update({plan,credits})
    .eq("id",req.user.id)
    .select()
    .single();

  if(error) return res.status(500).json({error:error.message});
  res.json({user:safeUser(data), message:`Plan passé en ${plan}.`});
});
