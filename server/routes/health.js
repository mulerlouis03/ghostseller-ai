import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V81 TIKTOK ENGINE STABLE",
  phase:"TikTok First Growth Engine",
  basedOn:"V80 stable",
  tiktokEngine:true,
  safeModule:true
}));
