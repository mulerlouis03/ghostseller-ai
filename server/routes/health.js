import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V125 MODE EMPLOYE IA",
  phase:"AI employee mode outputs",
  employeeMode:true,
  noConsultantMode:true,
  readyToPublishContent:true,
  whatsappAds:true,
  leadsActionPack:true,
  videoScriptHonest:true,
  compactUpload:true
}));
