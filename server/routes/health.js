import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V104.1 OWNER ROUTE FIXED",
  phase:"Owner route fixed for Vercel",
  ownerRouteFixed:true,
  ownerIndexStatic:true,
  adminIndexStatic:true,
  ownerUserSeparationStable:true
}));
