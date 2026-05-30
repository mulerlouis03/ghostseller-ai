import express from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { supabase } from "../../lib/supabase.js";

export const feedbackRouter = express.Router();

// Important: this makes /api/feedback work even if server.js middleware order changes.
feedbackRouter.use(express.json({ limit:"1mb" }));

function saveLocal(payload){
  try{
    const dir = path.join(process.cwd(), "tmp");
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive:true });
    fs.appendFileSync(path.join(dir, "feedback.log"), JSON.stringify(payload) + "\n", "utf8");
  }catch(e){}
}

feedbackRouter.post("/", async (req,res)=>{
  const body = req.body || {};
  const { name="", email="", rating="Retour général", message="", page="dashboard" } = body;

  if(!message || String(message).trim().length < 1){
    return res.status(400).json({
      ok:false,
      error:"Écris ton retour avant d'envoyer.",
      receivedBody:body
    });
  }

  const payload = {
    id: crypto.randomUUID(),
    name,
    email,
    rating,
    message:String(message).trim(),
    page,
    created_at:new Date().toISOString()
  };

  saveLocal(payload);

  try{
    const { error } = await supabase.from("feedback").insert(payload);
    if(error) throw error;
    return res.json({ ok:true, saved:true, destination:"supabase.feedback" });
  }catch(error){
    console.error("Feedback Supabase save failed:", error?.message || error);
    return res.json({
      ok:true,
      saved:true,
      fallback:true,
      destination:"server-log",
      message:"Retour reçu côté application. Vérifie Supabase pour la sauvegarde définitive.",
      feedback:payload
    });
  }
});
