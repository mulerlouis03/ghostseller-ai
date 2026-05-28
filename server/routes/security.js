import express from "express";
import { requireAuth, requireOwner } from "../lib/auth.js";

export const securityRouter = express.Router();

securityRouter.get("/status", requireAuth, (req,res)=>{
  res.json({
    ok:true,
    user:req.user.email,
    role:req.user.role || "user",
    owner:(req.user.role || "user") === "owner",
    production: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    checks:{
      auth:true,
      rateLimit:true,
      securityHeaders:true,
      stripeWebhook:Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      jwtSecret:Boolean(process.env.JWT_SECRET),
      supabase:Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
    }
  });
});

securityRouter.get("/owner", requireAuth, requireOwner, (req,res)=>{
  res.json({
    ok:true,
    message:"Accès propriétaire confirmé.",
    owner:req.user.email
  });
});
