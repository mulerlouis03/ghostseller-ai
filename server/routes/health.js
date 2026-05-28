import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V70 STABILITY AND PRODUCTION HARDENING",
  phase:"Production Stabilization",
  stabilityMode:true,
  saferAuth:true,
  protectedApi:true,
  rateLimiting:true,
  improvedErrors:true,
  frontendRecovery:true,
  productionReadyFoundation:true
}));
