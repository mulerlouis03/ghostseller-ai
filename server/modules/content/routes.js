import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";

export const contentRouter = express.Router();

const HOOKS = [
  "Nobody talks about this...",
  "This changes everything for small businesses.",
  "You’re losing customers because of this mistake.",
  "I tested this strategy for 7 days.",
  "Most creators fail because they ignore this.",
  "This trick gets attention instantly.",
  "Stop scrolling if you want more clients."
];

const PSYCHOLOGY = [
  "Curiosity",
  "Urgency",
  "Transformation",
  "Fear of missing out",
  "Authority",
  "Social proof",
  "Aspiration"
];

const EMOTIONS = [
  "Excitement",
  "Confidence",
  "Trust",
  "Curiosity",
  "Motivation",
  "Urgency"
];

function pick(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

function viralScore(){
  return Math.floor(78 + Math.random()*22);
}

function generateScenes(niche, goal){
  return [
    {
      scene:1,
      duration:"0-3s",
      purpose:"Hook",
      text:`Attention-grabbing intro for ${niche}.`,
      visual:"Fast moving visual with bold subtitle."
    },
    {
      scene:2,
      duration:"3-8s",
      purpose:"Problem",
      text:`Explain the main problem related to ${goal}.`,
      visual:"Show frustration/problem situation."
    },
    {
      scene:3,
      duration:"8-15s",
      purpose:"Solution",
      text:`Present the solution/business offer.`,
      visual:"Clean transformation or product showcase."
    },
    {
      scene:4,
      duration:"15-22s",
      purpose:"Proof",
      text:"Show testimonial, social proof or quick result.",
      visual:"Before/after or positive reaction."
    },
    {
      scene:5,
      duration:"22-30s",
      purpose:"CTA",
      text:"Invite user to DM or contact on WhatsApp.",
      visual:"Clear CTA with animated text."
    }
  ];
}

contentRouter.post("/generate", requireAuth, requireCredits(3,"posts"), async (req,res)=>{
  try{
    const {
      niche="Business",
      platform="TikTok",
      tone="viral",
      goal="Get more customers"
    } = req.body || {};

    const { data:history=[] } = await supabase
      .from("content_history")
      .select("niche,platform")
      .eq("user_id", req.user.id)
      .order("created_at",{ascending:false})
      .limit(20);

    const memoryNiches = [...new Set((history||[]).map(x=>x.niche).filter(Boolean))];

    const result = {
      id: crypto.randomUUID(),
      niche,
      platform,
      tone,
      goal,

      viral_score: viralScore(),
      psychological_angle: pick(PSYCHOLOGY),
      dominant_emotion: pick(EMOTIONS),

      hook: pick(HOOKS),

      tiktok_version: {
        title:`${niche} TikTok Strategy`,
        subtitle:"Short-form viral content",
        scenes: generateScenes(niche, goal)
      },

      instagram_version: {
        caption:`${niche}: Here is a smarter way to attract attention and convert followers into customers.`,
        carousel_idea:[
          "Problem",
          "Why most people fail",
          "Simple strategy",
          "Transformation",
          "Call to action"
        ]
      },

      whatsapp_version: {
        first_message:`Hey 👋 I wanted to show you a simple strategy that could help your ${niche.toLowerCase()} business attract more clients.`,
        follow_up:"Would you like me to show you an example campaign?"
      },

      hashtags:[
        "#marketing",
        "#business",
        "#viral",
        "#entrepreneur",
        "#growth"
      ],

      thumbnail_idea:"High contrast text + emotional face + short curiosity phrase.",

      cta:"DM now to get the strategy.",
      memory_context: memoryNiches
    };

    try{
      await supabase.from("content_history").insert({
        id: crypto.randomUUID(),
        user_id: req.user.id,
        type:"real_content_engine",
        niche,
        platform,
        prompt:goal,
        result,
        favorite:false,
        created_at:new Date().toISOString()
      });
    }catch(_e){}

    try{ await consumeUsage(req.user.id, req.usageCost || 3, req.usageType || "posts"); }catch(_e){}

    res.json({
      ok:true,
      result
    });

  }catch(error){
    res.status(500).json({
      error:error.message || "Generation failed."
    });
  }
});


// V133 — Real execution endpoints for social regeneration and AI background generation.
function v133PickProduct(text=""){
  const l=String(text).toLowerCase();
  if(l.includes("café")||l.includes("cafe")||l.includes("coffee")) return {product:"café", keyword:"CAFÉ", tags:["#cafe","#coffee","#haiti","#artisan"]};
  if(l.includes("nike")||l.includes("adidas")||l.includes("basket")||l.includes("chaussure")) return {product:"baskets", keyword:"BASKET", tags:["#sneakers","#nike","#adidas","#streetwear"]};
  if(l.includes("sac")) return {product:"sac à main", keyword:"INFO", tags:["#sac","#modefemme","#shopping","#tendance"]};
  if(l.includes("parfum")||l.includes("cosm")) return {product:"parfum / cosmétique", keyword:"BEAUTÉ", tags:["#parfum","#beaute","#cosmetique","#luxe"]};
  if(l.includes("montre")||l.includes("luxe")) return {product:"montre de luxe", keyword:"LUXE", tags:["#luxe","#montre","#premium","#style"]};
  return {product:"offre", keyword:"INFO", tags:["#business","#vente","#marketing","#offre"]};
}
function v133AngleLabel(angle){
  return ({base:"clair",ideas:"variantes",viral:"viral",emotion:"émotionnel",premium:"premium",aggressive:"direct",promo:"promotion"}[angle] || angle || "clair");
}
function v133FallbackPack(offer="", angle="base"){
  const meta=v133PickProduct(offer); const product=meta.product; const kw=meta.keyword; const label=v133AngleLabel(angle);
  const prefix = angle==="viral" ? "🔥" : angle==="premium" ? "💎" : angle==="emotion" ? "❤️" : angle==="aggressive" ? "⚡" : angle==="promo" ? "🏷️" : "✨";
  const facebook=`${prefix} ${product} disponible\n\n${offer}\n\nUne offre ${label} pensée pour attirer l’attention et donner envie de passer à l’action.\n\n✅ Simple à comprendre\n✅ Prêt à commander\n✅ Disponible maintenant\n\n📩 Écris “${kw}” pour recevoir les détails.`;
  const instagram=`${prefix} ${product}\n\n${offer}\n\nUn angle ${label} pour créer l’envie rapidement.\n\nDM “${kw}” pour les infos.\n\n${meta.tags.concat(["#viral","#reels","#tiktokfrance"]).join(" ")}`;
  const tiktok=`🎬 SCRIPT TIKTOK / REELS\n\nSCÈNE 1 — HOOK (0-2s)\nTexte écran : “${angle==="viral"?"POV : tu découvres l’offre que tout le monde va demander":"Tu cherchais une bonne offre ?"}”\n\nSCÈNE 2 — PRODUIT (2-6s)\nMontrer : ${product}.\nTexte écran : “${offer}”\n\nSCÈNE 3 — DÉSIR (6-12s)\nMontrer le produit en situation, gros plan, détails.\nVoix off : “Simple, utile et facile à aimer.”\n\nSCÈNE 4 — PREUVE (12-17s)\nMontrer 2 bénéfices clairs.\nTexte écran : “Disponible maintenant.”\n\nSCÈNE 5 — CTA (17-22s)\nTexte écran : “Écris ${kw} pour les infos.”\n\nCAPTION : ${offer}\nCTA : Commente ${kw} ou envoie un DM.`;
  const whatsapp=`Bonjour 👋\n\nJe te partage cette offre :\n\n${offer}\n\nC’est pensé pour les personnes qui veulent une solution simple et disponible maintenant.\n\n✅ Clair\n✅ Rapide\n✅ Facile à comprendre\n\nRéponds “${kw}” et je t’envoie les détails.`;
  const story=`📱 STORY / STATUT\n\n${product.toUpperCase()}\n${offer}\n\nTu veux les détails ?\nRéponds “${kw}” maintenant.`;
  const hashtags=meta.tags.concat(["#offre","#promotion","#clients","#business","#marketing","#vente","#reelsfrance","#tiktokfrance","#instagramfrance","#shopping","#tendance","#nouveaute"]).slice(0,30).join(" ");
  const hooks=Array.from({length:20},(_,i)=>`${i+1}. ${i%4===0?"Stop, cette offre peut t’intéresser." : i%4===1?`POV : tu découvres ${product} au bon moment.` : i%4===2?`Avant d’acheter ailleurs, regarde ça.`:`Tu veux les détails ? Écris ${kw}.`}`).join("\n");
  const cta=[`Écris ${kw} pour recevoir les détails.`,`Envoie-moi un DM maintenant.`,`Commente ${kw}.`,`Demande la disponibilité.`,`Réserve avant que ça parte.`,`Partage à quelqu’un que ça peut aider.`,`Clique pour en savoir plus.`,`Réponds OUI et je t’envoie tout.`,`Garde cette offre.`,`Passe commande maintenant.`].map((x,i)=>`${i+1}. ${x}`).join("\n");
  return {facebook,instagram,tiktok,whatsapp,story,hashtags,hooks,cta,angle:label,provider:"fallback_executed"};
}
async function v133OpenAIChatJSON(messages){
  if(!process.env.OPENAI_API_KEY) return null;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type":"application/json"},
    body:JSON.stringify({model:process.env.OPENAI_MODEL || "gpt-4o-mini", messages, temperature:0.85, response_format:{type:"json_object"}})
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data?.error?.message || "OpenAI content generation failed");
  const raw=data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

function v134Text(value){
  if(value == null) return "";
  if(Array.isArray(value)) return value.map(v134Text).filter(Boolean).join("\n");
  if(typeof value === "object"){
    return v134Text(value.content || value.text || value.body || value.caption || value.message || value.script || value.items || Object.entries(value).map(([k,v])=>`${k.toUpperCase()}\n${v134Text(v)}`).join("\n\n"));
  }
  return String(value);
}
function v134NormalizePack(raw){
  const p = raw && typeof raw === "object" ? raw : {};
  return {
    facebook: v134Text(p.facebook || p.fb || p.facebook_post),
    instagram: v134Text(p.instagram || p.instagram_post || p.ig),
    tiktok: v134Text(p.tiktok || p.tiktok_reels || p.reels || p.video_script),
    whatsapp: v134Text(p.whatsapp || p.whatsapp_message),
    story: v134Text(p.story || p.statut || p.status),
    hashtags: v134Text(p.hashtags),
    hooks: v134Text(p.hooks),
    cta: v134Text(p.cta || p.ctas)
  };
}
contentRouter.post("/social-pack", requireAuth, async (req,res)=>{
  const offer=String(req.body?.offer || req.body?.prompt || "").trim();
  const angle=String(req.body?.angle || "base").trim();
  if(!offer) return res.status(400).json({error:"Offre vide"});
  try{
    if(process.env.OPENAI_API_KEY){
      const json=await v133OpenAIChatJSON([
        {role:"system",content:"You are GhostSeller AI, a senior direct-response marketer. Return ONLY valid JSON in French. Never give instructions to the user; execute the task by writing ready-to-publish content."},
        {role:"user",content:JSON.stringify({task:"Create a complete ready-to-publish social media marketing pack",offer,angle,required_keys:["facebook","instagram","tiktok","whatsapp","story","hashtags","hooks","cta"],rules:["French language","specific to the offer","TikTok has 5 scenes with timing","WhatsApp is ready to send","hashtags as one string with 20-30 hashtags","hooks as numbered list of 20","cta as numbered list of 10","do not explain what to do"]})}
      ]);
      const fallback=v133FallbackPack(offer,angle);
      
      const normalized = v134NormalizePack(json);
      const cleaned = Object.fromEntries(Object.entries(normalized).filter(([_,v]) => String(v||'').trim()));
      return res.json({ok:true,provider:"openai",pack:{...fallback,...cleaned,provider:"openai"}});
    }
    return res.json({ok:true,provider:"fallback",pack:v134NormalizePack(v133FallbackPack(offer,angle))});
  }catch(e){
    return res.json({ok:true,provider:"fallback_after_error",warning:e.message,pack:v134NormalizePack(v133FallbackPack(offer,angle))});
  }
});
function v133BackgroundPrompt(offer=""){
  const l=String(offer).toLowerCase();
  let theme="premium product marketing scene";
  if(l.includes("café")||l.includes("cafe")||l.includes("coffee")) theme="premium roasted coffee beans, steaming black coffee cup, Haitian mountain coffee plantation atmosphere, subtle tropical leaves, warm cinematic highlights";
  else if(l.includes("haiti")||l.includes("haïti")||l.includes("haitien")) theme="subtle Haitian atmosphere, distant tropical beach, palm silhouettes, mountain horizon, discreet Haiti flag color accents, elegant diaspora mood";
  else if(l.includes("nike")||l.includes("adidas")||l.includes("basket")||l.includes("chaussure")) theme="dark urban sneaker campaign, wet asphalt, neon reflections, night city, dynamic sport energy";
  else if(l.includes("montre")||l.includes("luxe")||l.includes("bijou")) theme="luxury black marble, elegant watch display mood, gold reflections, mysterious premium shadows";
  else if(l.includes("parfum")||l.includes("cosm")||l.includes("beaut")) theme="abstract luxury perfume cosmetic background, smooth dark glass, soft mist, elegant reflections";
  else if(l.includes("sac")) theme="fashion handbag campaign, dark studio background, soft spotlight, premium retail atmosphere";
  return `Photorealistic 8K cinematic dark background for a marketing ad: ${theme}. Deep black gradient overlay, high contrast, soft cinematic lighting, clean negative space in the center for readable white advertising text. Negative prompt: no words, no letters, no logo, no watermark, no bright daylight, no overexposed colors, no clutter. Vertical social media composition.`;
}
function v133SvgDataUrl(offer=""){
  const l=String(offer).toLowerCase();
  let emoji="✨", label="Premium background";
  if(l.includes("café")||l.includes("cafe")||l.includes("coffee")){ emoji="☕"; label="Café premium Haïti"; }
  else if(l.includes("haiti")||l.includes("haïti")){ emoji="🇭🇹"; label="Ambiance Haïti sombre"; }
  else if(l.includes("basket")||l.includes("nike")||l.includes("adidas")){ emoji="👟"; label="Urban sport night"; }
  else if(l.includes("sac")){ emoji="👜"; label="Fashion dark studio"; }
  else if(l.includes("parfum")||l.includes("cosm")){ emoji="🧴"; label="Cosmétique luxe"; }
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920' viewBox='0 0 1080 1920'><defs><radialGradient id='g' cx='25%' cy='20%'><stop offset='0%' stop-color='#153f65'/><stop offset='45%' stop-color='#101735'/><stop offset='100%' stop-color='#05070f'/></radialGradient><linearGradient id='v' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#101827'/><stop offset='0.5' stop-color='#060913'/><stop offset='1' stop-color='#23103d'/></linearGradient><filter id='blur'><feGaussianBlur stdDeviation='32'/></filter></defs><rect width='1080' height='1920' fill='url(#v)'/><circle cx='210' cy='260' r='240' fill='#27c2ff' opacity='.24' filter='url(#blur)'/><circle cx='830' cy='1450' r='320' fill='#a855f7' opacity='.22' filter='url(#blur)'/><circle cx='770' cy='360' r='170' fill='#f59e0b' opacity='.10' filter='url(#blur)'/><g opacity='.15' fill='#fff'>${Array.from({length:34},(_,i)=>`<circle cx='${(i*139)%1080}' cy='${160+(i*271)%1600}' r='${3+(i%7)}'/>`).join('')}</g><text x='540' y='770' font-size='190' text-anchor='middle' opacity='.22'>${emoji}</text><rect x='105' y='1120' width='870' height='360' rx='48' fill='#030712' opacity='.36' stroke='#ffffff' stroke-opacity='.10'/><text x='540' y='1285' font-family='Arial, sans-serif' font-size='54' font-weight='700' fill='#ffffff' text-anchor='middle' opacity='.52'>${label}</text><text x='540' y='1365' font-family='Arial, sans-serif' font-size='30' fill='#c7d2fe' text-anchor='middle' opacity='.45'>Fond sombre prêt pour texte publicitaire</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
contentRouter.post("/background-image", requireAuth, async (req,res)=>{
  const offer=String(req.body?.offer || req.body?.prompt || "").trim();
  const imagePrompt=v133BackgroundPrompt(offer);
  try{
    if(process.env.OPENAI_API_KEY){
      const response=await fetch("https://api.openai.com/v1/images/generations",{
        method:"POST",
        headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
        body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt:imagePrompt, size:process.env.OPENAI_IMAGE_SIZE || "1024x1536", n:1})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data?.error?.message || "OpenAI image generation failed");
      const item=data?.data?.[0] || {};
      const imageUrl=item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
      if(imageUrl) return res.json({ok:true,provider:"openai",imageUrl,prompt:imagePrompt});
    }
    return res.json({ok:true,provider:"fallback_svg",imageUrl:v133SvgDataUrl(offer),prompt:imagePrompt});
  }catch(e){
    return res.json({ok:true,provider:"fallback_svg_after_error",warning:e.message,imageUrl:v133SvgDataUrl(offer),prompt:imagePrompt});
  }
});

// V200 CORE REBUILD — public-safe endpoints used by the repaired frontend buttons.
contentRouter.post('/v200/social-pack', async (req,res)=>{
  const offer=String(req.body?.offer || req.body?.prompt || '').trim();
  const angle=String(req.body?.angle || 'base').trim();
  if(!offer) return res.status(400).json({error:'Offre vide'});
  try{
    if(process.env.OPENAI_API_KEY){
      const json=await v133OpenAIChatJSON([
        {role:'system',content:'You are GhostSeller AI, a senior direct-response marketer. Return ONLY valid JSON in French. Never explain what to do; execute by writing ready-to-publish marketing copy.'},
        {role:'user',content:JSON.stringify({task:'Create a ready-to-publish social media marketing pack',offer,angle,required_keys:['facebook','instagram','tiktok','whatsapp','story','hashtags','hooks','cta'],rules:['French language','specific to the offer','TikTok has 5 scenes with timing','WhatsApp ready to send','hashtags one string with 20-30 hashtags','hooks numbered list of 20','cta numbered list of 10','no placeholder image URLs','do not include IMAGE or url_vers_image','do not give instructions']})}
      ]);
      const fallback=v133FallbackPack(offer,angle);
      const normalized=v134NormalizePack(json);
      const cleaned=Object.fromEntries(Object.entries(normalized).filter(([_,v])=>String(v||'').trim() && !String(v).includes('url_vers_image')));
      return res.json({ok:true,provider:'openai',pack:{...fallback,...cleaned,provider:'openai'}});
    }
    return res.json({ok:true,provider:'fallback',pack:v134NormalizePack(v133FallbackPack(offer,angle))});
  }catch(e){
    return res.json({ok:true,provider:'fallback_after_error',warning:e.message,pack:v134NormalizePack(v133FallbackPack(offer,angle))});
  }
});
contentRouter.post('/v200/background-image', async (req,res)=>{
  const offer=String(req.body?.offer || req.body?.prompt || '').trim();
  const imagePrompt=v133BackgroundPrompt(offer);
  try{
    if(process.env.OPENAI_API_KEY){
      const response=await fetch('https://api.openai.com/v1/images/generations',{
        method:'POST',
        headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1',prompt:imagePrompt,size:process.env.OPENAI_IMAGE_SIZE || '1024x1536',n:1})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data?.error?.message || 'OpenAI image generation failed');
      const item=data?.data?.[0] || {};
      const imageUrl=item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
      if(imageUrl) return res.json({ok:true,provider:'openai',imageUrl});
    }
    return res.json({ok:true,provider:'fallback_svg',imageUrl:v133SvgDataUrl(offer)});
  }catch(e){
    return res.json({ok:true,provider:'fallback_svg_after_error',warning:e.message,imageUrl:v133SvgDataUrl(offer)});
  }
});
