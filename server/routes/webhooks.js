import express from "express";
import crypto from "crypto";
import { supabase } from "../lib/supabase.js";

export const webhooksRouter = express.Router();

webhooksRouter.post("/:source", async (req,res)=>{
  const { source } = req.params;

  const event = {
    id: crypto.randomUUID(),
    source,
    payload:req.body || {},
    headers:{
      user_agent:req.headers["user-agent"] || "",
      signature:req.headers["x-signature"] || req.headers["stripe-signature"] || ""
    },
    created_at:new Date().toISOString()
  };

  try{
    await supabase.from("webhook_events").insert(event);
  }catch(_e){}

  res.json({
    ok:true,
    received:true,
    source
  });
});

webhooksRouter.get("/ping/status", (req,res)=>{
  res.json({
    ok:true,
    webhookCenter:true
  });
});
