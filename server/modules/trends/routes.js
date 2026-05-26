import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { openai } from "../../lib/openai.js";
import { requireAuth } from "../../lib/auth.js";

export const trendsRouter = express.Router();

trendsRouter.get("/", (req, res) => res.json({ module: "trends", status: "ready", version: "V31" }));

trendsRouter.post("/scan", requireAuth, async (req, res) => {
  try {
    const { niche, country, audience, goal } = req.body;
    if (!niche) return res.status(400).json({ error: "Niche obligatoire." });

    const result = openai
      ? await aiTrendScan({ niche, country, audience, goal })
      : fallbackTrends({ niche, audience });

    const rows = result.trends.map((t) => ({
      id: crypto.randomUUID(),
      user_id: req.user.id,
      niche,
      country: country || "",
      goal: goal || "",
      title: t.title || "",
      reason: t.reason || "",
      hashtags: t.hashtags || "",
      viral_score: Number(t.viral_score) || 75,
      content_angle: t.content_angle || "",
      cta: t.cta || ""
    }));

    const { data, error } = await supabase.from("trends").insert(rows).select();
    if (error) return res.status(500).json({ error: error.message });

    res.json({ trends: data });
  } catch (error) {
    res.status(500).json({ error: error.message || "Erreur Trend Scanner." });
  }
});

async function aiTrendScan(p) {
  const prompt = `Tu es GhostSeller AI V31. Analyse cette niche TikTok et propose 7 tendances exploitables pour générer des clients WhatsApp.
Niche: ${p.niche}
Pays: ${p.country || "global"}
Audience: ${p.audience || "grand public"}
Objectif: ${p.goal || "leads WhatsApp"}
Retourne uniquement JSON valide:
{"trends":[{"title":"","reason":"","hashtags":"","viral_score":85,"content_angle":"","cta":""}]}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: "Réponds uniquement en JSON valide." },
      { role: "user", content: prompt }
    ],
    temperature: 0.8
  });

  return JSON.parse(completion.choices[0].message.content);
}

function fallbackTrends({ niche, audience }) {
  return {
    trends: Array.from({ length: 7 }).map((_, i) => ({
      title: `Tendance ${i + 1} - ${niche}`,
      reason: `Sujet facile à transformer en vidéo courte pour ${audience || "ton audience"}.`,
      hashtags: `#viral #tiktokbusiness #whatsapp #${String(niche).replaceAll(" ", "")}`,
      viral_score: 76 + i * 3,
      content_angle: `Montrer un problème réel puis présenter ${niche} comme solution rapide.`,
      cta: "Écris INFO sur WhatsApp pour recevoir les détails."
    }))
  };
}
