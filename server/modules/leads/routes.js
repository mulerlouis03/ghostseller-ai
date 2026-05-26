import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { openai } from "../../lib/openai.js";
import { requireAuth } from "../../lib/auth.js";
export const leadsRouter = express.Router();

leadsRouter.get("/", requireAuth, async (req,res)=>{
 const {data,error}=await supabase.from("leads").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false});
 if(error) return res.status(500).json({error:error.message});
 res.json({leads:data||[]});
});

leadsRouter.post("/", requireAuth, async (req,res)=>{
 try{
  const {projectId,name,phone,product,message}=req.body;
  if(!projectId||!name||!message) return res.status(400).json({error:"Projet, nom et message obligatoires."});
  const reply=openai ? await aiReply({name,product,message}) : `Bonjour ${name}, oui ${product||"le produit"} est disponible. Tu veux les détails maintenant ?`;
  const {data,error}=await supabase.from("leads").insert({
   id:crypto.randomUUID(), user_id:req.user.id, project_id:projectId, name, phone:phone||"",
   product:product||"", message, reply, status:"nouveau"
  }).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({lead:data});
 }catch(e){res.status(500).json({error:e.message||"Erreur WhatsApp Leads."});}
});

leadsRouter.patch("/:id", requireAuth, async (req,res)=>{
 const {data,error}=await supabase.from("leads").update({status:req.body.status,updated_at:new Date().toISOString()}).eq("id",req.params.id).eq("user_id",req.user.id).select().single();
 if(error) return res.status(500).json({error:error.message});
 res.json({lead:data});
});

async function aiReply({name,product,message}){
 const prompt=`Réponds comme vendeur WhatsApp expert. Client:${name}. Produit:${product||"non précisé"}. Message:${message}. Réponse courte, naturelle, convaincante, en français simple, maximum 2 phrases.`;
 const completion=await openai.chat.completions.create({
  model:"gpt-4.1-mini",
  messages:[{role:"system",content:"Réponse WhatsApp uniquement."},{role:"user",content:prompt}],
  temperature:.75
 });
 return completion.choices[0].message.content;
}
