import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";

export const waitlistRouter = express.Router();

waitlistRouter.post("/join", async (req,res)=>{
  try{
    const { name, email, business } = req.body;

    if(!email){
      return res.status(400).json({ error:"Email obligatoire." });
    }

    if(!supabase){
      return res.status(500).json({ error:"Supabase non configuré." });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if(existing){
      return res.json({
        ok:true,
        exists:true,
        message:"Tu es déjà inscrit."
      });
    }

    const { error } = await supabase
      .from("waitlist")
      .insert({
        id: crypto.randomUUID(),
        name: name || "",
        email: cleanEmail,
        business: business || "",
        created_at: new Date().toISOString()
      });

    if(error){
      return res.status(500).json({ error:error.message });
    }

    res.json({
      ok:true,
      message:"Inscription réussie."
    });

  }catch(error){
    res.status(500).json({ error:error.message || "Erreur waitlist." });
  }
});
