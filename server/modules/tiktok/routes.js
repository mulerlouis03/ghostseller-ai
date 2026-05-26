import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { openai } from "../../lib/openai.js";
import { requireAuth } from "../../lib/auth.js";

export const tiktokRouter = express.Router();

tiktokRouter.get("/", (req, res) => {
  res.json({ module: "tiktok", status: "ready", version: "V30" });
});

tiktokRouter.post("/generate", requireAuth, async (req, res) => {
  try {
    const { projectId, product, audience, offer, days, style } = req.body;

    if (!projectId || !product) {
      return res.status(400).json({ error: "Projet et produit obligatoires." });
    }

    const count = Number(days) || 7;
    const generated = openai
      ? await aiTikTokPosts({ product, audience, offer, days: count, style })
      : fallbackPosts({ product, audience, offer, days: count, style });

    const rows = generated.posts.map((p) => ({
      id: crypto.randomUUID(),
      user_id: req.user.id,
      project_id: projectId,
      product,
      date: p.date || "",
      time: p.time || "",
      title: p.title || "",
      hook: p.hook || "",
      caption: p.caption || "",
      script: p.script || "",
      hashtags: p.hashtags || "",
      status: "à publier"
    }));

    const { data, error } = await supabase.from("posts").insert(rows).select();
    if (error) return res.status(500).json({ error: error.message });

    await supabase.from("campaigns").insert({
      id: crypto.randomUUID(),
      user_id: req.user.id,
      project_id: projectId,
      product,
      type: "TikTok Engine V30",
      count: data.length
    });

    res.json({ posts: data });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur TikTok Engine." });
  }
});

async function aiTikTokPosts(p) {
  const prompt = `Tu es GhostSeller AI V30, expert TikTok vente.
Crée ${p.days} posts TikTok pour vendre :
Produit: ${p.product}
Audience: ${p.audience || "grand public"}
Offre: ${p.offer || "non précisée"}
Style: ${p.style || "viral vendeur"}
Objectif: transformer vues TikTok en messages WhatsApp.

Retourne uniquement JSON valide :
{
 "posts":[
  {
   "date":"Jour 1",
   "time":"18:30",
   "title":"",
   "hook":"",
   "caption":"",
   "script":"",
   "hashtags":""
  }
 ]
}

Règles:
- Hook très fort dès les 2 premières secondes
- Script scène par scène
- Caption courte
- CTA WhatsApp clair
- Français simple
- Ne mets aucun texte hors JSON.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Réponds uniquement en JSON valide." },
      { role: "user", content: prompt }
    ],
    temperature: 0.85
  });

  return JSON.parse(completion.choices[0].message.content);
}

function fallbackPosts({ product, audience, offer, days, style }) {
  return {
    posts: Array.from({ length: days }).map((_, i) => ({
      date: `Jour ${i + 1}`,
      time: ["12:30", "18:00", "20:30"][i % 3],
      title: `Vidéo ${i + 1} - ${product}`,
      hook: `Tu dois voir ça avant d'acheter ${product}`,
      caption: `${product} disponible. ${offer || ""} Écris INFO sur WhatsApp.`,
      script: `Scène 1: montre le problème.\nScène 2: présente ${product}.\nScène 3: montre le bénéfice pour ${audience || "le client"}.\nScène 4: affiche ${offer || "l'offre"}.\nScène 5: CTA WhatsApp: écris INFO.`,
      hashtags: `#viral #tiktokbusiness #whatsapp #vente #${String(product).replaceAll(" ", "")}`
    }))
  };
}
