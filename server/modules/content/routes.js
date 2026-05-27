import express from "express";
import { openai } from "../../lib/openai.js";
import { requireAuth } from "../../lib/auth.js";

export const contentRouter = express.Router();

contentRouter.get("/", requireAuth, (req,res)=>{
  res.json({ module:"content", status:"ready", version:"V40" });
});

contentRouter.post("/generate", requireAuth, async (req,res)=>{
  try{
    const { niche, platform, tone, goal } = req.body;

    if(!niche){
      return res.status(400).json({ error:"Niche obligatoire." });
    }

    if(!openai){
      return res.json(fallbackContent({ niche, platform, tone, goal }));
    }

    const prompt = `Tu es GhostSeller AI V40, expert en contenu viral.
Génère un pack marketing prêt à poster.

Niche: ${niche}
Plateforme: ${platform || "TikTok/Instagram"}
Ton: ${tone || "viral"}
Objectif: ${goal || "attirer des leads WhatsApp"}

Retourne uniquement JSON valide:
{
 "hooks":[""],
 "captions":[""],
 "hashtags":[""],
 "scripts":[{"title":"","script":"","cta":""}],
 "instagram_post":"",
 "whatsapp_message":""
}

Règles:
- Français simple
- Hooks très forts
- CTA WhatsApp clair
- Adapté à une petite entreprise
- Aucun texte hors JSON`;

    const completion = await openai.chat.completions.create({
      model:"gpt-4.1-mini",
      messages:[
        { role:"system", content:"Réponds uniquement en JSON valide." },
        { role:"user", content:prompt }
      ],
      temperature:0.85
    });

    const text = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);

    res.json(parsed);
  }catch(error){
    res.status(500).json({ error:error.message || "Erreur AI Content Engine." });
  }
});

function fallbackContent({ niche, platform, tone, goal }) {
  return {
    hooks:[
      `Tu veux vendre plus avec ${niche} ?`,
      `3 erreurs qui empêchent ${niche} de décoller`,
      `Cette méthode transforme TikTok en clients WhatsApp`,
      `Si tu fais du business, regarde ça avant de poster`,
      `L'IA peut maintenant créer ton marketing en quelques secondes`
    ],
    captions:[
      `${niche} + IA = plus de contenu, plus vite, avec moins d'effort.`,
      `GhostSeller AI aide à transformer l'attention en clients WhatsApp.`,
      `Teste une campagne IA et vois ce que tu peux améliorer aujourd'hui.`
    ],
    hashtags:["#GhostSellerAI","#IA","#TikTokMarketing","#Business","#WhatsAppBusiness","#SaaS","#MarketingDigital"],
    scripts:[
      {
        title:`Vidéo TikTok pour ${niche}`,
        script:`Scène 1: montre le problème.\nScène 2: explique pourquoi les gens perdent du temps.\nScène 3: montre GhostSeller AI.\nScène 4: montre le résultat.\nScène 5: CTA vers WhatsApp ou lien.`,
        cta:"Clique sur le lien et teste GhostSeller AI."
      }
    ],
    instagram_post:`🚀 GhostSeller AI aide les entrepreneurs à créer du contenu pour ${niche}, générer des leads et automatiser leur marketing.`,
    whatsapp_message:`Salut, j'ai une solution IA qui peut t'aider avec ${niche}. Tu veux que je t'envoie les détails ?`
  };
}
