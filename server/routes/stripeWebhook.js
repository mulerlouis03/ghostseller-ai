import express from "express";
import Stripe from "stripe";
import { handleStripeEvent } from "../modules/revenue/routes.js";

export const stripeWebhookRouter = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

stripeWebhookRouter.post("/", express.raw({ type:"application/json" }), async (req,res)=>{
  try{
    if(!stripe){
      return res.status(400).json({ error:"Stripe not configured." });
    }

    let event;

    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if(webhookSecret && signature){
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    }else{
      event = JSON.parse(req.body.toString());
    }

    await handleStripeEvent(event);

    res.json({ received:true });
  }catch(error){
    console.error("[Stripe Webhook Error]", error.message);
    res.status(400).json({ error:error.message });
  }
});
