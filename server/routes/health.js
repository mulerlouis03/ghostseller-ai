import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V113 OWNER BILLING EXCLUSION",
  phase:"Owner removed from user list and paying customer stats",
  ownerExcludedFromUsers:true,
  ownerExcludedFromPayingUsers:true
}));
