import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V126 PROMPT INTELLIGENCE FIX",
  promptAware:true,
  noForcedKartayiti:true,
  covoiturageSupported:true
}));
