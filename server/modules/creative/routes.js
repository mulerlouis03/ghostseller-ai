import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";

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
