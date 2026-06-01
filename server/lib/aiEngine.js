import { supabase } from "./supabase.js";

export function aiConfigured(){
  return Boolean(process.env.OPENAI_API_KEY);
}

async function callOpenAI(messages, responseFormat="json_object"){
  if(!process.env.OPENAI_API_KEY){
    return null;
  }

  const body = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages,
    temperature: 0.8
  };

  if(responseFormat){
    body.response_format = { type: responseFormat };
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  });

  const data = await response.json().catch(()=>({}));

  if(!response.ok){
    throw new Error(data?.error?.message || "OpenAI request failed.");
  }

  const content = data?.choices?.[0]?.message?.content || "{}";

  try{
    return JSON.parse(content);
  }catch(_e){
    return { raw:content };
  }
}

export async function loadAIMemory(userId){
  const [history, persistent, opportunities] = await Promise.all([
    supabase.from("content_history").select("niche,platform,type,result,created_at").eq("user_id", userId).order("created_at",{ascending:false}).limit(10),
    supabase.from("persistent_memory").select("niche,platform,hook,cta,strategy,performance_score").eq("user_id", userId).order("performance_score",{ascending:false}).limit(10),
    supabase.from("opportunity_items").select("niche,market,score,analysis").eq("user_id", userId).order("score",{ascending:false}).limit(5)
  ]);

  return {
    recent_content:history.data || [],
    best_memory:persistent.data || [],
    opportunities:opportunities.data || []
  };
}

function fallbackContent({ niche, platform, goal, language }){
  const lang = language || "fr";

  const base = {
    niche,
    platform,
    goal,
    viral_score:86,
    hook: lang === "en"
      ? `Stop scrolling — this can help your ${niche} grow faster.`
      : `Stoppe tout — ceci peut aider ton business ${niche} à grandir plus vite.`,
    psychological_angle:"Curiosity + transformation",
    dominant_emotion:"Confidence",
    scenes:[
      { scene:1, time:"0-3s", role:"Hook", text:"Stop scrolling.", visual:"Fast zoom + bold subtitle" },
      { scene:2, time:"3-8s", role:"Problem", text:`Most ${niche} brands post without a strategy.`, visual:"Show frustration/problem" },
      { scene:3, time:"8-15s", role:"Solution", text:"Use AI to create better campaigns faster.", visual:"Show AI dashboard / workflow" },
      { scene:4, time:"15-23s", role:"Proof", text:"Better hooks, CTA and content plan.", visual:"Before/after campaign" },
      { scene:5, time:"23-30s", role:"CTA", text:"DM now for a free preview.", visual:"Clear CTA screen" }
    ],
    instagram_caption:`${niche}: transforme ton contenu en clients avec une stratégie IA plus claire.`,
    whatsapp_message:`Salut 👋 j’ai une idée simple pour aider ton business ${niche} à attirer plus de clients avec l’IA. Tu veux voir un exemple ?`,
    hashtags:["#ai","#marketing","#business","#growth","#content"],
    cta:"DM now for a free AI campaign preview.",
    thumbnail_prompt:"High contrast, emotional face, bold text, blue/purple AI glow."
  };

  return base;
}

export async function generateMarketingContent({ user, niche="business", platform="TikTok", goal="get more leads", tone="premium", language="fr" }){
  const memory = await loadAIMemory(user.id);

  const system = `You are GhostSeller AI, a senior AI marketing strategist.
Return ONLY valid JSON.
Create practical, high-converting marketing content.
Language: ${language}.
Use user memory when useful.
Avoid fake claims.`;

  const userPrompt = {
    task:"Generate a real marketing campaign content pack",
    niche,
    platform,
    goal,
    tone,
    memory,
    required_output:{
      viral_score:"number 0-100",
      hook:"strong short hook",
      psychological_angle:"marketing psychology angle",
      dominant_emotion:"emotion",
      scenes:"5 short video scenes with time, role, text, visual",
      instagram_caption:"caption",
      whatsapp_message:"sales/lead message",
      hashtags:"array",
      cta:"call to action",
      thumbnail_prompt:"thumbnail visual prompt",
      improvement_advice:"how to improve result"
    }
  };

  if(!aiConfigured()){
    return {
      ok:true,
      provider:"fallback",
      result:fallbackContent({ niche, platform, goal, language }),
      memory_used:memory
    };
  }

  const result = await callOpenAI([
    { role:"system", content:system },
    { role:"user", content:JSON.stringify(userPrompt) }
  ]);

  return {
    ok:true,
    provider:"openai",
    result,
    memory_used:memory
  };
}

export async function generateCreativeDirections({ description="", language="fr" }){
  const system = `You are GhostSeller AI Creative Director. Return only valid JSON. Language: ${language}.`;
  const prompt = {
    task:"Create 4 creative directions for a reel/ad",
    description,
    output:["style","mood","editing","music","color_palette","hook","why_it_can_work"]
  };

  if(!aiConfigured()){
    return {
      provider:"fallback",
      concepts:[
        { style:"Luxury Minimal", mood:"Premium", editing:"slow cinematic cuts", music:"ambient", color_palette:"black/white/gold", hook:`A premium angle for: ${description}`, why_it_can_work:"Builds trust and status." },
        { style:"Viral Fast Cut", mood:"High energy", editing:"fast cuts", music:"trending beat", color_palette:"neon", hook:`Stop scrolling — ${description}`, why_it_can_work:"Strong attention pattern." },
        { style:"Storytelling Emotion", mood:"Emotional", editing:"narrative", music:"piano", color_palette:"warm", hook:`The story behind ${description}`, why_it_can_work:"Creates connection." },
        { style:"Corporate Clean", mood:"Professional", editing:"smooth", music:"modern corporate", color_palette:"blue/white", hook:`A smarter way to approach ${description}`, why_it_can_work:"Good for B2B trust." }
      ]
    };
  }

  const result = await callOpenAI([
    { role:"system", content:system },
    { role:"user", content:JSON.stringify(prompt) }
  ]);

  return { provider:"openai", ...result };
}
