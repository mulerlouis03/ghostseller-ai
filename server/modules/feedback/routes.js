import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
export const feedbackRouter = express.Router();

feedbackRouter.post("/", async (req,res)=>{
  try{
    const { name="", email="", rating="Retour général", message="", page="dashboard" } = req.body || {};
    if(!message || String(message).trim().length < 3) return res.status(400).json({ error:"Message required." });
    const payload = { id:crypto.randomUUID(), name, email, rating, message, page, created_at:new Date().toISOString() };
    const { error } = await supabase.from("feedback").insert(payload);
    if(error) throw error;
    res.json({ ok:true, saved:true });
  }catch(error){ res.status(500).json({ error:error.message || "Feedback failed." }); }
});
