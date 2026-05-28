import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V73 LOGIN API HOTFIX",
  phase:"Login/API Recovery",
  loginFixed:true,
  apiBootFixed:true,
  systemEmails:true,
  onboarding:true,
  stable:true
}));
