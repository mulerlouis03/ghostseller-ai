import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V93 PUBLIC LAUNCH READY",
  phase:"Public Trust + Legal Pages",
  basedOn:"V92 stable",
  publicLaunchReady:true,
  privacyPage:true,
  termsPage:true,
  contactPage:true,
  tiktokDeveloperReady:true,
  stripeTrustReady:true
}));
