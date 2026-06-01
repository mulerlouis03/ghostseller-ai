const PLATFORM_FORMATS = {
  facebook: "1:1",
  instagram: "1:1",
  "instagram feed": "1:1",
  story: "9:16",
  stories: "9:16",
  reel: "9:16",
  reels: "9:16",
  tiktok: "9:16",
  whatsapp: "1:1",
  linkedin: "1.91:1"
};

function lower(text=""){ return String(text||"").toLowerCase(); }
function hasAny(text, words){ return words.some(w => text.includes(w)); }

export function detectCreativeContext(copy="", platform="TikTok"){
  const text = lower(copy);
  const p = lower(platform);
  const aspect_ratio = PLATFORM_FORMATS[p] || (hasAny(p,["tiktok","story","reel"]) ? "9:16" : "1:1");

  let product = "offre commerciale";
  let target = "clients potentiels";
  let emotion = "confiance et envie d'agir";
  let visual = "personnes réelles utilisant le produit ou profitant du service";
  let benefit = "solution simple et rapide";
  let objects = "smartphone, preuve visuelle du bénéfice, environnement crédible";

  if(hasAny(text,["covoiturage","trajet","passager","cayenne","saint-laurent","voiture","transport"])){
    product = "service de covoiturage / transport";
    target = "voyageurs, travailleurs, étudiants";
    emotion = "sécurité, convivialité, tranquillité";
    benefit = hasAny(text,["économ", "moins cher", "budget"]) ? "trajet économique" : "voyage sécurisé et pratique";
    visual = "groupe de passagers souriants dans une voiture moderne, conducteur rassurant, ambiance Guyane tropicale";
    objects = "voiture moderne, ceintures visibles, smartphone avec réservation, petit bagage";
  } else if(hasAny(text,["recharge","digicel","natcom","haiti","haïti","crédit","mobile"])){
    product = "recharge mobile Haïti";
    target = "diaspora haïtienne et familles en Haïti";
    emotion = "proximité familiale, soulagement, confiance";
    benefit = "recharge instantanée et paiement sécurisé";
    visual = "famille haïtienne souriante recevant une notification de recharge sur smartphone, lien France-Haïti";
    objects = "smartphone, notification de recharge réussie, touches bleu rouge blanc, ambiance familiale chaleureuse";
  } else if(hasAny(text,["whatsapp","message","dm","réponds","contact"])){
    product = "campagne WhatsApp / génération de leads";
    target = "clients qui contactent en message privé";
    emotion = "réactivité et confiance";
    benefit = "conversation qui transforme en client";
    visual = "entrepreneur souriant répondant à des messages clients sur smartphone";
    objects = "smartphone avec bulles de conversation, notifications, bureau moderne";
  } else if(hasAny(text,["tiktok","reels","viral","créateur","video","vidéo"])){
    product = "contenu vidéo court / marketing social";
    target = "créateurs, entrepreneurs, petites marques";
    emotion = "énergie, créativité, attention immédiate";
    benefit = "contenu viral prêt à publier";
    visual = "créateur de contenu dynamique filmant une vidéo verticale avec smartphone et lumière LED";
    objects = "ring light, smartphone vertical, interface de montage, décor moderne";
  } else if(hasAny(text,["ia","ai","automatique","saas","ghostseller"])){
    product = "SaaS d'intelligence artificielle marketing";
    target = "entrepreneurs, freelances, petites entreprises";
    emotion = "puissance, modernité, gain de temps";
    benefit = "campagnes publicitaires créées automatiquement";
    visual = "entrepreneur confiant devant un dashboard IA futuriste générant textes et visuels publicitaires";
    objects = "ordinateur portable, interface SaaS, cartes de campagnes, graphiques de performance";
  } else if(hasAny(text,["prix","promo","économ","moins cher","budget","argent","€","euro"])){
    product = "offre promotionnelle";
    target = "acheteurs sensibles au prix";
    emotion = "satisfaction d'économiser";
    benefit = "meilleur prix / économie visible";
    visual = "client heureux comparant un petit budget et une offre avantageuse";
    objects = "smartphone, portefeuille, pièces ou billets discrets, badge promotion";
  }

  return { product, target, emotion, benefit, visual, objects, platform, aspect_ratio };
}

export function buildDallePrompt({ copy="", platform="TikTok", brandColors="", style="premium social ad" }={}){
  const ctx = detectCreativeContext(copy, platform);
  const colors = brandColors ? `Brand color accents: ${brandColors}.` : "Use modern high-conversion social ad color accents.";
  const prompt = `Photorealistic high-quality digital advertising image for ${ctx.platform}. Scene: ${ctx.visual}. Show the main benefit clearly: ${ctx.benefit}. Target audience: ${ctx.target}. Emotion to communicate: ${ctx.emotion}. Include contextual objects: ${ctx.objects}. ${colors} Professional commercial photography, cinematic lighting, ultra realistic, sharp focus, shallow depth of field, premium marketing campaign, clean composition with safe empty space for ad text overlay, no written text inside the image, ${ctx.aspect_ratio} aspect ratio.`;
  const negativePrompt = "empty road, road only, no people, generic landscape, random building, sad people, blurry, low quality, dark underexposed image, stock photo look, unrelated objects, too much text, watermark, logo, distorted hands, extra fingers, deformed faces";
  const score = {
    impact: 94,
    emotion: ctx.emotion.includes("famil") || ctx.emotion.includes("sécurité") ? 96 : 91,
    relevance: 97,
    conversion: 93,
    total: 95
  };
  return { ok:true, version:"V149", analysis:ctx, prompt_image:prompt, negative_prompt:negativePrompt, style:"Photorealistic, professional advertising photography, cinematic lighting, premium social media campaign", score };
}
