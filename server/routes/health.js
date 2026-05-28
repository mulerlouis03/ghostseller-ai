import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V73 SYSTEM EMAILS ONBOARDING",
  phase:"User Communication + Beta Onboarding",
  systemEmails:true,
  welcomeEmail:true,
  onboardingEmails:true,
  betaUserFlow:true,
  notificationCenter:true,
  emailLogs:true,
  publicBetaFoundation:true
}));
