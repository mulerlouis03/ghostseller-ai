import express from "express";
import { requireAuth } from "../../lib/auth.js";

export const tiktokLaunchRouter = express.Router();

tiktokLaunchRouter.get("/tonight-plan", requireAuth, (_req,res)=>{
  res.json({
    ok:true,
    platform:"TikTok",
    goal:"Publier la première démo GhostSeller ce soir",
    plan:[
      "Ouvrir TikTok Engine",
      "Générer un hook + storyboard",
      "Faire une capture écran du SaaS qui génère la campagne",
      "Monter une vidéo courte 20-30 secondes",
      "Publier avec CTA : Comment AI pour une campagne gratuite",
      "Répondre aux commentaires avec une deuxième vidéo"
    ],
    first_video:{
      hook:"I gave a business to AI and it created a full campaign...",
      format:"screen recording + subtitles",
      duration:"20-30s",
      cta:"Comment AI for a free campaign preview",
      hashtags:["#aitools","#tiktokmarketing","#businessgrowth","#ghostsellerai"]
    }
  });
});
