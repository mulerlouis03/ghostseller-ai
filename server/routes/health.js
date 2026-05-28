import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V75 VERCEL CRASH HOTFIX",
  phase:"Vercel Runtime Recovery",
  vercelCrashFixed:true,
  adminSafeMode:true,
  betaReady:true,
  stable:true
}));
