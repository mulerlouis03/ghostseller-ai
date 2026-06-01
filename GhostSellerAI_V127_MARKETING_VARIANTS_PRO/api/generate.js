import OpenAI from 'openai';

const MODEL = 'gpt-4o-mini';

function localFallback(offer = '', mode = 'standard') {
  const product = offer || 'ton offre';
  const angles = {
    variants: ['Urgence', 'Jeunes', 'Lifestyle', 'Promo', 'Preuve sociale'],
    viral: ['POV TikTok', 'Avant/Après', 'Erreur à éviter', 'Top 3', 'Réaction client'],
    emotion: ['Désir', 'Confiance', 'Fierté', 'Soulagement', 'Appartenance'],
    premium: ['Luxe', 'Élégance', 'Sélection', 'Exclusivité', 'Qualité'],
    promo: ['Réduction', 'Stock limité', 'Pack', 'Offre du jour', 'Dernière chance'],
    storytelling: ['Problème', 'Découverte', 'Transformation', 'Résultat', 'Invitation']
  };
  const chosen = angles[mode] || angles.variants;
  return {
    title: `Pack ${mode} prêt à publier`,
    facebook: chosen.map((a, i) => `#${i + 1} ${a}\n${product}\n👉 Découvre maintenant. Écris "INFO" pour recevoir les détails.`).join('\n\n'),
    instagram: chosen.map((a, i) => `${a} ✨\n${product}\nDM "INFO" pour les détails.\n#business #offre #marketing`).join('\n\n'),
    tiktok: chosen.map((a, i) => `VIDÉO ${i + 1} — ${a}\nSCÈNE 1: accroche forte\nSCÈNE 2: montre le produit\nSCÈNE 3: bénéfice clair\nSCÈNE 4: preuve ou urgence\nSCÈNE 5: CTA: commente INFO`).join('\n\n'),
    whatsapp: chosen.map((a, i) => `${a}: Bonjour 👋\nJe te partage cette offre: ${product}\nRéponds INFO pour recevoir les détails.`).join('\n\n'),
    hooks: Array.from({ length: 20 }, (_, i) => `${i + 1}. Tu cherches ${product} ? Regarde ça.`).join('\n'),
    ctas: Array.from({ length: 10 }, (_, i) => `${i + 1}. Écris INFO maintenant.`).join('\n'),
    hashtags: '#offre #promo #tiktokfrance #shopping #bonplan #marketing #viral #nouveaute #style #vente'
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { offer, mode = 'standard' } = req.body || {};
    if (!offer || offer.trim().length < 5) return res.status(400).json({ error: 'Décris une offre plus précise.' });

    if (!process.env.OPENAI_API_KEY) return res.status(200).json(localFallback(offer, mode));

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Tu es GhostSeller AI, un marketeur senior francophone. L'utilisateur donne une offre. Génère du contenu prêt à publier, pas des conseils. Mode demandé: ${mode}.

OFFRE: ${offer}

Réponds uniquement en JSON valide avec ces clés: title, facebook, instagram, tiktok, whatsapp, hooks, ctas, hashtags.
Contraintes:
- Facebook: 5 variantes prêtes à publier.
- Instagram: 5 légendes avec DM et hashtags courts.
- TikTok: 5 scripts vidéo de 5 scènes, style viral, sans blabla.
- WhatsApp: 5 messages courts prêts à envoyer.
- hooks: 20 hooks.
- ctas: 10 appels à l'action.
- hashtags: 30 hashtags.
- Ne donne pas d'explication, seulement le JSON.`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.9
    });

    const text = completion.choices?.[0]?.message?.content || '{}';
    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(200).json(localFallback(req.body?.offer, req.body?.mode));
  }
}
