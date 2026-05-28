import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V69 LANGUAGE CONTROL FIX",
  phase:"Multilingual UX Stabilization",
  languageControlFix:true,
  instantLanguageSwitch:true,
  languageDropdown:true,
  browserLanguageDetection:true,
  localStorageReset:true,
  dashboardLandingSync:true,
  futureSupabaseProfileLanguage:true
}));
