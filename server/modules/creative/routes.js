import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";
import { buildDallePrompt } from "./director.js";

export const creativeRouter = express.Router();

const STYLES = [
  {
    name:"Luxury Minimal",
    mood:"Premium",
    editing:"Slow cinematic cuts",
    music:"Ambient luxury music",
    color:"Black / White / Gold"
  },
  {
    name:"Viral Fast Cut",
    mood:"High dopamine",
    editing:"Fast transitions",
    music:"Trending energetic beat",
    color:"Bright contrast"
  },
  {
    name:"Storytelling Emotion",
    mood:"Emotional",
    editing:"Narrative scenes",
    music:"Emotional piano",
    color:"Warm cinematic"
  },
  {
    name:"Corporate Clean",
    mood:"Professional",
    editing:"Smooth transitions",
    music:"Modern corporate beat",
    color:"Blue / White"
  }
];

creativeRouter.post("/analyze",(req,res)=>{
  const { description="" } = req.body || {};

  const concepts = STYLES.map((style, index)=>({
    id:index+1,
    style:style.name,
    mood:style.mood,
    editing:style.editing,
    music:style.music,
    color_palette:style.color,
    hook:`${style.name} hook for: ${description}`,
    thumbnail:`Thumbnail idea using ${style.color}`
  }));

  res.json({
    ok:true,
    detected_intent:"Marketing video / reel",
    concepts
  });
});



creativeRouter.post("/director", requireAuth, requireCredits(1,"posts"), async (req,res)=>{
  const { copy="", platform="TikTok", brandColors="", style="premium social ad" } = req.body || {};
  const result = buildDallePrompt({ copy, platform, brandColors, style });
  try{ await consumeUsage(req.user.id, req.usageCost || 1, req.usageType || "posts"); }catch(_e){}
  res.json(result);
});

creativeRouter.post("/generate-image", requireAuth, requireCredits(3,"posts"), async (req,res)=>{
  const { copy="", platform="TikTok", brandColors="", style="premium social ad" } = req.body || {};
  const director = buildDallePrompt({ copy, platform, brandColors, style });
  try{
    if(process.env.OPENAI_API_KEY){
      const size = director.analysis.aspect_ratio === "9:16" ? "1024x1536" : director.analysis.aspect_ratio === "1.91:1" ? "1536x1024" : "1024x1024";
      const response = await fetch("https://api.openai.com/v1/images/generations",{
        method:"POST",
        headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},
        body:JSON.stringify({ model:process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt:director.prompt_image, size, n:1 })
      });
      const data = await response.json().catch(()=>({}));
      if(!response.ok) throw new Error(data?.error?.message || "OpenAI image generation failed");
      const item = data?.data?.[0] || {};
      const imageUrl = item.url || (item.b64_json ? `data:image/png;base64,${item.b64_json}` : null);
      try{ await consumeUsage(req.user.id, req.usageCost || 3, req.usageType || "posts"); }catch(_e){}
      return res.json({ ...director, provider:"openai", imageUrl });
    }
    return res.json({ ...director, provider:"prompt_only", warning:"OPENAI_API_KEY missing: prompt generated but image not created." });
  }catch(e){
    return res.json({ ...director, provider:"prompt_after_error", warning:e.message });
  }
});

creativeRouter.post("/generate", requireAuth, requireCredits(2,"posts"), async (req,res)=>{
  const {
    description="",
    selected_style="Luxury Minimal",
    platform="TikTok"
  } = req.body || {};

  const result = {
    id: crypto.randomUUID(),
    description,
    selected_style,
    platform,

    hook:"This changes everything for your business.",

    scenes:[
      {
        scene:1,
        duration:"0-3s",
        purpose:"Hook",
        visual:"Fast attention grabbing intro",
        subtitle:"Stop scrolling."
      },
      {
        scene:2,
        duration:"3-8s",
        purpose:"Problem",
        visual:"Show pain/problem",
        subtitle:"Most businesses struggle to get attention."
      },
      {
        scene:3,
        duration:"8-15s",
        purpose:"Solution",
        visual:"Show offer or transformation",
        subtitle:"Here is the smarter strategy."
      },
      {
        scene:4,
        duration:"15-22s",
        purpose:"Social Proof",
        visual:"Show reactions/testimonials",
        subtitle:"People love this."
      },
      {
        scene:5,
        duration:"22-30s",
        purpose:"CTA",
        visual:"Call to action",
        subtitle:"DM now."
      }
    ],

    transitions:[
      "Zoom cut",
      "Motion blur",
      "Text punch",
      "Flash transition"
    ],

    subtitles_style:"Bold animated captions",

    voice_over:{
      tone:"Confident",
      speed:"Fast",
      emotion:"Motivational"
    },

    soundtrack:"Trending cinematic beat",

    hashtags:[
      "#viral",
      "#marketing",
      "#business",
      "#reels",
      "#tiktok"
    ],

    video_prompt:`Create a ${selected_style} ${platform} marketing video based on: ${description}`,

    thumbnail_prompt:"High contrast face + bold text + emotional expression",

    cta:"DM now to learn more."
  };

  try{ await consumeUsage(req.user.id, req.usageCost || 2, req.usageType || "posts"); }catch(_e){}

  res.json({
    ok:true,
    result
  });
});
