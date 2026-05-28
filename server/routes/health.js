import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V57 ULTRA PREMIUM CYBER UI",
  phase:"Ultra Premium Cyber Interface",
  cyberUI:true,
  neonDesign:true,
  glassmorphism:true,
  premiumLogin:true,
  premiumDashboard:true,
  socialAppsBackground:true,
  stableBase:true
}));
