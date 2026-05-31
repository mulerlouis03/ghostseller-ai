import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V120 AI EMPLOYEE ENGINE",
  phase:"AI employee outputs instead of advice",
  employeeMode:true,
  readyToPublishContent:true,
  completeVideoScript:true,
  leadsActionPlan:true,
  whatsappSequences:true,
  rawJsonHidden:true,
  profileReady:true
}));
