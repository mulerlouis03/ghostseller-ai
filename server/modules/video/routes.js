import express from "express";
import crypto from "crypto";
import { requireCredits, consumeUsage } from "../../middleware/usageLimits.js";

export const videoRouter = express.Router();

function buildStoryboard({ idea, platform, style, duration }) {
  const total = Number(duration || 30);
  return [
    {
      scene: 1,
      time: "0-3s",
      goal: "Stop scroll hook",
      visual: `Close-up or bold visual related to: ${idea}`,
      camera: "Fast push-in",
      subtitle: "Stop scrolling.",
      video_prompt: `Cinematic close-up, bold attention-grabbing opening, ${style} style, vertical 9:16`
    },
    {
      scene: 2,
      time: "3-8s",
      goal: "Problem",
      visual: "Show the pain point or frustration",
      camera: "Handheld quick cuts",
      subtitle: "Most businesses miss this.",
      video_prompt: `Show a business struggling to get attention, realistic, modern, ${style}, vertical video`
    },
    {
      scene: 3,
      time: "8-15s",
      goal: "Solution",
      visual: "Show the product, offer or transformation",
      camera: "Smooth transition",
      subtitle: "Here is the smarter way.",
      video_prompt: `Clean business transformation visual, premium marketing, ${style}, vertical 9:16`
    },
    {
      scene: 4,
      time: "15-23s",
      goal: "Proof",
      visual: "Show results, messages, happy customer or dashboard",
      camera: "Screen overlay + social proof",
      subtitle: "Results start with better content.",
      video_prompt: `Social proof, growth metrics, happy customer, clean interface, ${style}`
    },
    {
      scene: 5,
      time: `23-${total}s`,
      goal: "CTA",
      visual: "Clear CTA screen",
      camera: "Static clean closing",
      subtitle: "DM now or click the link.",
      video_prompt: `Clean call to action screen, bold typography, high contrast, ${style}, vertical`
    }
  ];
}

videoRouter.post("/pipeline", requireCredits(4,"posts"), async (req,res)=>{
  const {
    idea="Create a marketing reel",
    platform="TikTok",
    style="Viral Fast Cut",
    duration=30,
    audience="Business owners",
    goal="Generate leads"
  } = req.body || {};

  const storyboard = buildStoryboard({ idea, platform, style, duration });

  const result = {
    id: crypto.randomUUID(),
    platform,
    format:"Vertical 9:16",
    duration_seconds:Number(duration || 30),
    audience,
    goal,
    selected_style:style,

    production_summary:`A ${duration}s ${platform} video for ${audience}, designed to ${goal}.`,

    storyboard,

    voice_direction:{
      voice_type:"Confident, modern, clear",
      pace:"Fast but understandable",
      emotion:"Motivational",
      language:"Auto based on user market"
    },

    music_direction:{
      mood:"Energetic cinematic",
      tempo:"Medium-fast",
      recommendation:"Use trending audio if publishing on TikTok/Reels"
    },

    subtitles:{
      style:"Bold animated captions",
      position:"Center-lower",
      rules:[
        "Max 6 words per subtitle",
        "Highlight power words",
        "Use movement on hook and CTA"
      ]
    },

    editing_notes:[
      "Use fast cut in first 3 seconds",
      "Add sound effects on text impacts",
      "Use zoom transitions between scenes",
      "Keep CTA visible for at least 2 seconds"
    ],

    export_pack:{
      runway_prompt: storyboard.map(s=>s.video_prompt).join("\n---\n"),
      pika_prompt: storyboard.map(s=>`${s.time}: ${s.visual}`).join("\n"),
      kling_prompt:`Create a ${style} vertical marketing reel based on: ${idea}. Audience: ${audience}. Goal: ${goal}.`,
      editor_checklist:[
        "Create 5 vertical clips",
        "Add animated subtitles",
        "Add trending music",
        "Export 1080x1920",
        "Publish with CTA"
      ]
    }
  };

  res.json({ ok:true, result });
});
