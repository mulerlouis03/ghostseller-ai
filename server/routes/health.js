import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V117 USER FUNCTIONS REAL OUTPUT",
  phase:"Readable user outputs + profile identity",
  rawJsonHidden:true,
  contentCards:true,
  videoCards:true,
  leadsCards:true,
  whatsappCards:true,
  profileAvatar:true,
  profileName:true
}));
