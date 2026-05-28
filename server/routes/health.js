import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V77 SOCIAL CONNECTORS STABLE",
  phase:"Official Social Integrations Foundation",
  socialConnectors:true,
  metaReady:true,
  tiktokReady:true,
  linkedinReady:true,
  whatsappReady:true,
  oauthUrls:true,
  connectedAccounts:true,
  publishQueue:true,
  safeMode:true,
  note:"Real publishing requires official API credentials and platform approvals."
}));
