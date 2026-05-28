import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { openai } from "../../lib/openai.js";
import { requireAuth } from "../../lib/auth.js";
import { requireCredits, spendCredits } from "../../lib/plans.js";
export const autoCampaignRouter = express.Router();

autoCampaignRouter.get("/", requireAuth, async (req,res)=>{
 const {data,error}=await supabase.from("auto_campaigns").select("*").eq("user_id",req.user.id).order("created_at",{ascending:false});
 if(error) return res.status(500).json({error:error.message});
 res.json({campaigns:data||[]});
});

autoCampaignRouter.post("/build", requireAuth, requireCredits, async (req,res)=>{
 try{
  const {projectId,product,audience,offer,country,objective}=req.body;
  if(!projectId||!product) return res.status(400).json({error:"Projet et produit obligatoires."});
  const result=openai ? await aiAutopilot({product,audience,offer,country,objective}) : fallbackAutopilot({product,audience,offer});
  const {data,error}=await supabase.from("auto_campaigns").insert({
   id:crypto.randomUUID(),
   user_id:req.user.id,
   project_id:projectId,
   product,
   audience:audience||"",
   offer:offer||"",
   objective:objective||"",
   strategy:result.strategy,
   whatsapp_cta:result.whatsapp_cta,
   viral_score:result.viral_score,
   hooks:result.hooks,
   content_plan:result.content_plan
  }).select().single();
  if(error) return res.status(500).json({error:error.message});
  const remainingCredits=await spendCredits(supabase,req.user.id,10);
  res.json({campaign:data,remainingCredits});
 }catch(e){res.status(500).json({error:e.message||"Erreur Autopilot."});}
});

async function aiAutopilot({product,audience,offer,country,objective}){
 const prompt=`Tu es GhostSeller AI V33 Autopilot.
Crée une campagne automatique TikTok -> WhatsApp pour transformer l'attention en clients.
Produit: ${product}
Audience: ${audience||"grand public"}
Offre: ${offer||"non précisée"}
Pays/marché: ${country||"global"}
Objectif: ${objective||"générer des ventes WhatsApp"}

Retourne uniquement JSON valide:
{
 "strategy":"",
 "whatsapp_cta":"",
 "viral_score":88,
 "hooks":[""],
 "content_plan":[
  {"day":"Jour 1","video":"","hook":"","caption":"","cta":"","lead_action":""}
 ]
}

Règles:
- plan sur 7 jours
- hooks forts
- chaque jour doit pousser vers WhatsApp
- français simple
- aucun texte hors JSON`;
 const completion=await openai.chat.completions.create({
  model:"gpt-4.1-mini",
  messages:[{role:"system",content:"JSON uniquement."},{role:"user",content:prompt}],
  temperature:.85
 });
 return JSON.parse(completion.choices[0].message.content);
}

function fallbackAutopilot({product,audience,offer}){
 return {
  strategy:`Publier 7 vidéos courtes autour de ${product}, capter commentaires puis envoyer vers WhatsApp.`,
  whatsapp_cta:"Écris INFO sur WhatsApp maintenant.",
  viral_score:86,
  hooks:[
   `Tu dois voir ça avant d'acheter ${product}`,
   `Si tu fais partie de ${audience||"cette audience"}, regarde ça`,
   `${offer||"Cette offre"} peut t'aider aujourd'hui`
  ],
  content_plan:Array.from({length:7}).map((_,i)=>({
   day:`Jour ${i+1}`,
   video:`Vidéo ${i+1}: problème client + ${product} comme solution`,
   hook:`Tu connais ce problème avec ${product} ?`,
   caption:`${product} disponible. Écris INFO sur WhatsApp.`,
   cta:"Écris INFO",
   lead_action:"Répondre vite, qualifier le client, pousser au paiement"
  }))
 };
}
