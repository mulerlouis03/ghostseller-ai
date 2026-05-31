import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V123 MOBILE SAAS UX",
  phase:"Remove duplicated home actions + mobile first workspace",
  duplicateHomeCardsRemoved:true,
  attachmentInsideTextarea:true,
  mobileFirst:true,
  cleanerHome:true
}));
