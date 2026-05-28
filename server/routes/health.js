import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V62 REAL APIS AUTOMATION LAYER",
  phase:"External Automation Foundation",
  realAPIsLayer:true,
  metaConnector:true,
  tiktokConnector:true,
  linkedinConnector:true,
  whatsappConnector:true,
  webhookCenter:true,
  automationLogs:true,
  agentScheduler:true,
  externalActionsManager:true,
  note:"Official API credentials required before real publishing."
}));
