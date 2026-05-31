import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V118 OWNER IDENTITY",
  phase:"Owner identity separated from users",
  ownerCard:true,
  ownerCreditsUnlimited:true,
  ownerStripeExempt:true,
  ownerExcludedFromUsers:true,
  ownerExcludedFromPaidStats:true
}));
