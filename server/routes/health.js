import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V104 OWNER USER SEPARATION STABLE",
  phase:"Strict Owner/User Separation",
  ownerAutoRedirect:true,
  ownerConsoleStable:true,
  singleLogout:true,
  clientOwnerHidden:true
}));
