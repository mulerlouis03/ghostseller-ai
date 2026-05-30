import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";

export const feedbackRouter = express.Router();

feedbackRouter.post("/", async (req,res)=>{
  const { name="", email="", rating="Retour général", message="", page="dashboard" } = req.body || {};

  if(!message || String(message).trim().length < 3){
    return res.status(400).json({ error:"Merci d'écrire un petit message avant d'envoyer." });
  }

  const payload = {
    id: crypto.randomUUID(),
    name,
    email,
    rating,
    message,
    page,
    created_at:new Date().toISOString()
  };

  try{
    const { error } = await supabase.from("feedback").insert(payload);
    if(error) throw error;
    return res.json({ ok:true, saved:true, destination:"supabase.feedback" });
  }catch(error){
    console.error("Feedback save failed:", error?.message || error);
    return res.json({
      ok:true,
      saved:false,
      fallback:true,
      message:"Retour reçu côté application. La table feedback doit être vérifiée dans Supabase.",
      feedback:payload
    });
  }
});
