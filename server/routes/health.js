import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V68 MULTILINGUAL SAAS SWITCHER",
  phase:"Global Multilingual SaaS",
  multilingual:true,
  languagePopup:true,
  english:true,
  french:true,
  spanish:true,
  portuguese:true,
  localLanguageStorage:true,
  globalSaaSReady:true
}));
