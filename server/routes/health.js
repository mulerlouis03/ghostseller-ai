import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V104.2 OWNER DEDUP LOGOUT FIXED",
  phase:"Owner duplicate user fixed + single logout",
  ownerDedup:true,
  ownerPlanFixed:true,
  singleOwnerLogout:true,
  ownerConsoleStable:true
}));
