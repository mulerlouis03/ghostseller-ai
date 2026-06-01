import express from "express";
import Stripe from "stripe";
import { handleStripeLiveEvent } from "../modules/stripeLive/routes.js";

export const stripeLiveWebhookRouter = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

stripeLiveWebhookRouter.post("/", express.raw({ type:"application/json" }), async (req,res)=>{
  try{
    if(!stripe) return res.status(400).json({ error:"Stripe not configured." });
    let event;
    const sig=req.headers["stripe-signature"];
    const secret=process.env.STRIPE_WEBHOOK_SECRET;
    if(secret && sig) event=stripe.webhooks.constructEvent(req.body, sig, secret);
    else event=JSON.parse(req.body.toString());
    await handleStripeLiveEvent(event);
    res.json({ received:true });
  }catch(error){
    console.error("[Stripe Live Webhook Error]", error.message);
    res.status(400).json({ error:error.message });
  }
});
